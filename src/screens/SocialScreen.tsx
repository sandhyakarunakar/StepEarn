import React, { useState } from 'react';
import { LeaderboardEntry, UserProfile } from '../types';
import { UserPlus, ChevronDown, Sparkles, RefreshCw, X, Search, Check } from 'lucide-react';

interface SocialScreenProps {
  coinBalance: number;
  leaderboard: LeaderboardEntry[];
  currentStepsToday: number;
  currentUser?: UserProfile;
  onRefreshLeaderboard?: () => void;
}

export const SocialScreen: React.FC<SocialScreenProps> = ({
  coinBalance,
  leaderboard,
  currentStepsToday,
  currentUser,
  onRefreshLeaderboard,
}) => {
  const [scope, setScope] = useState<'friends' | 'global' | 'country'>('friends');
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [category, setCategory] = useState<'walkers' | 'streak'>('walkers');
  const [showAddFriends, setShowAddFriends] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [friendRequested, setFriendRequested] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync current user steps, handle, and coins dynamically with today's live stats
  const updatedLeaderboard = leaderboard.map((item) => {
    if (item.isCurrentUser) {
      return {
        ...item,
        name: currentUser?.name || item.name,
        handle: currentUser?.handle || item.handle,
        avatarUrl: currentUser?.avatarUrl || item.avatarUrl,
        level: currentUser ? Math.max(1, Math.floor(currentUser.coinBalance / 1500) + 1) : item.level,
        streakDays: currentUser?.streakDays ?? item.streakDays,
        steps: currentStepsToday,
        coinBalance,
      };
    }
    return item;
  }).sort((a, b) => b.steps - a.steps).map((item, idx) => ({ ...item, rank: idx + 1 }));

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onRefreshLeaderboard?.();
    }, 600);
  };

  const handleSendFriendRequest = (handle: string) => {
    setFriendRequested((prev) => [...prev, handle]);
  };

  return (
    <div className="flex-1 pb-28 space-y-3 max-w-md mx-auto w-full">
      {/* Top Bar matching Screenshot 4 */}
      <div className="px-4 pt-3 flex items-center justify-between">
        {/* Wallet Pill Top Left */}
        <div className="flex items-center gap-1.5 bg-[#0FBF9F] text-white px-3 py-1.5 rounded-full shadow-xs">
          <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center text-[9px] font-black text-[#0FBF9F]">
            W
          </div>
          <span className="text-xs font-black">{coinBalance.toLocaleString()}</span>
        </div>

        {/* Title */}
        <h2 className="text-base font-black text-slate-900">Social</h2>

        {/* + Friends Button */}
        <button
          onClick={() => setShowAddFriends(true)}
          className="flex items-center gap-1 text-xs font-black text-orange-600 bg-orange-50 border border-orange-200/80 px-3 py-1.5 rounded-full hover:bg-orange-100 active:scale-95 transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>+ Friends</span>
        </button>
      </div>

      {/* 3 Dropdown Filter Chips matching Screenshot 4 */}
      <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar py-1">
        {/* Filter 1 */}
        <button
          onClick={() => setCategory(category === 'walkers' ? 'streak' : 'walkers')}
          className="flex items-center gap-1 text-xs font-black text-slate-700 bg-white border border-slate-200/80 px-3 py-1.5 rounded-full shadow-2xs hover:bg-slate-50 transition-colors shrink-0"
        >
          <span>{category === 'walkers' ? 'Walkers' : 'Streakers'}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Filter 2 */}
        <button
          onClick={() => {
            const next = scope === 'friends' ? 'global' : scope === 'global' ? 'country' : 'friends';
            setScope(next);
          }}
          className="flex items-center gap-1 text-xs font-black text-slate-700 bg-white border border-slate-200/80 px-3 py-1.5 rounded-full shadow-2xs hover:bg-slate-50 transition-colors shrink-0"
        >
          <span>
            {scope === 'friends' ? 'Among my friends' : scope === 'global' ? 'Global' : 'Country'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Filter 3 */}
        <button
          onClick={() => setPeriod(period === 'today' ? 'week' : 'today')}
          className="flex items-center gap-1 text-xs font-black text-slate-700 bg-white border border-slate-200/80 px-3 py-1.5 rounded-full shadow-2xs hover:bg-slate-50 transition-colors shrink-0"
        >
          <span>{period === 'today' ? 'Today' : 'This Week'}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          onClick={handleRefresh}
          className={`p-1.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 shrink-0 ${
            isRefreshing ? 'animate-spin text-orange-500' : ''
          }`}
          title="Refresh cached leaderboard snapshot"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Ranked Leaderboard List matching Screenshot 4 */}
      <div className="px-4 space-y-2.5">
        {updatedLeaderboard.map((item) => {
          const isMe = item.isCurrentUser;
          const isTop3 = item.rank <= 3;
          const medal = item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : null;

          return (
            <div
              key={item.uid}
              className={`rounded-2xl p-3 border transition-all flex items-center justify-between ${
                isMe
                  ? 'bg-amber-50/70 border-orange-400 ring-2 ring-orange-400/20 shadow-xs'
                  : 'bg-white border-slate-100 shadow-xs'
              }`}
            >
              {/* Left Column: Rank + Avatar + Name/Stats */}
              <div className="flex items-center gap-2.5">
                {/* Rank Indicator */}
                <div className="w-6 text-center font-black text-xs text-slate-500 shrink-0">
                  {medal ? (
                    <span className="text-base">{medal}</span>
                  ) : (
                    <span>{item.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={item.avatarUrl}
                    alt={item.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-100"
                  />
                  {item.isPremium && (
                    <span className="absolute -top-1 -right-1 text-xs">✨</span>
                  )}
                </div>

                {/* Name, Chips (Lv, Flame, Coins) */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-slate-900 line-clamp-1">
                      {item.handle}
                    </span>
                    {item.isPremium && (
                      <span className="text-indigo-500 text-[10px]">✦</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <span>Lv {item.level}</span>
                    <span className="flex items-center text-orange-600">
                      <span>🔥</span>
                      <span>{item.streakDays}</span>
                    </span>
                    <span className="flex items-center gap-0.5 text-teal-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600 text-white text-[7px] flex items-center justify-center font-black">
                        w
                      </span>
                      <span>{item.coinBalance.toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Step Count + Time Ago */}
              <div className="text-right shrink-0">
                <div className="text-xs font-black text-slate-900 font-sans">
                  {item.steps.toLocaleString()} steps
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {isMe ? 'Just now' : item.updatedTimeAgo}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Friends Modal */}
      {showAddFriends && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 text-slate-800 shadow-2xl relative">
            <button
              onClick={() => setShowAddFriends(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-slate-900 mb-1">Add Friends</h3>
            <p className="text-xs text-slate-400 mb-4">
              Search by username or invite contacts to compete and earn streak coins together.
            </p>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search @handle or name..."
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            {/* Suggested Friends */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {[
                { name: 'Marcus Chen', handle: '@marcus_c', steps: '7,400 steps today' },
                { name: 'Zoe Kravitz', handle: '@zoek', steps: '5,120 steps today' },
                { name: 'Oliver Twist', handle: '@oliver_steps', steps: '9,800 steps today' },
              ].map((friend) => {
                const requested = friendRequested.includes(friend.handle);
                return (
                  <div
                    key={friend.handle}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <div>
                      <p className="text-xs font-black text-slate-800">{friend.name}</p>
                      <p className="text-[10px] text-slate-400">{friend.handle} • {friend.steps}</p>
                    </div>
                    <button
                      onClick={() => handleSendFriendRequest(friend.handle)}
                      disabled={requested}
                      className={`text-[11px] font-black px-3 py-1 rounded-full transition-all ${
                        requested
                          ? 'bg-teal-50 text-teal-600 border border-teal-200'
                          : 'bg-orange-500 text-white hover:bg-orange-600 shadow-2xs'
                      }`}
                    >
                      {requested ? 'Requested' : 'Add'}
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowAddFriends(false)}
              className="w-full mt-4 py-2.5 rounded-full bg-slate-900 text-white font-black text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
