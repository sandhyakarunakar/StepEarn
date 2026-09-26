import React, { useState } from 'react';
import { RedeemOption, CoinTransaction } from '../types';
import { RedeemModal } from '../components/RedeemModal';
import { Info, ChevronRight, X, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

interface WalletScreenProps {
  coinBalance: number;
  redeemOptions: RedeemOption[];
  transactions: CoinTransaction[];
  onRedeemReward: (reward: RedeemOption, payoutDetails: any) => Promise<void>;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({
  coinBalance,
  redeemOptions,
  transactions,
  onRedeemReward,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'coming' | 'completed'>('all');
  const [selectedReward, setSelectedReward] = useState<RedeemOption | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Filter rewards based on tab
  const filteredRewards = redeemOptions.filter((r) => {
    if (activeTab === 'available') return coinBalance >= r.coinCost && r.quantityAvailable > 0;
    if (activeTab === 'coming') return r.isPremiumOnly || r.quantityAvailable <= 5;
    return true;
  });

  const transfers = filteredRewards.filter((r) => r.type === 'transfer' || r.type === 'voucher');
  const gifts = filteredRewards.filter((r) => r.type === 'gift');

  return (
    <div className="flex-1 pb-28 space-y-4 max-w-md mx-auto w-full">
      {/* Top Header: Curved Teal Banner matching Screenshot 2 */}
      <div className="bg-[#0FBF9F] text-white pt-6 pb-8 px-6 rounded-b-[32px] shadow-sm relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-0 -left-8 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

        <div className="flex justify-between items-center mb-3">
          <div className="w-16" /> {/* spacer */}
          <h2 className="text-sm font-black tracking-wide text-white/90 text-center">
            Spend your Wards
          </h2>
          {/* History > Button */}
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-black px-3 py-1 rounded-full backdrop-blur-xs transition-all active:scale-95"
          >
            <span>History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Large Balance Display */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-sm text-[#0FBF9F] shadow-sm">
            W
          </div>
          <span className="text-4xl font-black tracking-tight font-sans">
            {coinBalance.toLocaleString()}
          </span>
          <button
            onClick={() => setShowInfo(true)}
            className="text-white/80 hover:text-white p-1"
            title="Coin valuation and reward details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs (Horizontal Pill Bar) matching Screenshot 2 */}
      <div className="px-4">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-full">
          {(['all', 'available', 'coming', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 px-2 rounded-full text-xs font-black capitalize transition-all ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Section 1: Transfers */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900">Transfers</h3>
          <button
            onClick={() => setActiveTab('all')}
            className="text-xs font-black text-orange-600 hover:underline"
          >
            See more
          </button>
        </div>

        <div className="flex gap-3.5 overflow-x-auto pb-2 no-scrollbar">
          {transfers.map((reward) => {
            const hasEnough = coinBalance >= reward.coinCost;
            return (
              <div
                key={reward.id}
                onClick={() => setSelectedReward(reward)}
                className="w-56 shrink-0 bg-white rounded-3xl p-4 border border-slate-100 shadow-sm hover:border-orange-300 transition-all cursor-pointer relative flex flex-col justify-between"
              >
                {/* Top Row: Quantity Chip + Premium Ribbon */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    Quantity: {reward.quantityAvailable}
                  </span>
                  {reward.isPremiumOnly && (
                    <span className="text-[9px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                      <span>★</span> PREMIUM
                    </span>
                  )}
                </div>

                {/* Big Payout Amount & Coin Badge */}
                <div className="relative py-2 flex items-center justify-between">
                  <div className="text-3xl font-black text-slate-900 font-sans tracking-tight">
                    {reward.cashValue}
                  </div>
                  {/* Circular Orange Coin Badge */}
                  <div className="flex items-center gap-1 bg-[#FF6A1A] text-white px-2.5 py-1 rounded-full text-xs font-black shadow-xs">
                    <span className="text-[10px]">W</span>
                    <span>{reward.coinCost.toLocaleString()}</span>
                  </div>
                </div>

                {/* Cash Illustration Placeholder / Bank note */}
                <div className="h-16 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 border border-teal-100/60 my-2 flex items-center justify-center overflow-hidden relative">
                  <span className="text-3xl opacity-80">💵</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent pointer-events-none" />
                </div>

                {/* Footer: Title, Distributed Bar, Beneficiaries */}
                <div className="mt-2 space-y-2">
                  <p className="text-xs font-black text-slate-800 truncate">
                    {reward.title}
                  </p>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>DISTRIBUTED</span>
                      <span>{reward.currency}{reward.totalPool.toLocaleString()}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            (reward.distributedAmount / reward.totalPool) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="font-bold text-slate-400">BENEFICIARIES</span>
                    <span className="font-black text-slate-700">👥 {reward.beneficiaryCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Gifts matching Screenshot 2 */}
      <div className="px-4 space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900">Gifts</h3>
          <button
            onClick={() => setActiveTab('all')}
            className="text-xs font-black text-orange-600 hover:underline"
          >
            See more
          </button>
        </div>

        <div className="flex gap-3.5 overflow-x-auto pb-2 no-scrollbar">
          {gifts.map((reward) => (
            <div
              key={reward.id}
              onClick={() => setSelectedReward(reward)}
              className="w-56 shrink-0 bg-white rounded-3xl p-4 border border-slate-100 shadow-sm hover:border-orange-300 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  Quantity: {reward.quantityAvailable}
                </span>
                <div className="flex items-center gap-1 bg-orange-500 text-white px-2 py-0.5 rounded-full text-[11px] font-black">
                  <span>W</span>
                  <span>{reward.coinCost.toLocaleString()}</span>
                </div>
              </div>

              <div className="h-28 rounded-2xl overflow-hidden bg-slate-50 my-1 relative border border-slate-100">
                <img
                  src={reward.imageUrl}
                  alt={reward.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-2">
                <p className="text-xs font-black text-slate-900 line-clamp-1">
                  {reward.title}
                </p>
                <p className="text-[11px] font-bold text-teal-600 mt-0.5">
                  Worth {reward.cashValue}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Redeem Modal */}
      <RedeemModal
        reward={selectedReward}
        userCoinBalance={coinBalance}
        onClose={() => setSelectedReward(null)}
        onConfirm={onRedeemReward}
      />

      {/* Info Tooltip Sheet */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-slate-800 shadow-2xl relative">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center text-xl font-black mb-3">
              W
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">About StepEarn Coins</h3>
            <p className="text-xs text-slate-600 leading-relaxed space-y-2">
              StepEarn coins (Wards) are earned solely by walking and completing healthy active habits.
              Every 1,000 steps adds to your daily rewards. Coins never expire and can be redeemed for real bank payouts, PayPal cash, UPI deposits, or physical prizes.
            </p>
            <div className="mt-4 p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-500 font-semibold border border-slate-100">
              💡 Rate tip: 3,200 Coins = £15 Cash Payout directly to your bank account.
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="w-full mt-4 py-3 rounded-full bg-slate-900 text-white font-black text-xs"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-slate-800 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <h3 className="text-base font-black text-slate-900">Coin Ledger History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 shrink-0">
              Server-authoritative immutable transaction ledger
            </p>

            <div className="flex-1 overflow-y-auto mt-3 space-y-2.5 pr-1">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No transactions recorded yet. Walk to earn coins!
                </div>
              ) : (
                transactions.map((tx) => {
                  const isCredit = tx.amount > 0;
                  return (
                    <div
                      key={tx.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            isCredit
                              ? 'bg-teal-100 text-teal-600'
                              : 'bg-orange-100 text-orange-600'
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 line-clamp-1">
                            {tx.description}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(tx.timestamp).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`font-black text-sm ${
                          isCredit ? 'text-teal-600' : 'text-orange-600'
                        }`}
                      >
                        {isCredit ? `+${tx.amount}` : tx.amount} 🪙
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
