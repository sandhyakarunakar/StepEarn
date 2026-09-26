import React, { useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  StepDayRecord,
  CoinTransaction,
  RedeemOption,
  Referral,
  Badge,
  LeaderboardEntry,
} from './types';
import {
  INITIAL_USER,
  INITIAL_REDEEM_OPTIONS,
  INITIAL_BADGES,
  INITIAL_LEADERBOARD,
  INITIAL_REFERRALS,
} from './services/seedData';
import { TopHeader } from './components/TopHeader';
import { BottomTabBar, TabType } from './components/BottomTabBar';
import { HomeScreen } from './screens/HomeScreen';
import { WalletScreen } from './screens/WalletScreen';
import { SocialScreen } from './screens/SocialScreen';
import { ReferScreen } from './screens/ReferScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { CoachModal } from './screens/CoachModal';
import { PedometerService, getTodayDateString } from './services/pedometer';
import {
  claimMilestoneApi,
  convertDailyStepsApi,
  redeemRewardApi,
  awardAdRewardApi,
} from './services/api';
import { MILESTONES } from './config/economy';
import { auth, db, signInAnonymously, onAuthStateChanged } from './config/firebase';
import { doc, onSnapshot, setDoc, getDoc, collection } from 'firebase/firestore';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  // Core Reactive Data States
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [stepRecord, setStepRecord] = useState<StepDayRecord>({
    date: getTodayDateString(),
    steps: 4450, // Matches Screenshot 1
    distanceKm: 3.5,
    caloriesBurned: 263,
    claimedMilestones: [1000, 2000, 3000],
    source: 'healthkit',
  });
  const [redeemOptions, setRedeemOptions] = useState<RedeemOption[]>(INITIAL_REDEEM_OPTIONS);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([
    {
      id: 'tx_init_1',
      uid: INITIAL_USER.uid,
      type: 'milestone_claim',
      amount: 3,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      description: 'Daily step milestones claimed (+3 🪙)',
    },
    {
      id: 'tx_init_2',
      uid: INITIAL_USER.uid,
      type: 'referral_reward',
      amount: 10,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      description: 'Referral reward: Lucas Miller active 3 days (+10 🪙)',
    },
  ]);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [referrals, setReferrals] = useState<Referral[]>(INITIAL_REFERRALS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);

  const [isSensorActive, setIsSensorActive] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const todayStr = getTodayDateString();

  // Dynamic user rank computed in real-time from leaderboard
  const userRank = React.useMemo(() => {
    const sorted = [...leaderboard]
      .map((item) => (item.isCurrentUser ? { ...item, steps: stepRecord.steps } : item))
      .sort((a, b) => b.steps - a.steps);
    const index = sorted.findIndex((item) => item.isCurrentUser);
    return index !== -1 ? index + 1 : 1;
  }, [leaderboard, stepRecord.steps]);

  // Initialize Firebase User and Live Snapshot Listeners
  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;
    let unsubscribeSteps: (() => void) | undefined;

    const setupAuthAndFirestore = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.warn('Anonymous auth note (using demo profile):', err);
      }

      onAuthStateChanged(auth, async (firebaseUser) => {
        const uid = firebaseUser?.uid || INITIAL_USER.uid;

        // Try setting up snapshot listener on users/{uid}
        try {
          const userRef = doc(db, 'users', uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            await setDoc(userRef, {
              ...INITIAL_USER,
              uid,
            });
          }

          unsubscribeUser = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
              const data = snap.data() as UserProfile;
              setUser((prev) => ({
                ...prev,
                ...data,
                coinBalance: data.coinBalance ?? prev.coinBalance,
              }));
            }
          });

          // Listener on stepRecords/{uid}/days/{today}
          const stepRef = doc(db, 'stepRecords', uid, 'days', todayStr);
          unsubscribeSteps = onSnapshot(stepRef, (snap) => {
            if (snap.exists()) {
              const data = snap.data() as Partial<StepDayRecord>;
              setStepRecord((prev) => ({
                ...prev,
                steps: data.steps ?? prev.steps,
                claimedMilestones: data.claimedMilestones ?? prev.claimedMilestones,
              }));
            }
          });
        } catch (e) {
          console.warn('Firestore snapshot setup note:', e);
        }
      });
    };

    setupAuthAndFirestore();

    return () => {
      unsubscribeUser?.();
      unsubscribeSteps?.();
    };
  }, [todayStr]);

  // Handle physical device motion pedometer
  const handleToggleMotionSensor = async (): Promise<boolean> => {
    const pedometer = PedometerService.getInstance();
    if (isSensorActive) {
      setIsSensorActive(false);
      return false;
    }

    const granted = await pedometer.requestMotionPermission();
    if (granted) {
      setIsSensorActive(true);
      pedometer.startTracking(() => {
        handleAddSteps(1);
      });
      return true;
    }
    return false;
  };

  // Add / Set Steps handler
  const handleAddSteps = useCallback(
    (amount: number) => {
      setStepRecord((prev) => {
        const newSteps = prev.steps + amount;
        PedometerService.getInstance().saveStepsToFirestore(
          user.uid,
          todayStr,
          newSteps,
          prev.claimedMilestones
        );
        return {
          ...prev,
          steps: newSteps,
        };
      });
    },
    [user.uid, todayStr]
  );

  const handleSetSteps = useCallback(
    (steps: number) => {
      setStepRecord((prev) => {
        PedometerService.getInstance().saveStepsToFirestore(
          user.uid,
          todayStr,
          steps,
          prev.claimedMilestones
        );
        return {
          ...prev,
          steps,
        };
      });
    },
    [user.uid, todayStr]
  );

  const handleResetSteps = useCallback(() => {
    setStepRecord((prev) => {
      PedometerService.getInstance().saveStepsToFirestore(
        user.uid,
        todayStr,
        0,
        []
      );
      return {
        ...prev,
        steps: 0,
        claimedMilestones: [],
      };
    });
  }, [user.uid, todayStr]);

  // Milestone Claiming interaction
  const handleClaimMilestone = async (threshold: number, event: React.MouseEvent) => {
    try {
      const res = await claimMilestoneApi(
        user.uid,
        todayStr,
        threshold,
        stepRecord.steps,
        stepRecord.claimedMilestones,
        user.coinBalance
      );

      // Local optimistic update
      setUser((prev) => ({ ...prev, coinBalance: res.newBalance }));
      setStepRecord((prev) => ({
        ...prev,
        claimedMilestones: [...prev.claimedMilestones, threshold],
      }));

      // Add to local transactions
      setTransactions((prev) => [
        {
          id: 'tx_' + Date.now(),
          uid: user.uid,
          type: 'milestone_claim',
          amount: res.coinsAwarded,
          timestamp: new Date().toISOString(),
          description: `Reached ${threshold.toLocaleString()} steps milestone (+${res.coinsAwarded} 🪙)`,
        },
        ...prev,
      ]);
    } catch (err: any) {
      console.error('Claim milestone error:', err);
    }
  };

  // Bulk Convert Daily Steps
  const handleConvertDailySteps = async () => {
    const eligibleUnclaimed = MILESTONES.filter(
      (m) => stepRecord.steps >= m.threshold && !stepRecord.claimedMilestones.includes(m.threshold)
    ).map((m) => m.threshold);

    if (eligibleUnclaimed.length === 0) return;

    setIsConverting(true);
    try {
      const res = await convertDailyStepsApi(
        user.uid,
        todayStr,
        eligibleUnclaimed,
        user.coinBalance
      );

      setUser((prev) => ({ ...prev, coinBalance: res.newBalance }));
      setStepRecord((prev) => ({
        ...prev,
        claimedMilestones: [...prev.claimedMilestones, ...eligibleUnclaimed],
      }));

      setTransactions((prev) => [
        {
          id: 'tx_' + Date.now(),
          uid: user.uid,
          type: 'milestone_claim',
          amount: res.coinsAwarded,
          timestamp: new Date().toISOString(),
          description: `Bulk converted ${eligibleUnclaimed.length} daily milestones (+${res.coinsAwarded} 🪙)`,
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('Convert daily steps error:', err);
    } finally {
      setIsConverting(false);
    }
  };

  // Rewarded Ad completion
  const handleAwardAdReward = async () => {
    try {
      const res = await awardAdRewardApi(user.uid, user.coinBalance);
      setUser((prev) => ({ ...prev, coinBalance: res.newBalance }));
      setTransactions((prev) => [
        {
          id: 'tx_' + Date.now(),
          uid: user.uid,
          type: 'ad_reward',
          amount: res.coinsAwarded,
          timestamp: new Date().toISOString(),
          description: 'Watched sponsored fitness partner (+10 🪙)',
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('Ad reward error:', err);
    }
  };

  // Daily Spin completion
  const handleAwardSpinReward = (amount: number) => {
    setUser((prev) => ({ ...prev, coinBalance: prev.coinBalance + amount }));
    setTransactions((prev) => [
      {
        id: 'tx_' + Date.now(),
        uid: user.uid,
        type: 'daily_spin',
        amount,
        timestamp: new Date().toISOString(),
        description: `Daily lucky spin reward (+${amount} 🪙)`,
      },
      ...prev,
    ]);
  };

  // Reward Redemption
  const handleRedeemReward = async (reward: RedeemOption, payoutDetails: any) => {
    const res = await redeemRewardApi(
      user.uid,
      reward.id,
      reward.title,
      reward.coinCost,
      reward.cashValue,
      payoutDetails,
      user.coinBalance
    );

    setUser((prev) => ({ ...prev, coinBalance: res.newBalance }));

    setTransactions((prev) => [
      {
        id: 'tx_' + Date.now(),
        uid: user.uid,
        type: 'redemption_debit',
        amount: -reward.coinCost,
        timestamp: new Date().toISOString(),
        description: `Redeemed ${reward.title} (${reward.cashValue})`,
      },
      ...prev,
    ]);

    // Update reward quantity locally
    setRedeemOptions((prev) =>
      prev.map((r) =>
        r.id === reward.id
          ? {
              ...r,
              quantityAvailable: Math.max(r.quantityAvailable - 1, 0),
              beneficiaryCount: r.beneficiaryCount + 1,
            }
          : r
      )
    );
  };

  // Simulate friend streak walking
  const handleSimulateReferralStreak = (referralId: string) => {
    setReferrals((prev) =>
      prev.map((r) => {
        if (r.id === referralId) {
          const nextDays = r.consecutiveActiveDays + 1;
          const claimed = nextDays >= 3;
          if (claimed && !r.rewardClaimed) {
            setUser((u) => ({ ...u, coinBalance: u.coinBalance + 10 }));
            setTransactions((txs) => [
              {
                id: 'tx_' + Date.now(),
                uid: user.uid,
                type: 'referral_reward',
                amount: 10,
                timestamp: new Date().toISOString(),
                description: `Referral bonus: ${r.referredName} walked 3 days! (+10 🪙)`,
              },
              ...txs,
            ]);
          }
          return {
            ...r,
            consecutiveActiveDays: nextDays,
            rewardClaimed: claimed,
          };
        }
        return r;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center py-0 sm:py-6 selection:bg-orange-500 selection:text-white font-sans">
      {/* Mobile Device Frame Container */}
      <div className="relative w-full max-w-md h-screen sm:h-[844px] bg-[#F8FAFC] shadow-2xl sm:rounded-[44px] overflow-hidden flex flex-col border sm:border-slate-800">
        {/* Top Header */}
        <TopHeader
          coinBalance={user.coinBalance}
          streakDays={user.streakDays}
          avatarUrl={user.avatarUrl}
          onOpenWallet={() => setCurrentTab('wallet')}
          onOpenProfile={() => setCurrentTab('profile')}
          onOpenCoach={() => setIsCoachOpen(true)}
        />

        {/* Screen Content Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          {currentTab === 'home' && (
            <HomeScreen
              user={user}
              stepRecord={stepRecord}
              userRank={userRank}
              onClaimMilestone={handleClaimMilestone}
              onConvertDailySteps={handleConvertDailySteps}
              onAwardAdReward={handleAwardAdReward}
              onAwardSpinReward={handleAwardSpinReward}
              onAddSteps={handleAddSteps}
              onSetSteps={handleSetSteps}
              onResetSteps={handleResetSteps}
              onToggleMotionSensor={handleToggleMotionSensor}
              isSensorActive={isSensorActive}
              onOpenSocial={() => setCurrentTab('social')}
              onOpenRefer={() => setCurrentTab('refer')}
              onOpenCoach={() => setIsCoachOpen(true)}
              isConverting={isConverting}
            />
          )}

          {currentTab === 'wallet' && (
            <WalletScreen
              coinBalance={user.coinBalance}
              redeemOptions={redeemOptions}
              transactions={transactions}
              onRedeemReward={handleRedeemReward}
            />
          )}

          {currentTab === 'social' && (
            <SocialScreen
              coinBalance={user.coinBalance}
              leaderboard={leaderboard}
              currentStepsToday={stepRecord.steps}
              currentUser={user}
            />
          )}

          {currentTab === 'refer' && (
            <ReferScreen
              user={user}
              referrals={referrals}
              onSimulateReferralStreak={handleSimulateReferralStreak}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileScreen
              user={user}
              badges={badges}
              stepsToday={stepRecord.steps}
              onBack={() => setCurrentTab('home')}
              onOpenSocial={() => setCurrentTab('social')}
              onUpdateProfile={(updated) => {
                setUser((prev) => ({ ...prev, ...updated }));
                try {
                  const userRef = doc(db, 'users', user.uid);
                  setDoc(userRef, updated, { merge: true });
                } catch (e) {
                  console.warn('Profile Firestore update note:', e);
                }
              }}
            />
          )}
        </main>

        {/* Bottom Tab Bar with Center AI Coach FAB */}
        <BottomTabBar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenCoach={() => setIsCoachOpen(true)}
        />

        {/* AI Fitness Coach Assistant Modal */}
        <CoachModal
          isOpen={isCoachOpen}
          onClose={() => setIsCoachOpen(false)}
          stepsToday={stepRecord.steps}
          streakDays={user.streakDays}
          coinBalance={user.coinBalance}
          userName={user.name}
          userRank={userRank}
          distanceKm={stepRecord.distanceKm}
          caloriesBurned={stepRecord.caloriesBurned}
        />
      </div>
    </div>
  );
}
