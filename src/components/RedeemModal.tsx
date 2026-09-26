import React, { useState } from 'react';
import { RedeemOption } from '../types';
import { X, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RedeemModalProps {
  reward: RedeemOption | null;
  userCoinBalance: number;
  onClose: () => void;
  onConfirm: (reward: RedeemOption, payoutDetails: any) => Promise<void>;
}

export const RedeemModal: React.FC<RedeemModalProps> = ({
  reward,
  userCoinBalance,
  onClose,
  onConfirm,
}) => {
  if (!reward) return null;

  const [accountNumber, setAccountNumber] = useState('');
  const [routingOrIfsc, setRoutingOrIfsc] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [upiId, setUpiId] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [accountHolder, setAccountHolder] = useState('Emilia López');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const hasEnoughCoins = userCoinBalance >= reward.coinCost;
  const balanceAfter = userCoinBalance - reward.coinCost;

  const handleRedeem = async () => {
    if (!hasEnoughCoins) return;

    // Basic validation
    let payoutDetails: any = { method: reward.payoutMethod };
    if (reward.payoutMethod === 'Bank Transfer') {
      if (!accountNumber || !routingOrIfsc) {
        setErrorMsg('Please enter account number and routing / sort code');
        return;
      }
      payoutDetails = { method: 'Bank Transfer', accountHolder, accountNumber, routingOrIfsc };
    } else if (reward.payoutMethod === 'PayPal') {
      if (!paypalEmail || !paypalEmail.includes('@')) {
        setErrorMsg('Please enter a valid PayPal email address');
        return;
      }
      payoutDetails = { method: 'PayPal', paypalEmail };
    } else if (reward.payoutMethod === 'UPI') {
      if (!upiId || !upiId.includes('@')) {
        setErrorMsg('Please enter a valid UPI ID (e.g. mobile@upi)');
        return;
      }
      payoutDetails = { method: 'UPI', upiId };
    } else {
      if (!shippingAddress && reward.type === 'gift') {
        setErrorMsg('Please enter delivery address');
        return;
      }
      payoutDetails = { method: reward.payoutMethod, shippingAddress, accountHolder };
    }

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await onConfirm(reward, payoutDetails);
      setIsSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Redemption failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Redemption Requested!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Status: <span className="font-bold text-amber-600">Pending Review & Disbursement</span>
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Reward:</span>
                <span className="font-bold text-slate-800">{reward.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cash Value:</span>
                <span className="font-black text-teal-600">{reward.cashValue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Debited:</span>
                <span className="font-bold text-orange-600">-{reward.coinCost.toLocaleString()} 🪙</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Remaining Balance:</span>
                <span className="font-bold text-slate-800">{balanceAfter.toLocaleString()} 🪙</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Disbursements are automatically handled by licensed payment partners (PayPal / Bank Transfer API / Tremendous) within 24-48 business hours.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-full font-black text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-md"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-xl">
                🪙
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">{reward.title}</h3>
                <p className="text-xs text-slate-500 font-semibold">{reward.cashValue} Payout</p>
              </div>
            </div>

            {/* Financial Math Summary Card */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 mb-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Your Current Balance</span>
                <span className="font-bold text-slate-800">{userCoinBalance.toLocaleString()} 🪙</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Reward Coin Cost</span>
                <span className="font-bold text-orange-600">-{reward.coinCost.toLocaleString()} 🪙</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-700">Balance After Redemption</span>
                <span
                  className={`font-black ${
                    hasEnoughCoins ? 'text-teal-600' : 'text-red-500'
                  }`}
                >
                  {hasEnoughCoins ? `${balanceAfter.toLocaleString()} 🪙` : 'Insufficient Coins'}
                </span>
              </div>
            </div>

            {/* Payment Details Input */}
            <div className="space-y-3 mb-5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600">
                Payout Destination ({reward.payoutMethod})
              </label>

              {reward.payoutMethod === 'Bank Transfer' && (
                <>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Account Holder Full Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="IBAN / Account Number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <input
                    type="text"
                    value={routingOrIfsc}
                    onChange={(e) => setRoutingOrIfsc(e.target.value)}
                    placeholder="Routing Number / Sort Code / BIC"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </>
              )}

              {reward.payoutMethod === 'PayPal' && (
                <input
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="your-paypal@email.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
                />
              )}

              {reward.payoutMethod === 'UPI' && (
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. 9876543210@upi or name@okaxis"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
                />
              )}

              {(reward.payoutMethod === 'Amazon Gift Card' || reward.payoutMethod === 'Google Play') && (
                <input
                  type="email"
                  value={paypalEmail || 'emilia.lopez@example.com'}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="Delivery Email for digital code"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
                />
              )}

              {reward.payoutMethod === 'Physical Gift' && (
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Full Mailing Address & Phone Number for courier delivery"
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
                />
              )}

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50 p-2.5 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Encrypted server transaction. Atomic debit from Cloud Firestore.</span>
            </div>

            <button
              onClick={handleRedeem}
              disabled={!hasEnoughCoins || isSubmitting}
              className={`w-full py-3.5 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all ${
                hasEnoughCoins && !isSubmitting
                  ? 'bg-gradient-to-r from-orange-500 to-[#FF5500] text-white shadow-lg shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.98]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : hasEnoughCoins ? (
                <>
                  <span>Confirm Redemption</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <span>Need {reward.coinCost - userCoinBalance} More Coins</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
