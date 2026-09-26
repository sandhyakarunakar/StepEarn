import React, { useState } from 'react';
import { Referral, UserProfile } from '../types';
import { Mascot } from '../components/Mascot';
import { Gift, Copy, Share2, CheckCircle2, Clock, Users, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReferScreenProps {
  user: UserProfile;
  referrals: Referral[];
  onSimulateReferralStreak?: (referralId: string) => void;
}

export const ReferScreen: React.FC<ReferScreenProps> = ({
  user,
  referrals,
  onSimulateReferralStreak,
}) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const totalEarnedFromReferrals = referrals
    .filter((r) => r.rewardClaimed)
    .length * 10;

  const handleCopy = () => {
    navigator.clipboard?.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Join me on StepEarn!',
      text: `Walk and earn real cash and rewards with me on StepEarn! Use my invite code ${user.referralCode} to get started:`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Ignored or cancelled
      }
    } else {
      handleCopy();
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  return (
    <div className="flex-1 pb-28 space-y-4 max-w-md mx-auto w-full px-4 pt-3">
      {/* Header Banner: Mascot holding gift matching prompt */}
      <div className="bg-gradient-to-br from-[#FF7A1F] via-[#FF6A1A] to-[#FF5500] text-white rounded-3xl p-5 shadow-sm relative overflow-hidden flex items-center justify-between">
        <div className="space-y-1 max-w-[65%] z-10">
          <div className="inline-flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase">
            <Sparkles className="w-3 h-3" />
            <span>Referral Program</span>
          </div>
          <h2 className="text-xl font-black leading-tight">
            Invite friends, earn coins!
          </h2>
          <p className="text-xs text-orange-100 font-medium">
            Walking is better together. Earn 🪙10 coins for every friend who joins!
          </p>
        </div>

        {/* Mascot */}
        <div className="shrink-0 -mr-2 relative z-10">
          <Mascot size={90} mood="cheer" />
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
      </div>

      {/* Running Total Banner */}
      <div className="bg-teal-50 border border-teal-200/80 rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-black text-sm">
            W
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-teal-800 tracking-wider">
              Referral Rewards Earned
            </span>
            <p className="text-sm font-black text-teal-900 font-sans">
              🪙 {totalEarnedFromReferrals} Coins
            </p>
          </div>
        </div>
        <span className="text-xs font-black text-teal-700 bg-teal-100 px-2.5 py-1 rounded-full">
          {referrals.filter((r) => r.rewardClaimed).length} Completed
        </span>
      </div>

      {/* Unique Referral Code Box */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
        <p className="text-xs font-black text-slate-800 text-center uppercase tracking-wider">
          Your Exclusive Invite Code
        </p>

        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          <span className="text-lg font-black text-slate-900 tracking-widest font-mono">
            {user.referralCode}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs font-black text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs active:scale-95 transition-all"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-xs font-black text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-xl shadow-xs active:scale-95 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{shared ? 'Link Ready' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Step Explainer Visual Guide */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
          How Referral Bonus Works
        </h3>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-xl">📲</span>
            <p className="text-[11px] font-black text-slate-800">1. Invite</p>
            <p className="text-[9px] text-slate-400">Share your invite code with friends</p>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-xl">👟</span>
            <p className="text-[11px] font-black text-slate-800">2. They Walk</p>
            <p className="text-[9px] text-slate-400">Friend walks 3 consecutive days</p>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-xl">🪙</span>
            <p className="text-[11px] font-black text-slate-800">3. Both Earn</p>
            <p className="text-[9px] text-slate-400">Earn 🪙10 coins credited atomically</p>
          </div>
        </div>
      </div>

      {/* "Your Referrals" List */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-black text-slate-900 px-1">
          Your Referrals ({referrals.length})
        </h3>

        <div className="space-y-2">
          {referrals.map((ref) => (
            <div
              key={ref.id}
              className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <img
                  src={ref.referredAvatar}
                  alt={ref.referredName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-100"
                />
                <div>
                  <h4 className="text-xs font-black text-slate-900">{ref.referredName}</h4>
                  <p className="text-[10px] text-slate-400">Invited {ref.dateInvited}</p>
                </div>
              </div>

              {/* Status Chip */}
              <div>
                {ref.rewardClaimed ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-teal-700 bg-teal-50 border border-teal-200/80 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Earned +10 🪙</span>
                  </span>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Pending Day {ref.consecutiveActiveDays}/3</span>
                    </span>
                    {onSimulateReferralStreak && (
                      <button
                        onClick={() => onSimulateReferralStreak(ref.id)}
                        className="text-[9px] font-bold text-orange-600 hover:underline"
                        title="Simulate friend walking today"
                      >
                        + Walk Day
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
