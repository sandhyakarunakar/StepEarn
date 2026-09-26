import React, { useState } from 'react';
import { X, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardWon: (amount: number) => void;
}

export const SpinWheelModal: React.FC<SpinWheelModalProps> = ({ isOpen, onClose, onRewardWon }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonAmount, setWonAmount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (spinning || wonAmount !== null) return;
    setSpinning(true);

    const outcomes = [5, 10, 15, 20, 8, 12];
    const randomIndex = Math.floor(Math.random() * outcomes.length);
    const prize = outcomes[randomIndex];

    const extraRounds = 5 * 360;
    const segmentAngle = 360 / outcomes.length;
    const targetDeg = extraRounds + randomIndex * segmentAngle + segmentAngle / 2;

    setRotation(targetDeg);

    setTimeout(() => {
      setSpinning(false);
      setWonAmount(prize);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
      onRewardWon(prize);
    }, 3200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center text-white border border-slate-700 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-xl font-black text-white">Daily Lucky Spin</h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Spin once every day to win bonus StepEarn coins!
        </p>

        {/* Wheel Graphic */}
        <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
          {/* Pointer */}
          <div className="absolute -top-2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 filter drop-shadow" />

          {/* Rotating circle */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-400 shadow-xl overflow-hidden relative"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 3.2s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none',
              background: 'conic-gradient(#FF6A1A 0deg 60deg, #0FBF9F 60deg 120deg, #F59E0B 120deg 180deg, #6366F1 180deg 240deg, #EC4899 240deg 300deg, #3B82F6 300deg 360deg)',
            }}
          >
            {/* Center hub */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-xs font-black shadow-md">
                🪙
              </div>
            </div>
          </div>
        </div>

        {wonAmount !== null ? (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl">
              <p className="text-xs text-emerald-300 font-bold">Congratulations!</p>
              <p className="text-2xl font-black text-white mt-0.5">+{wonAmount} Coins Won!</p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm"
            >
              Collect & Continue
            </button>
          </div>
        ) : (
          <button
            onClick={handleSpin}
            disabled={spinning}
            className={`w-full py-3.5 rounded-full font-black text-sm shadow-lg transition-all ${
              spinning
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/30 hover:scale-102 active:scale-98'
            }`}
          >
            {spinning ? 'Spinning...' : 'Spin the Wheel!'}
          </button>
        )}
      </div>
    </div>
  );
};
