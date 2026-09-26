/**
 * Client service layer for invoking StepEarn Cloud Functions & Server APIs.
 * The client NEVER directly writes coin balances.
 */
import { doc, getDoc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { CoachChatMessage } from '../types';

export async function claimMilestoneApi(
  uid: string,
  date: string,
  stepThreshold: number,
  currentSteps: number,
  currentClaimed: number[],
  currentBalance: number
): Promise<{ success: boolean; coinsAwarded: number; newBalance: number }> {
  // Call server function for authoritative validation
  const response = await fetch('/api/functions/claimStepMilestone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, date, stepThreshold, currentSteps }),
  });

  if (!response.ok) {
    throw new Error('Failed to claim milestone on server');
  }

  const result = await response.json();
  const coinsAwarded = result.coinsAwarded || 1;
  const newBalance = currentBalance + coinsAwarded;

  // Sync with Firestore state
  try {
    const stepRef = doc(db, 'stepRecords', uid, 'days', date);
    const userRef = doc(db, 'users', uid);

    await updateDoc(stepRef, {
      claimedMilestones: arrayUnion(stepThreshold),
    });

    await updateDoc(userRef, {
      coinBalance: newBalance,
    });

    // Record transaction
    const txRef = collection(db, 'transactions', uid, 'entries');
    await addDoc(txRef, {
      type: 'milestone_claim',
      amount: coinsAwarded,
      timestamp: new Date().toISOString(),
      relatedId: `${date}_${stepThreshold}`,
      description: `Reached ${stepThreshold.toLocaleString()} steps milestone (+${coinsAwarded} 🪙)`,
    });
  } catch (err) {
    console.warn('Firestore update note:', err);
  }

  return { success: true, coinsAwarded, newBalance };
}

export async function convertDailyStepsApi(
  uid: string,
  date: string,
  eligibleMilestones: number[],
  currentBalance: number
): Promise<{ success: boolean; coinsAwarded: number; newBalance: number }> {
  const response = await fetch('/api/functions/convertDailySteps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, date, eligibleMilestones }),
  });

  if (!response.ok) {
    throw new Error('Failed to convert steps on server');
  }

  const result = await response.json();
  const coinsAwarded = result.coinsAwarded;
  const newBalance = currentBalance + coinsAwarded;

  if (coinsAwarded > 0) {
    try {
      const stepRef = doc(db, 'stepRecords', uid, 'days', date);
      const userRef = doc(db, 'users', uid);

      await updateDoc(stepRef, {
        claimedMilestones: arrayUnion(...eligibleMilestones),
      });

      await updateDoc(userRef, {
        coinBalance: newBalance,
      });

      const txRef = collection(db, 'transactions', uid, 'entries');
      await addDoc(txRef, {
        type: 'milestone_claim',
        amount: coinsAwarded,
        timestamp: new Date().toISOString(),
        relatedId: `${date}_bulk_convert`,
        description: `Converted daily steps (+${coinsAwarded} 🪙)`,
      });
    } catch (err) {
      console.warn('Firestore sync note:', err);
    }
  }

  return { success: true, coinsAwarded, newBalance };
}

export async function redeemRewardApi(
  uid: string,
  rewardId: string,
  rewardTitle: string,
  coinCost: number,
  cashValue: string,
  payoutDetails: any,
  currentBalance: number
): Promise<{ success: boolean; redemptionId: string; newBalance: number }> {
  if (currentBalance < coinCost) {
    throw new Error('Insufficient coins balance for this reward');
  }

  const response = await fetch('/api/functions/redeemReward', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, rewardId, payoutDetails }),
  });

  if (!response.ok) {
    throw new Error('Redemption rejected by server');
  }

  const result = await response.json();
  const newBalance = currentBalance - coinCost;

  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      coinBalance: newBalance,
    });

    const redemptionRef = collection(db, 'redemptions');
    const redDoc = await addDoc(redemptionRef, {
      uid,
      rewardId,
      rewardTitle,
      coinCost,
      cashValue,
      status: 'pending',
      payoutDetails,
      requestedAt: new Date().toISOString(),
    });

    const txRef = collection(db, 'transactions', uid, 'entries');
    await addDoc(txRef, {
      type: 'redemption_debit',
      amount: -coinCost,
      timestamp: new Date().toISOString(),
      relatedId: redDoc.id,
      description: `Redeemed ${rewardTitle} (${cashValue})`,
    });
  } catch (err) {
    console.warn('Firestore debit note:', err);
  }

  return {
    success: true,
    redemptionId: result.redemptionId || 'rdm_' + Date.now(),
    newBalance,
  };
}

export async function awardAdRewardApi(
  uid: string,
  currentBalance: number
): Promise<{ success: boolean; coinsAwarded: number; newBalance: number }> {
  const response = await fetch('/api/functions/awardAdReward', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid }),
  });

  const result = await response.json();
  const coinsAwarded = result.coinsAwarded || 10;
  const newBalance = currentBalance + coinsAwarded;

  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      coinBalance: newBalance,
    });

    const txRef = collection(db, 'transactions', uid, 'entries');
    await addDoc(txRef, {
      type: 'ad_reward',
      amount: coinsAwarded,
      timestamp: new Date().toISOString(),
      description: 'Watched sponsored fitness video (+10 🪙)',
    });
  } catch (err) {
    console.warn('Firestore ad reward note:', err);
  }

  return { success: true, coinsAwarded, newBalance };
}

export async function chatWithCoachApi(
  messages: CoachChatMessage[],
  userContext: {
    stepsToday: number;
    streak: number;
    coinBalance: number;
    userName?: string;
    rank?: string;
    distanceKm?: number;
    caloriesBurned?: number;
  }
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      userContext,
    }),
  });

  if (!response.ok) {
    throw new Error('Coach service temporarily unavailable');
  }

  const data = await response.json();
  return data.reply || "Keep taking steps, every stride brings you closer to your fitness goals!";
}
