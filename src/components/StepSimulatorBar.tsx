import React, { useState } from 'react';
import { Footprints, Activity, Plus, RotateCcw, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';

interface StepSimulatorBarProps {
  currentSteps: number;
  onAddSteps: (amount: number) => void;
  onSetSteps: (steps: number) => void;
  onResetSteps: () => void;
  onToggleMotionSensor: () => Promise<boolean>;
  isSensorActive: boolean;
}

export const StepSimulatorBar: React.FC<StepSimulatorBarProps> = ({
  currentSteps,
  onAddSteps,
  onSetSteps,
  onResetSteps,
  onToggleMotionSensor,
  isSensorActive,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md text-white rounded-2xl p-3 border border-slate-700/80 shadow-lg select-none">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Footprints className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-200">
            HealthKit / Pedometer Simulation
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">
            {currentSteps.toLocaleString()} steps
          </span>
        </div>
        <button
          className="text-slate-400 hover:text-white p-1"
          aria-label="Toggle pedometer controls"
        >
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={onToggleMotionSensor}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                isSensorActive
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isSensorActive ? 'Motion Sensor Active' : 'Enable Device Motion'}</span>
            </button>
            <button
              onClick={onResetSteps}
              className="py-1.5 px-3 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-1 transition-colors"
              title="Reset today's steps to 0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => onAddSteps(250)}
              className="py-2 px-1 rounded-xl bg-slate-800/90 hover:bg-orange-600 text-slate-200 hover:text-white text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5"
            >
              <span className="text-[10px] text-slate-400">Walk</span>
              <span>+250</span>
            </button>
            <button
              onClick={() => onAddSteps(1000)}
              className="py-2 px-1 rounded-xl bg-slate-800/90 hover:bg-orange-600 text-slate-200 hover:text-white text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5"
            >
              <span className="text-[10px] text-slate-400">Mile</span>
              <span>+1,000</span>
            </button>
            <button
              onClick={() => onAddSteps(3500)}
              className="py-2 px-1 rounded-xl bg-slate-800/90 hover:bg-orange-600 text-slate-200 hover:text-white text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5"
            >
              <span className="text-[10px] text-slate-400">Run</span>
              <span>+3,500</span>
            </button>
            <button
              onClick={() => onSetSteps(20000)}
              className="py-2 px-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 shadow-xs"
            >
              <span className="text-[10px] text-orange-100">Max Goal</span>
              <span>20,000</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            Simulate native HealthKit/Google Fit walking events to trigger real milestone claims!
          </p>
        </div>
      )}
    </div>
  );
};
