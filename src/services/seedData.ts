import { RedeemOption, Badge, LeaderboardEntry, Referral, UserProfile, StepDayRecord } from '../types';

export const INITIAL_USER: UserProfile = {
  uid: 'user_emilia',
  name: 'Emilia López',
  handle: '@emilialop',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  level: 3,
  streakDays: 14,
  coinBalance: 5290,
  followers: 16,
  following: 19,
  isPremium: true,
  referralCode: 'EMILIA88',
  healthPermissionGranted: true,
  createdAt: '2023-01-15T08:00:00.000Z',
};

export const INITIAL_REDEEM_OPTIONS: RedeemOption[] = [
  {
    id: 'bank_transfer_15',
    type: 'transfer',
    title: 'Bank transfer £15',
    payoutMethod: 'Bank Transfer',
    cashValue: '£15',
    coinCost: 3200,
    quantityAvailable: 100,
    totalPool: 8500,
    distributedAmount: 2450,
    beneficiaryCount: 77,
    isPremiumOnly: false,
    currency: '£',
    imageUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'bank_transfer_40',
    type: 'transfer',
    title: 'Bank transfer £40',
    payoutMethod: 'Bank Transfer',
    cashValue: '£40',
    coinCost: 8500,
    quantityAvailable: 120,
    totalPool: 9500,
    distributedAmount: 3800,
    beneficiaryCount: 42,
    isPremiumOnly: true,
    currency: '£',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'paypal_25',
    type: 'transfer',
    title: 'PayPal transfer $25',
    payoutMethod: 'PayPal',
    cashValue: '$25',
    coinCost: 5400,
    quantityAvailable: 85,
    totalPool: 5000,
    distributedAmount: 1850,
    beneficiaryCount: 64,
    isPremiumOnly: false,
    currency: '$',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'upi_1000',
    type: 'transfer',
    title: 'UPI Instant Cash ₹1,000',
    payoutMethod: 'UPI',
    cashValue: '₹1,000',
    coinCost: 2100,
    quantityAvailable: 140,
    totalPool: 100000,
    distributedAmount: 42000,
    beneficiaryCount: 128,
    isPremiumOnly: false,
    currency: '₹',
    imageUrl: 'https://images.unsplash.com/photo-1628102491629-778571d893a3?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'amazon_gift_20',
    type: 'voucher',
    title: 'Amazon Gift Card £20',
    payoutMethod: 'Amazon Gift Card',
    cashValue: '£20',
    coinCost: 4300,
    quantityAvailable: 95,
    totalPool: 6000,
    distributedAmount: 1900,
    beneficiaryCount: 89,
    isPremiumOnly: false,
    currency: '£',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'iphone_15_pro',
    type: 'gift',
    title: 'Apple iPhone 15 Pro 128GB',
    payoutMethod: 'Physical Gift',
    cashValue: '£999',
    coinCost: 160000,
    quantityAvailable: 4,
    totalPool: 5,
    distributedAmount: 1,
    beneficiaryCount: 3,
    isPremiumOnly: true,
    currency: '£',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'weekend_getaway',
    type: 'gift',
    title: 'Luxury Weekend City Break Voucher',
    payoutMethod: 'Physical Gift',
    cashValue: '£450',
    coinCost: 85000,
    quantityAvailable: 8,
    totalPool: 10,
    distributedAmount: 2,
    beneficiaryCount: 2,
    isPremiumOnly: false,
    currency: '£',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=500&q=80',
  },
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'b1',
    name: 'Champion Walker',
    description: 'Reached 15,000 steps in a single day',
    icon: '🏆',
    bgColor: 'from-amber-400 to-orange-500',
    unlocked: true,
    unlockedAt: '2 days ago',
    unlockCriteria: 'Reach 15,000 steps in 24 hours',
  },
  {
    id: 'b2',
    name: 'Stair Master',
    description: 'Walked up 20 flights of steps',
    icon: '🪜',
    bgColor: 'from-teal-400 to-emerald-500',
    unlocked: true,
    unlockedAt: '1 week ago',
    unlockCriteria: 'Climb 200 vertical meters',
  },
  {
    id: 'b3',
    name: 'Cloud Nine',
    description: 'Reached your goal 7 days in a row',
    icon: '☁️',
    bgColor: 'from-blue-400 to-indigo-500',
    unlocked: true,
    unlockedAt: '3 days ago',
    unlockCriteria: 'Hit 10k steps 7 days consecutively',
  },
  {
    id: 'b4',
    name: 'Sneaker Streak',
    description: 'Maintained a 14-day continuous streak',
    icon: '👟',
    bgColor: 'from-rose-400 to-red-500',
    unlocked: true,
    unlockedAt: 'Today',
    unlockCriteria: '14 consecutive active walking days',
  },
  {
    id: 'b5',
    name: 'Early Bird',
    description: 'Logged 3,000 steps before 8:00 AM',
    icon: '🌅',
    bgColor: 'from-yellow-400 to-amber-500',
    unlocked: true,
    unlockedAt: 'Yesterday',
    unlockCriteria: 'Complete 3,000 steps before 8 AM',
  },
  {
    id: 'b6',
    name: 'Globe Trotter',
    description: 'Walked a cumulative distance of 100km',
    icon: '🌍',
    bgColor: 'from-emerald-400 to-teal-600',
    unlocked: true,
    unlockedAt: 'May 12',
    unlockCriteria: 'Accumulate 100km walking total',
  },
  {
    id: 'b7',
    name: 'Coin Magnet',
    description: 'Earned 5,000 total StepEarn coins',
    icon: '🪙',
    bgColor: 'from-amber-500 to-yellow-300',
    unlocked: true,
    unlockedAt: 'Today',
    unlockCriteria: 'Reach 5,000 lifetime coins',
  },
  {
    id: 'b8',
    name: 'Social Star',
    description: 'Invited 3 friends who completed their 3-day streak',
    icon: '🤝',
    bgColor: 'from-violet-400 to-purple-600',
    unlocked: true,
    unlockedAt: 'May 18',
    unlockCriteria: 'Refer 3 active walking friends',
  },
  {
    id: 'b9',
    name: 'Night Owl Pacer',
    description: 'Walked 2,000 steps under the stars after 9 PM',
    icon: '🌙',
    bgColor: 'from-indigo-500 to-slate-800',
    unlocked: true,
    unlockedAt: 'May 20',
    unlockCriteria: '2,000 steps after 9:00 PM',
  },
  {
    id: 'b10',
    name: 'Centurion 20k',
    description: 'Conquered the maximum 20,000-step daily summit',
    icon: '👑',
    bgColor: 'from-orange-500 to-amber-600',
    unlocked: false,
    unlockCriteria: 'Reach the ultimate 20,000-step ceiling in one day',
  },
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    uid: 'user_martino',
    name: 'martino-rivas',
    handle: '@martino',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    level: 5,
    streakDays: 310,
    coinBalance: 1450,
    steps: 6598,
    rank: 1,
    updatedTimeAgo: '2 hours ago',
  },
  {
    uid: 'user_laia',
    name: 'Laiaaguilar',
    handle: '@laiaaguilar',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    level: 10,
    streakDays: 34,
    coinBalance: 3897,
    steps: 5546,
    rank: 2,
    updatedTimeAgo: 'A few seconds ago',
    isPremium: true,
  },
  {
    uid: 'user_hilda',
    name: 'hildarivera',
    handle: '@hildarivera',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    level: 3,
    streakDays: 3,
    coinBalance: 3090,
    steps: 4953,
    rank: 3,
    updatedTimeAgo: 'A few seconds ago',
  },
  {
    uid: 'user_emilia',
    name: 'Emilia López',
    handle: '@emilialop',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    level: 3,
    streakDays: 14,
    coinBalance: 5290,
    steps: 4450,
    rank: 4,
    updatedTimeAgo: 'Just now',
    isCurrentUser: true,
    isPremium: true,
  },
  {
    uid: 'user_antho',
    name: 'Antho.vico',
    handle: '@anthovico',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    level: 10,
    streakDays: 6,
    coinBalance: 5620,
    steps: 3045,
    rank: 5,
    updatedTimeAgo: '2 minutes ago',
  },
  {
    uid: 'user_yael',
    name: 'Yaël Rd',
    handle: '@yaelrd',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    level: 3,
    streakDays: 12,
    coinBalance: 462,
    steps: 2039,
    rank: 6,
    updatedTimeAgo: 'A few seconds ago',
  },
  {
    uid: 'user_jane',
    name: 'jane.owe',
    handle: '@janeowe',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    level: 3,
    streakDays: 0,
    coinBalance: 387,
    steps: 1293,
    rank: 7,
    updatedTimeAgo: 'A few seconds ago',
  },
];

