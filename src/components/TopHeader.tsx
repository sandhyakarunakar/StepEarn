import React from 'react';

interface TopHeaderProps {
  coinBalance: number;
  streakDays: number;
  avatarUrl: string;
  onOpenWallet: () => void;
  onOpenProfile: () => void;
  onOpenNotifications?: () => void;
  onOpenCoach?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  coinBalance,
  streakDays,
  avatarUrl,
  onOpenWallet,
  onOpenProfile,
  onOpenNotifications,
  onOpenCoach,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md px-4 py-2.5 flex items-center justify-between border-b border-slate-100">
      {/* Coin Wallet Chip (Top-left) */}
      <button
        onClick={onOpenWallet}
        className="flex items-center gap-1.5 bg-[#0FBF9F] text-white px-3.5 py-1.5 rounded-full shadow-sm hover:opacity-95 active:scale-95 transition-all"
        title="View StepEarn Coins & Redeem"
        aria-label="StepEarn coin balance"
      >
        <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-[#0FBF9F]">
          W
        </div>
        <span className="text-sm font-black tracking-tight font-sans">
          {coinBalance.toLocaleString()}
        </span>
      </button>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Streak Flame Chip */}
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 text-amber-800 px-2.5 py-1 rounded-full text-xs font-black shadow-xs">
          <span>{streakDays}</span>
          <span className="text-sm">🔥</span>
        </div>

        {/* AI Sparkle Icon Button */}
        <button
          onClick={onOpenCoach}
          className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 active:scale-90 transition-all border border-indigo-100"
          title="Ask AI Fitness Coach"
          aria-label="AI Coach"
        >
          <span className="text-sm">✨</span>
        </button>

        {/* Profile Avatar Button */}
        <button
          onClick={onOpenProfile}
          className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200 hover:border-orange-500 active:scale-95 transition-all shadow-xs"
          title="Open Profile"
          aria-label="User Profile"
        >
          <img
            src={avatarUrl}
            alt="User profile"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </header>
  );
};
