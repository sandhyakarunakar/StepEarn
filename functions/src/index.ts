/**
 * StepEarn Cloud Functions (2nd gen)
 * Production backend handling all coin transactions, step validations, and redemptions.
 * Source of truth for all balances.
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { GoogleGenAI } from '@google/genai';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Milestone distribution mapping (cumulative & incremental)
const MILESTONE_AWARDS: Record<number, number> = {
  1000: 1, 2000: 1, 3000: 1, 4000: 1, 5000: 1,
  6000: 1, 7000: 1, 8000: 1, 9000: 2, 10000: 1,
  11000: 2, 12000: 1, 13000: 2, 14000: 1, 15000: 2,
  16000: 1, 17000: 1, 18000: 1, 19000: 1, 20000: 2,
};

/**
 * 1. claimStepMilestone
 * Re-validates user's step count against stepRecords document
 * Checks for idempotency and step limits before atomically updating coinBalance and transaction ledger.
 */
export const claimStepMilestone = onCall({ cors: true }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { date, stepThreshold } = request.data as { date: string; stepThreshold: number };
  if (!date || !stepThreshold) {
    throw new HttpsError('invalid-argument', 'Missing date or stepThreshold');
  }

  const coinReward = MILESTONE_AWARDS[stepThreshold];
  if (!coinReward) {
    throw new HttpsError('invalid-argument', `Invalid milestone threshold: ${stepThreshold}`);
  }

  const stepDocRef = db.doc(`stepRecords/${uid}/days/${date}`);
  const userDocRef = db.doc(`users/${uid}`);
  const txCollectionRef = db.collection(`transactions/${uid}/entries`);

  return db.runTransaction(async (transaction) => {
    const stepSnap = await transaction.get(stepDocRef);
    if (!stepSnap.exists) {
      throw new HttpsError('not-found', 'No step records found for date');
    }

    const stepData = stepSnap.data() || {};
    const recordedSteps = stepData.steps || 0;
    const claimedMilestones: number[] = stepData.claimedMilestones || [];

    // Validation: has user really walked these steps?
    if (recordedSteps < stepThreshold) {
      throw new HttpsError('failed-precondition', `Recorded steps (${recordedSteps}) below milestone (${stepThreshold})`);
    }

    // Idempotency: already claimed?
    if (claimedMilestones.includes(stepThreshold)) {
      throw new HttpsError('already-exists', 'Milestone already claimed');
    }

    const userSnap = await transaction.get(userDocRef);
    const userData = userSnap.data() || {};
    const currentBalance = userData.coinBalance || 0;
    const newBalance = currentBalance + coinReward;

    // 1. Update step record claimed list
    transaction.update(stepDocRef, {
      claimedMilestones: admin.firestore.FieldValue.arrayUnion(stepThreshold),
    });

    // 2. Update user coin balance
    transaction.update(userDocRef, {
      coinBalance: newBalance,
    });

    // 3. Append immutable transaction entry
    const newTxRef = txCollectionRef.doc();
    transaction.set(newTxRef, {
      type: 'milestone_claim',
      amount: coinReward,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      relatedId: `${date}_${stepThreshold}`,
      description: `Reached ${stepThreshold.toLocaleString()} steps milestone`,
    });

    return {
      success: true,
      coinsAwarded: coinReward,
      newBalance,
      claimedMilestone: stepThreshold,
    };
  });
});

/**
 * 2. convertDailySteps
 * End-of-day bulk safety net for claiming any remaining unclaimed milestones.
 */
