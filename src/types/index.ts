export interface UserProfile {
  uid: string;
  name: string;
  handle: string;
  avatarUrl: string;
  bannerUrl: string;
  level: number;
  streakDays: number;
  coinBalance: number;
  followers: number;
  following: number;
  isPremium: boolean;
  referralCode: string;
  healthPermissionGranted: boolean;
  createdAt: string;
}

export interface StepDayRecord {
  date: string; // YYYY-MM-DD
  steps: number;
  distanceKm: number;
  caloriesBurned: number;
  claimedMilestones: number[]; // e.g. [1000, 2000, 5000...]
  source: 'healthkit' | 'googlefit' | 'manual' | 'web_sensor';
}

export interface CoinTransaction {
  id: string;
  uid: string;
  type: 'milestone_claim' | 'referral_reward' | 'redemption_debit' | 'ad_reward' | 'daily_spin';
  amount: number; // positive or negative
  timestamp: string;
  relatedId?: string;
  description: string;
}

export interface RedeemOption {
  id: string;
  type: 'transfer' | 'gift' | 'voucher';
  title: string;
  payoutMethod: 'Bank Transfer' | 'PayPal' | 'UPI' | 'Amazon Gift Card' | 'Google Play' | 'Physical Gift';
  cashValue: string; // e.g. "£15", "$25", "₹1,000"
  coinCost: number; // e.g. 3200
  quantityAvailable: number;
  totalPool: number;
  distributedAmount: number;
  beneficiaryCount: number;
  isPremiumOnly: boolean;
  imageUrl?: string;
  currency: string;
}

export interface RedemptionRecord {
  id: string;
  uid: string;
  rewardId: string;
  rewardTitle: string;
  coinCost: number;
  cashValue: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payoutDetails: {
    method: string;
    accountHolder?: string;
    accountNumber?: string;
    routingOrIfsc?: string;
    paypalEmail?: string;
    upiId?: string;
  };
  requestedAt: string;
  completedAt?: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredName: string;
  referredAvatar: string;
  dateInvited: string;
  consecutiveActiveDays: number;
  rewardClaimed: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  bgColor: string;
  unlocked: boolean;
  unlockedAt?: string;
  unlockCriteria: string;
}

export interface LeaderboardEntry {
  uid: string;
  name: string;
  handle: string;
  avatarUrl: string;
  level: number;
  streakDays: number;
  coinBalance: number;
  steps: number;
  rank: number;
  updatedTimeAgo: string;
  isCurrentUser?: boolean;
  isPremium?: boolean;
}

export interface CoachChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
