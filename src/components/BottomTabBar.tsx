import React from 'react';
import { Home, Wallet, Users, Gift, User, Sparkles, MessageSquareHeart } from 'lucide-react';

export type TabType = 'home' | 'wallet' | 'social' | 'refer' | 'profile';

interface BottomTabBarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenCoach: () => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCoach,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto pointer-events-none">
      <div className="relative bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-3 py-2 flex items-center justify-around shadow-xl pointer-events-auto rounded-t-3xl">
        {/* Tab 1: Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors ${
            currentTab === 'home' ? 'text-orange-500 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="Home Dashboard"
        >
          <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Tab 2: Wallet */}
        <button
          onClick={() => onSelectTab('wallet')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors ${
            currentTab === 'wallet' ? 'text-orange-500 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="Spend and Redeem Rewards"
        >
          <Wallet className={`w-5 h-5 ${currentTab === 'wallet' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight">Wallet</span>
        </button>

        {/* Center Floating Action Button (FAB) - AI Fitness Coach */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            onClick={onOpenCoach}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 border-4 border-white hover:scale-105 active:scale-95 transition-all group"
            title="StepEarn AI Coach"
            aria-label="Open AI Fitness Coach"
          >
            {/* Subtle pulsing ring */}
            <span className="absolute -inset-1 rounded-full bg-orange-400 opacity-30 animate-ping pointer-events-none" />
            <div className="relative flex items-center justify-center">
              <MessageSquareHeart className="w-6 h-6 stroke-[2.2]" />
              <span className="absolute -top-1 -right-1 text-xs">✨</span>
            </div>
          </button>
          <span className="text-[10px] font-black text-orange-600 mt-0.5">Coach</span>
        </div>

        {/* Tab 3: Social */}
        <button
          onClick={() => onSelectTab('social')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors ${
            currentTab === 'social' ? 'text-orange-500 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="Social Leaderboard"
        >
          <Users className={`w-5 h-5 ${currentTab === 'social' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight">Social</span>
        </button>

        {/* Tab 4: Refer */}
        <button
          onClick={() => onSelectTab('refer')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors ${
            currentTab === 'refer' ? 'text-orange-500 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="Refer and Earn"
        >
          <Gift className={`w-5 h-5 ${currentTab === 'refer' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight">Refer</span>
        </button>

        {/* Tab 5: Profile */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors ${
            currentTab === 'profile' ? 'text-orange-500 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="User Profile"
        >
          <User className={`w-5 h-5 ${currentTab === 'profile' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight">You</span>
        </button>
      </div>
    </div>
  );
};