export const convertDailySteps = onCall({ cors: true }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { date } = request.data as { date: string };
  if (!date) {
    throw new HttpsError('invalid-argument', 'Missing date');
  }

  const stepDocRef = db.doc(`stepRecords/${uid}/days/${date}`);
  const userDocRef = db.doc(`users/${uid}`);
  const txCollectionRef = db.collection(`transactions/${uid}/entries`);

  return db.runTransaction(async (transaction) => {
    const stepSnap = await transaction.get(stepDocRef);
    if (!stepSnap.exists) {
      throw new HttpsError('not-found', 'No step records found for date');
    }

    const stepData = stepSnap.data() || {};
    const recordedSteps = stepData.steps || 0;
    const claimedMilestones: number[] = stepData.claimedMilestones || [];

    // Find all milestones user qualifies for that haven't been claimed yet
    const thresholds = Object.keys(MILESTONE_AWARDS)
      .map(Number)
      .sort((a, b) => a - b);

    const unclaimedQualifying = thresholds.filter(
      (th) => recordedSteps >= th && !claimedMilestones.includes(th)
    );

    if (unclaimedQualifying.length === 0) {
      return {
        success: true,
        coinsAwarded: 0,
        message: 'All eligible milestones for today have already been claimed',
      };
    }

    let totalNewCoins = 0;
    for (const th of unclaimedQualifying) {
      totalNewCoins += MILESTONE_AWARDS[th];
    }

    const userSnap = await transaction.get(userDocRef);
    const currentBalance = (userSnap.data() || {}).coinBalance || 0;
    const newBalance = currentBalance + totalNewCoins;

    // Update steps
    transaction.update(stepDocRef, {
      claimedMilestones: admin.firestore.FieldValue.arrayUnion(...unclaimedQualifying),
    });

    // Update user balance
    transaction.update(userDocRef, {
      coinBalance: newBalance,
    });

    // Append transaction
    const newTxRef = txCollectionRef.doc();
    transaction.set(newTxRef, {
      type: 'milestone_claim',
      amount: totalNewCoins,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      relatedId: `${date}_bulk_convert`,
      description: `Converted ${unclaimedQualifying.length} daily step milestones`,
    });

    return {
      success: true,
      coinsAwarded: totalNewCoins,
      newBalance,
      claimedCount: unclaimedQualifying.length,
    };
  });
});

/**
 * 3. redeemReward
 * Atomically validates balance, checks stock/pool, debits coins, and writes pending redemption doc.
 */
export const redeemReward = onCall({ cors: true }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { rewardId, payoutDetails } = request.data as {
    rewardId: string;
    payoutDetails: Record<string, any>;
  };

  if (!rewardId || !payoutDetails) {
    throw new HttpsError('invalid-argument', 'Missing rewardId or payoutDetails');
  }

  const rewardRef = db.doc(`redeemOptions/${rewardId}`);
  const userRef = db.doc(`users/${uid}`);
  const redemptionsRef = db.collection('redemptions');
  const txCollectionRef = db.collection(`transactions/${uid}/entries`);

  return db.runTransaction(async (transaction) => {
    const [rewardSnap, userSnap] = await Promise.all([
      transaction.get(rewardRef),
      transaction.get(userRef),
    ]);

    if (!rewardSnap.exists) {
      throw new HttpsError('not-found', 'Reward item not found');
    }

    const reward = rewardSnap.data()!;
    const user = userSnap.data() || {};
    const coinCost = reward.coinCost;
    const userBalance = user.coinBalance || 0;

    if (userBalance < coinCost) {
      throw new HttpsError('failed-precondition', 'Insufficient coin balance');
    }

    if (reward.quantityAvailable <= 0) {
      throw new HttpsError('resource-exhausted', 'Reward is out of stock');
    }

    if (reward.isPremiumOnly && !user.isPremium) {
      throw new HttpsError('permission-denied', 'This reward is reserved for Premium members');
    }

    // Debit coins
    const newBalance = userBalance - coinCost;
    transaction.update(userRef, {
      coinBalance: newBalance,
    });

    // Update inventory
    transaction.update(rewardRef, {
      quantityAvailable: admin.firestore.FieldValue.increment(-1),
      beneficiaryCount: admin.firestore.FieldValue.increment(1),
      distributedAmount: admin.firestore.FieldValue.increment(Number(reward.cashValue?.replace(/[^0-9.]/g, '')) || 15),
    });

    // Create redemption record
    const redemptionDoc = redemptionsRef.doc();
    transaction.set(redemptionDoc, {
      uid,
      rewardId,
      rewardTitle: reward.title,
      coinCost,
      cashValue: reward.cashValue,
      status: 'pending',
      payoutDetails,
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Append to transactions ledger
    const txDoc = txCollectionRef.doc();
    transaction.set(txDoc, {
      type: 'redemption_debit',
      amount: -coinCost,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      relatedId: redemptionDoc.id,
      description: `Redeemed ${reward.title} (${reward.cashValue})`,
    });

    // Payment provider integration stub
    // processPayout(redemptionDoc.id, payoutDetails, reward.cashValue);

    return {
      success: true,
      redemptionId: redemptionDoc.id,
      newBalance,
      status: 'pending',
    };
  });
});

/**
 * 4. trackReferralActivity
 * Daily scheduled function (or on-demand trigger) to check active referrals,
 * track 3 consecutive active days, and credit 10 coins.
 */
export const trackReferralActivity = onSchedule('every 24 hours', async (event) => {
  const activeReferralsSnap = await db
    .collection('referrals')
    .where('rewardClaimed', '==', false)
    .get();

  const today = new Date().toISOString().split('T')[0];

  for (const refDoc of activeReferralsSnap.docs) {
    const data = refDoc.data();
    const referredUserId = data.referredUserId;
    const referrerId = data.referrerId;

    // Check if referred user walked >= 1,000 qualifying steps today
    const stepDoc = await db.doc(`stepRecords/${referredUserId}/days/${today}`).get();
    const stepsToday = (stepDoc.data() || {}).steps || 0;

    let newConsecutive = data.consecutiveActiveDays || 0;
    if (stepsToday >= 1000) {
      newConsecutive += 1;
    } else {
      // missed a day -> reset
      newConsecutive = 0;
    }

    if (newConsecutive >= 3) {
      // Qualifies! Credit 10 coins to referrer
      await db.runTransaction(async (transaction) => {
        const referrerUserRef = db.doc(`users/${referrerId}`);
        const refUserSnap = await transaction.get(referrerUserRef);
        const curCoins = (refUserSnap.data() || {}).coinBalance || 0;

        transaction.update(referrerUserRef, {
          coinBalance: curCoins + 10,
        });

        transaction.update(refDoc.ref, {
          consecutiveActiveDays: 3,
          rewardClaimed: true,
        });

        const txRef = db.collection(`transactions/${referrerId}/entries`).doc();
        transaction.set(txRef, {
          type: 'referral_reward',
          amount: 10,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          relatedId: referredUserId,
          description: `Referral bonus: ${data.referredName} walked 3 consecutive days!`,
        });
      });
    } else {
      await refDoc.ref.update({
        consecutiveActiveDays: newConsecutive,
      });
    }
  }
});

/**
 * 5. awardAdReward
 * Server-authoritative ad watch reward function
 */
export const awardAdReward = onCall({ cors: true }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Must be authenticated');
  }

  const userRef = db.doc(`users/${uid}`);
  const txRef = db.collection(`transactions/${uid}/entries`).doc();

  return db.runTransaction(async (transaction) => {
    const userSnap = await transaction.get(userRef);
    const curBalance = (userSnap.data() || {}).coinBalance || 0;
    const rewardAmount = 10;

    transaction.update(userRef, {
      coinBalance: curBalance + rewardAmount,
    });

    transaction.set(txRef, {
      type: 'ad_reward',
      amount: rewardAmount,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      description: 'Watched sponsored fitness video',
    });

    return {
      success: true,
      coinsAwarded: rewardAmount,
      newBalance: curBalance + rewardAmount,
    };
  });
});