export const INITIAL_REFERRALS: Referral[] = [
  {
    id: 'ref_1',
    referrerId: 'user_emilia',
    referredUserId: 'user_lucas',
    referredName: 'Lucas Miller',
    referredAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    dateInvited: 'May 20, 2023',
    consecutiveActiveDays: 3,
    rewardClaimed: true,
  },
  {
    id: 'ref_2',
    referrerId: 'user_emilia',
    referredUserId: 'user_sarah',
    referredName: 'Sarah Jenkins',
    referredAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    dateInvited: 'May 24, 2023',
    consecutiveActiveDays: 2,
    rewardClaimed: false,
  },
  {
    id: 'ref_3',
    referrerId: 'user_emilia',
    referredUserId: 'user_chloe',
    referredName: 'Chloe Bennett',
    referredAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    dateInvited: 'May 25, 2023',
    consecutiveActiveDays: 1,
    rewardClaimed: false,
  },
  {
    id: 'ref_4',
    referrerId: 'user_emilia',
    referredUserId: 'user_alex',
    referredName: 'Alex Wong',
    referredAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    dateInvited: 'May 14, 2023',
    consecutiveActiveDays: 3,
    rewardClaimed: true,
  },
];

// Generate calendar history data dynamically based on the current year and month
export function generateMonthHistory(
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth()
): Record<number, { steps: number; coins: number; isBonusStar?: boolean; percent: number }> {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = new Date().getDate();
  const isCurrentMonth =
    year === new Date().getFullYear() && month === new Date().getMonth();

  const days: Record<number, { steps: number; coins: number; isBonusStar?: boolean; percent: number }> = {};

  // Deterministic seed based on day number so history is consistent across renders
  for (let day = 1; day <= daysInMonth; day++) {
    // If future day in current month, leave as 0
    if (isCurrentMonth && day > todayDate) {
      days[day] = { steps: 0, coins: 0, percent: 0 };
      continue;
    }

    // Realistic distribution of walking days
    const seed = (day * 37 + month * 19 + year) % 100;
    let steps: number;
    let coins: number;
    let isBonusStar = false;

    if (seed > 85) {
      // Big walking day (summit 15k - 20k)
      steps = 15000 + (seed % 6) * 1000;
      coins = steps >= 20000 ? 25 : 19;
      isBonusStar = true;
    } else if (seed > 50) {
      // Active day (7k - 14k)
      steps = 7000 + (seed % 8) * 1000;
      coins = Math.min(Math.floor(steps / 1000) + 1, 16);
    } else if (seed > 20) {
      // Moderate day (3k - 6k)
      steps = 3000 + (seed % 4) * 1000;
      coins = Math.floor(steps / 1000);
    } else {
      // Light day (1k - 2.5k)
      steps = 1200 + (seed % 15) * 100;
      coins = 1;
    }

    const percent = Math.min(Math.round((steps / 20000) * 100), 100);
    days[day] = { steps, coins, isBonusStar, percent };
  }

  return days;
}
