import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, X } from 'lucide-react';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdCompleted: () => void;
}

export const AdModal: React.FC<AdModalProps> = ({ isOpen, onClose, onAdCompleted }) => {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(5);
      setIsFinished(false);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center text-white border border-slate-700 shadow-2xl relative overflow-hidden">
        {/* Close Button only if finished */}
        {isFinished && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-400 mx-auto flex items-center justify-center mb-4 border border-orange-500/30">
          <Play className="w-8 h-8 fill-current translate-x-0.5" />
        </div>

        <h3 className="text-xl font-black mb-1">Sponsored Fitness Partner</h3>
        <p className="text-xs text-slate-400 mb-6">
          Support StepEarn by watching this 5-second health preview to earn free coins!
        </p>

        {/* Video Simulation Box */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 aspect-video mb-6 flex flex-col items-center justify-center p-4 text-center">
          <div className="text-4xl mb-2">👟</div>
          <p className="text-sm font-bold text-orange-300">ActiveStride™ Ergonomic Cloud Insole</p>
          <p className="text-[11px] text-slate-400 mt-1">Walk 30% longer with reduced joint fatigue</p>

          <div className="absolute bottom-2 right-3 bg-black/70 px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-300">
            {isFinished ? 'Reward Unlocked' : `Ad ends in ${secondsLeft}s`}
          </div>
        </div>

        {isFinished ? (
          <button
            onClick={() => {
              onAdCompleted();
              onClose();
            }}
            className="w-full py-3.5 px-6 rounded-full font-black text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Claim +10 StepEarn Coins</span>
          </button>
        ) : (
          <div className="w-full py-3 px-4 rounded-full bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span>Watching ad... ({secondsLeft}s)</span>
          </div>
        )}
      </div>
    </div>
  );
};
