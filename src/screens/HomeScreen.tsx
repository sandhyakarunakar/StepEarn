import React, { useState } from 'react';
import { StepGauge } from '../components/StepGauge';
import { AdModal } from '../components/AdModal';
import { SpinWheelModal } from '../components/SpinWheelModal';
import { StepSimulatorBar } from '../components/StepSimulatorBar';
import { StepDayRecord, UserProfile } from '../types';
import { calculateEstimatedCalories, calculateEstimatedDistanceKm } from '../config/economy';
import { Play, Sparkles, UserPlus, MessageSquareHeart, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HomeScreenProps {
  user: UserProfile;
  stepRecord: StepDayRecord;
  userRank: number;
  onClaimMilestone: (threshold: number, event: React.MouseEvent) => void;
  onConvertDailySteps: () => void;
  onAwardAdReward: () => void;
  onAwardSpinReward: (amount: number) => void;
  onAddSteps: (amount: number) => void;
  onSetSteps: (steps: number) => void;
  onResetSteps: () => void;
  onToggleMotionSensor: () => Promise<boolean>;
  isSensorActive: boolean;
  onOpenSocial: () => void;
  onOpenRefer: () => void;
  onOpenCoach: () => void;
  isConverting?: boolean;
}

const MILESTONE_AWARDS: Record<number, number> = {
  1000: 1, 2000: 1, 3000: 1, 4000: 1, 5000: 1,
  6000: 1, 7000: 1, 8000: 1, 9000: 2, 10000: 1,
  11000: 2, 12000: 1, 13000: 2, 14000: 1, 15000: 2,
  16000: 1, 17000: 1, 18000: 1, 19000: 1, 20000: 2,
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  stepRecord,
  userRank,
  onClaimMilestone,
  onConvertDailySteps,
  onAwardAdReward,
  onAwardSpinReward,
  onAddSteps,
  onSetSteps,
  onResetSteps,
  onToggleMotionSensor,
  isSensorActive,
  onOpenSocial,
  onOpenRefer,
  onOpenCoach,
  isConverting = false,
}) => {
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [isSpinModalOpen, setIsSpinModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const distanceKm = calculateEstimatedDistanceKm(stepRecord.steps);
  const caloriesBurned = calculateEstimatedCalories(stepRecord.steps);

  // Dynamically compute exact coins earned today from claimed milestones
  const coinsEarnedToday = stepRecord.claimedMilestones.reduce(
    (acc, threshold) => acc + (MILESTONE_AWARDS[threshold] || 1),
    0
  );

  // Dynamic ranking string
  const rankOrdinal =
    userRank === 1
      ? '1st'
      : userRank === 2
      ? '2nd'
      : userRank === 3
      ? '3rd'
      : `${userRank}th`;

  // Dynamic level progression
  const currentLevel = Math.max(1, Math.floor(user.coinBalance / 1500) + 1);
  const progressInLevel = Math.min(3, Math.floor((user.coinBalance % 1500) / 500) + 1);
  const levelProgress = `${progressInLevel}/3`;

  return (
    <div className="flex-1 pb-28 pt-2 px-4 space-y-4 max-w-md mx-auto w-full select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-black flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <span className="text-amber-400">✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dynamic Ranking Pill Below Top Bar (Matching Screenshot 1) */}
      <div className="flex justify-center">
        <button
          onClick={onOpenSocial}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white rounded-full shadow-xs border border-slate-200/80 hover:border-orange-300 transition-all active:scale-95"
        >
          <span className="text-sm">
            {userRank === 1 ? '🥇' : userRank === 2 ? '🥈' : userRank === 3 ? '🥉' : '🏅'}
          </span>
          <span className="text-xs font-black text-slate-800">
            {rankOrdinal} among your friends
          </span>
          <span className="text-[10px] text-slate-400 font-bold ml-0.5">›</span>
        </button>
      </div>

      {/* Main Feature: Circular Step Gauge & Mascot */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col items-center">
        <StepGauge
          currentSteps={stepRecord.steps}
          claimedMilestones={stepRecord.claimedMilestones}
          userLevel={currentLevel}
          levelProgress={levelProgress}
          onClaimMilestone={(th, event) => {
            confetti({
              particleCount: 40,
              spread: 50,
              origin: { y: 0.4 },
            });
            onClaimMilestone(th, event);
            showToast(`Claimed milestone! Coins credited to wallet`);
          }}
          onConvertAll={() => {
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.5 },
            });
            onConvertDailySteps();
            showToast(`Converted all eligible daily milestones!`);
          }}
          isConverting={isConverting}
        />
      </div>

      {/* Four Dynamic Stats Row (Distance, Calories, Earned, Steps counted) */}
      <div className="grid grid-cols-4 gap-2 bg-white rounded-2xl p-3 shadow-xs border border-slate-100 text-center">
        <div className="space-y-0.5 border-r border-slate-100 pr-1">
          <div className="text-xs font-black text-slate-800 font-sans">
            {distanceKm.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km
          </div>
          <div className="text-[10px] font-bold text-slate-400">Distance</div>
        </div>

        <div className="space-y-0.5 border-r border-slate-100 pr-1">
          <div className="text-xs font-black text-slate-800 font-sans">
            {caloriesBurned} kcal
          </div>
          <div className="text-[10px] font-bold text-slate-400">Calories</div>
        </div>

        <div className="space-y-0.5 border-r border-slate-100 pr-1">
          <div className="text-xs font-black text-slate-800 font-sans flex items-center justify-center gap-0.5">
            <span>{coinsEarnedToday}</span>
            <span className="w-3 h-3 rounded-full bg-slate-800 text-white text-[8px] flex items-center justify-center font-bold">
              w
            </span>
          </div>
          <div className="text-[10px] font-bold text-slate-400">Coins Earned</div>
        </div>

        <div className="space-y-0.5">
          <div className="text-xs font-black text-slate-800 font-sans">
            {stepRecord.steps.toLocaleString()}
          </div>
          <div className="text-[10px] font-bold text-slate-400">Steps counted</div>
        </div>
      </div>

      {/* AI Fitness Coach Personalized Suggestion Card */}
      <div
        onClick={onOpenCoach}
        className="bg-gradient-to-r from-orange-50 via-amber-50 to-teal-50 border border-orange-200/70 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:border-orange-300 transition-all shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-xs">
            <MessageSquareHeart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900">StepEarn AI Coach</span>
              <span className="text-[9px] font-extrabold bg-orange-500 text-white px-1.5 py-0.2 rounded-full">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              {stepRecord.steps >= 20000
                ? 'Goal completed! Tap to analyze your full summit workout.'
                : `${(20000 - stepRecord.steps).toLocaleString()} steps left to max 25 coins. Need pacing tips?`}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      {/* Step Simulator & HealthKit Controls Bar */}
      <StepSimulatorBar
        currentSteps={stepRecord.steps}
        onAddSteps={onAddSteps}
        onSetSteps={onSetSteps}
        onResetSteps={onResetSteps}
        onToggleMotionSensor={onToggleMotionSensor}
        isSensorActive={isSensorActive}
      />

      {/* "Explore more ways to earn" Horizontal Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-slate-800">
            Explore more ways to earn
          </h3>
          <span className="text-xs font-bold text-orange-600">Bonuses</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {/* Card 1: Watch Ad */}
          <div
            onClick={() => setIsAdModalOpen(true)}
            className="w-48 shrink-0 bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs hover:border-orange-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
              <span className="text-[11px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                +10 🪙
              </span>
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">
                Watch an ad, earn coins
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                5-sec quick preview
              </p>
            </div>
          </div>

          {/* Card 2: Daily Spin */}
          <div
            onClick={() => setIsSpinModalOpen(true)}
            className="w-48 shrink-0 bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs hover:border-amber-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Up to +20 🪙
              </span>
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">
                Daily lucky spin
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                1 free spin every day
              </p>
            </div>
          </div>

          {/* Card 3: Refer Friends */}
          <div
            onClick={onOpenRefer}
            className="w-48 shrink-0 bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs hover:border-teal-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                +10 🪙 each
              </span>
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">
                Invite friends
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Earn when friends walk
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onAdCompleted={() => {
          onAwardAdReward();
          showToast('Earned +10 coins from sponsored partner!');
        }}
      />

      <SpinWheelModal
        isOpen={isSpinModalOpen}
        onClose={() => setIsSpinModalOpen(false)}
        onRewardWon={(amount) => {
          onAwardSpinReward(amount);
          showToast(`Won +${amount} coins from lucky spin!`);
        }}
      />
    </div>
  );
};
