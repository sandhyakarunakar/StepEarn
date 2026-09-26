import React, { useState } from 'react';
import { UserProfile, Badge } from '../types';
import { ProgressView } from './ProgressView';
import {
  ArrowLeft,
  Settings,
  UserPlus,
  Sparkles,
  Trophy,
  Flame,
  ChevronRight,
  X,
  Lock,
  CheckCircle2,
  Edit2,
  Camera,
} from 'lucide-react';

interface ProfileScreenProps {
  user: UserProfile;
  badges: Badge[];
  stepsToday: number;
  onBack: () => void;
  onOpenSocial: () => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  badges,
  stepsToday,
  onBack,
  onOpenSocial,
  onUpdateProfile,
}) => {
  const [subTab, setSubTab] = useState<'profile' | 'progress' | 'challenges'>('profile');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editHandle, setEditHandle] = useState(user.handle);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  // Dynamic Level computation based on coin economy
  const dynamicLevel = Math.max(1, Math.floor(user.coinBalance / 1500) + 1);

  // Dynamic Challenge metrics
  const streakTarget = 5;
  const streakProgressDays = Math.min(user.streakDays, streakTarget);
  const streakPercent = Math.min(Math.round((user.streakDays / streakTarget) * 100), 100);

  const marathonTargetKm = 42;
  const currentDistanceKm = +(user.streakDays * 3.5 + stepsToday * 0.00076).toFixed(1);
  const marathonPercent = Math.min(Math.round((currentDistanceKm / marathonTargetKm) * 100), 100);

  const handleSaveProfile = () => {
    if (editName.trim() && editHandle.trim()) {
      onUpdateProfile?.({
        name: editName.trim(),
        handle: editHandle.startsWith('@') ? editHandle.trim() : `@${editHandle.trim()}`,
      });
      setIsEditingProfile(false);
    }
  };

  return (
    <div className="flex-1 pb-28 space-y-4 max-w-md mx-auto w-full select-none">
      {/* Top Bar */}
      <div className="px-4 pt-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-slate-700 font-bold text-sm hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-orange-500" />
          <span>Back</span>
        </button>
        <h2 className="text-base font-black text-slate-900">You</h2>
        <button
          onClick={() => setIsEditingProfile(true)}
          className="text-slate-500 hover:text-slate-800 p-1"
          title="Edit Profile"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Cover Banner & Overlapping Avatar */}
      <div className="px-4">
        <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-100">
          <div className="h-36 w-full bg-slate-200">
            <img
              src={user.bannerUrl}
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Overlapping Avatar */}
          <div className="absolute -bottom-6 left-5">
            <div className="relative group cursor-pointer" onClick={() => setIsEditingProfile(true)}>
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-teal-500 border-2 border-white rounded-full" />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Social Follower Row & + Friends Button */}
        <div className="pt-8 flex items-center justify-between px-1">
          <div className="flex gap-4 text-xs font-bold text-slate-600">
            <div>
              <span className="font-black text-slate-900 text-sm">{user.followers}</span>{' '}
              <span className="text-slate-400">Followers</span>
            </div>
            <div>
              <span className="font-black text-slate-900 text-sm">{user.following}</span>{' '}
              <span className="text-slate-400">Following</span>
            </div>
          </div>

          <button
            onClick={onOpenSocial}
            className="flex items-center gap-1 text-xs font-black text-orange-600 bg-orange-50 border border-orange-200/80 px-3 py-1.5 rounded-full hover:bg-orange-100 active:scale-95 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Friends</span>
          </button>
        </div>

        {/* Name and Handle with Sparkle */}
        <div className="mt-2.5 px-1 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black text-slate-900">{user.name}</h1>
              {user.isPremium && (
                <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  ★ PREMIUM
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
              <span>{user.handle}</span>
              <span className="text-indigo-500">✦</span>
            </div>
          </div>
          <button
            onClick={() => setIsEditingProfile(true)}
            className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800"
            title="Edit profile"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Dynamic Stat Cards Row */}
        <div className="grid grid-cols-3 gap-2.5 mt-4">
          {/* Card 1: Level */}
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-base font-black text-slate-900">
              <span>{dynamicLevel}</span>
              <span className="text-amber-500 text-sm">🏆</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5">Level</span>
          </div>

          {/* Card 2: Streak */}
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-base font-black text-slate-900">
              <span>{user.streakDays}</span>
              <span className="text-orange-500 text-sm">🔥</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5">In progress</span>
          </div>

          {/* Card 3: Coin Balance */}
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-base font-black text-slate-900">
              <span className="text-xs">🪙</span>
              <span>{user.coinBalance.toLocaleString()}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5">Wards balance</span>
          </div>
        </div>

        {/* Sub-Tabs: Profile | Progress | Challenges */}
        <div className="mt-5 border-b border-slate-200 flex text-xs font-black">
          {(['profile', 'progress', 'challenges'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSubTab(tab)}
              className={`flex-1 pb-2.5 text-center capitalize transition-colors relative ${
                subTab === tab
                  ? 'text-slate-900 font-black'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
              {subTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6A1A] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Tab 1: Profile View */}
      {subTab === 'profile' && (
        <div className="px-4 space-y-4">
          {/* Badges Section with dynamic count */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">
                Badges{' '}
                <span className="text-xs font-bold text-slate-400">
                  {unlockedCount}/{badges.length}
                </span>
              </h3>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
              {badges.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBadge(b)}
                  className={`w-16 h-18 shrink-0 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 select-none relative p-1 ${
                    b.unlocked
                      ? `bg-gradient-to-tr ${b.bgColor} shadow-xs text-white`
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  <span className="text-2xl drop-shadow-sm">{b.icon}</span>
                  {!b.unlocked && (
                    <div className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-center justify-center text-white">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                  <span className="text-[9px] font-black truncate max-w-full text-center mt-1">
                    {b.name.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Challenges Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Challenges</h3>
              <button
                onClick={() => setSubTab('challenges')}
                className="text-xs font-black text-orange-600 hover:underline"
              >
                See more
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900">Active Streak Champion</h4>
                  <p className="text-[10px] text-slate-400">Log 5 consecutive walking days</p>
                </div>
                <span className="text-xs font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                  {streakProgressDays}/{streakTarget} Days
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${streakPercent}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900">Marathon Stride</h4>
                  <p className="text-[10px] text-slate-400">Accumulate {marathonTargetKm}km total walking</p>
                </div>
                <span className="text-xs font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                  {currentDistanceKm}/{marathonTargetKm} km
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${marathonPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Progress Calendar */}
      {subTab === 'progress' && (
        <div className="px-4">
          <ProgressView currentStepsToday={stepsToday} />
        </div>
      )}

      {/* Sub-Tab 3: Full Challenges */}
      {subTab === 'challenges' && (
        <div className="px-4 space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2">
            <h4 className="text-xs font-black text-slate-900">Global Walker Summit</h4>
            <p className="text-[11px] text-slate-500">
              Community challenge to reach 100M total steps. Every milestone you claim feeds into the global pool!
            </p>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${Math.min(100, Math.round((stepsToday / 20000) * 80 + 15))}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-slate-800 shadow-2xl relative">
            <button
              onClick={() => setIsEditingProfile(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-slate-900 mb-1">Edit Profile</h3>
            <p className="text-xs text-slate-400 mb-4">
              Update your display name and handle shown on the leaderboard.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Handle (@username)</label>
                <input
                  type="text"
                  value={editHandle}
                  onChange={(e) => setEditHandle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 outline-none font-mono"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full mt-4 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/30"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-slate-800 text-center shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div
              className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl mb-3 shadow-md ${
                selectedBadge.unlocked
                  ? `bg-gradient-to-tr ${selectedBadge.bgColor} text-white`
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {selectedBadge.icon}
            </div>

            <h3 className="text-base font-black text-slate-900">{selectedBadge.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{selectedBadge.description}</p>

            <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-left text-xs">
              <span className="font-bold text-slate-500 block">Unlock Criteria:</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {selectedBadge.unlockCriteria}
              </span>
              {selectedBadge.unlocked && selectedBadge.unlockedAt && (
                <div className="mt-2 text-teal-600 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Unlocked {selectedBadge.unlockedAt}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full mt-4 py-2.5 rounded-full bg-slate-900 text-white font-black text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