/**
 * 6. chatWithCoach
 * Gemini AI walking assistant with system instruction and context
 */
export const chatWithCoach = onCall({ cors: true }, async (request) => {
  const { messages, userContext } = request.data as {
    messages: { role: string; content: string }[];
    userContext: { stepsToday: number; streak: number; coinBalance: number };
  };

  const ai = new GoogleGenAI();
  const systemInstruction = `You are StepEarn Coach, a friendly walking and fitness assistant embedded inside the StepEarn app. You ONLY answer questions related to: walking, step counts, daily step goals, general fitness/exercise tips, calories burned from walking, stretching/warm-ups for walking, posture and footwear for walking, motivation for building a walking habit, and how the StepEarn app's coin/reward/step-conversion system works. If the user asks about anything outside these topics, politely decline and redirect them back to walking/fitness topics in one short sentence. Keep answers concise, encouraging, and mobile-friendly. Never give specific medical diagnoses — for injuries or medical concerns, advise seeing a doctor.
Current user live context:
- Steps today: ${userContext?.stepsToday || 0}
- Daily streak: ${userContext?.streak || 0} days
- Coin Balance: ${userContext?.coinBalance || 0} StepEarn Coins`;

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
    config: {
      systemInstruction,
      temperature: 0.7,
      maxOutputTokens: 300,
    },
  });

  return {
    reply: response.text,
  };
});

/**
 * 7. onUserStepWrite
 * Anti-cheat sanity checks
 */
export const onUserStepWrite = onDocumentWritten('stepRecords/{uid}/days/{date}', (event) => {
  const data = event.data?.after?.data();
  if (!data) return;
  // Flag impossible jump (e.g. > 70,000 steps in a day)
  if (data.steps > 70000) {
    console.warn(`[Anti-Fraud] Implausible steps detected for user ${event.params.uid}: ${data.steps}`);
  }
});
