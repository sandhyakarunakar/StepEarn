import React, { useState, useMemo } from 'react';
import { generateMonthHistory } from '../services/seedData';
import { calculateEstimatedCalories, calculateEstimatedDistanceKm } from '../config/economy';
import { X, Calendar, Star, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

interface ProgressViewProps {
  currentStepsToday: number;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ currentStepsToday }) => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [selectedDay, setSelectedDay] = useState<{
    day: number;
    steps: number;
    coins: number;
    isBonusStar?: boolean;
    dateLabel: string;
  } | null>(null);

  // Dynamic date state
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const todayDate = new Date().getDate();
  const isCurrentMonth =
    year === new Date().getFullYear() && month === new Date().getMonth();

  // Generate dynamic month history
  const monthHistory = useMemo(() => {
    const history = generateMonthHistory(year, month);
    if (isCurrentMonth && history[todayDate]) {
      history[todayDate].steps = currentStepsToday;
      history[todayDate].percent = Math.min(Math.round((currentStepsToday / 20000) * 100), 100);
      history[todayDate].coins = Math.min(Math.floor(currentStepsToday / 1000), 25);
    }
    return history;
  }, [year, month, isCurrentMonth, todayDate, currentStepsToday]);

  // Compute actual dynamic statistics
  const { averageSteps, comparisonDelta, activeDaysCount } = useMemo(() => {
    let totalSteps = 0;
    let count = 0;
    const maxDay = isCurrentMonth ? todayDate : new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= maxDay; d++) {
      const dayData = monthHistory[d];
      if (dayData && dayData.steps > 0) {
        totalSteps += dayData.steps;
        count++;
      }
    }

    const avg = count > 0 ? Math.round(totalSteps / count) : currentStepsToday;

    // Compare with previous month baseline
    const prevHistory = generateMonthHistory(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1);
    let prevTotal = 0;
    let prevCount = 0;
    Object.values(prevHistory).forEach((h) => {
      if (h.steps > 0) {
        prevTotal += h.steps;
        prevCount++;
      }
    });
    const prevAvg = prevCount > 0 ? Math.round(prevTotal / prevCount) : Math.max(1, avg - 1200);
    const delta = avg - prevAvg;

    return {
      averageSteps: avg,
      comparisonDelta: delta,
      activeDaysCount: count,
    };
  }, [monthHistory, isCurrentMonth, todayDate, year, month, currentStepsToday]);

  const monthLabel = currentDate.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const prevMonthLabel = new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOffset = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    const next = new Date(year, month + 1, 1);
    if (next <= new Date()) {
      setCurrentDate(next);
    }
  };

  return (
    <div className="space-y-4 select-none">
      {/* Sub-tab Pill: DAY | WEEK | MONTH */}
      <div className="flex justify-center">
        <div className="flex p-1 bg-slate-100 rounded-full w-64 shadow-2xs">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-1.5 rounded-full text-xs font-black uppercase transition-all ${
                period === p
                  ? 'bg-[#FF7A1F] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Month Header and Delta */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-black text-slate-500">
          <span>{monthLabel}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              disabled={isCurrentMonth}
              className={`p-1 rounded-full text-slate-600 transition-colors ${
                isCurrentMonth ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100'
              }`}
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-black text-slate-900 font-sans tracking-tight">
            {averageSteps.toLocaleString()}
          </div>
          <div
            className={`flex items-center gap-1 text-xs font-black ${
              comparisonDelta >= 0 ? 'text-emerald-600' : 'text-orange-600'
            }`}
          >
            <span>
              {comparisonDelta >= 0 ? `↑ +${comparisonDelta.toLocaleString()}` : `↓ ${comparisonDelta.toLocaleString()}`}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">
              vs {prevMonthLabel}
            </span>
          </div>
        </div>
        <p className="text-[11px] font-bold text-slate-400">
          steps on average ({activeDaysCount} active days recorded)
        </p>
      </div>

      {/* Calendar Grid Header (SUN .. SAT) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 border-b border-slate-100 pb-2">
          {daysOfWeek.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {/* Calendar Days Circular Rings */}
        <div className="grid grid-cols-7 gap-y-3 gap-x-1">
          {/* Leading empty days */}
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="w-full aspect-square" />
          ))}

          {/* Days in Month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const data = monthHistory[dayNum];
            const isToday = isCurrentMonth && dayNum === todayDate;
            const isFuture = isCurrentMonth && dayNum > todayDate;

            if (isFuture) {
              return (
                <div
                  key={dayNum}
                  className="flex flex-col items-center justify-center w-full aspect-square text-slate-300 font-bold text-xs"
                >
                  <div className="w-9 h-9 rounded-full border border-slate-100 flex items-center justify-center">
                    {dayNum}
                  </div>
                </div>
              );
            }

            const steps = data ? data.steps : 0;
            const coins = data ? data.coins : 0;
            const hasStar = data?.isBonusStar;
            const percent = data ? data.percent : 0;

            const strokeColor = percent >= 80 ? '#10B981' : percent >= 40 ? '#FF7A1F' : '#CBD5E1';

            return (
              <div
                key={dayNum}
                onClick={() =>
                  setSelectedDay({
                    day: dayNum,
                    steps,
                    coins,
                    isBonusStar: hasStar,
                    dateLabel: new Date(year, month, dayNum).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }),
                  })
                }
                className={`flex flex-col items-center justify-center cursor-pointer group select-none relative ${
                  isToday ? 'scale-105' : ''
                }`}
              >
                {/* SVG Mini Ring */}
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke={isToday ? '#FED7AA' : '#F1F5F9'}
                      strokeWidth={isToday ? '3' : '2.5'}
                      fill="none"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke={strokeColor}
                      strokeWidth={isToday ? '3' : '2.5'}
                      strokeDasharray={100}
                      strokeDashoffset={100 - (percent / 100) * 100}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>

                  {/* Day Number */}
                  <span
                    className={`absolute text-[11px] font-black ${
                      isToday ? 'text-orange-600 font-extrabold' : 'text-slate-800'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {/* Star Badge on bonus milestone days */}
                  {hasStar && (
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white shadow-2xs">
                      ★
                    </div>
                  )}
                </div>

                {/* Coin Badge under ring */}
                <div className="mt-0.5 flex items-center gap-0.5 text-[9px] font-black text-teal-600 bg-teal-50 px-1.5 py-0.2 rounded-full">
                  <span className="text-[8px]">w</span>
                  <span>{coins}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Data Source Note */}
      <div className="text-center pt-2">
        <p className="text-[11px] font-semibold text-slate-400">
          Data source: <span className="font-bold text-slate-600">Apple Health</span> (iOS) /{' '}
          <span className="font-bold text-slate-600">Google Fit</span> (Android)
        </p>
      </div>

      {/* Day Detail Sheet Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 text-slate-800 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedDay(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-orange-500" />
              <h4 className="text-base font-black text-slate-900">
                {selectedDay.dateLabel}
              </h4>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Steps Logged:</span>
                <span className="font-black text-slate-800 font-sans">
                  {selectedDay.steps.toLocaleString()} steps
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Coins Awarded:</span>
                <span className="font-black text-teal-600">
                  +{selectedDay.coins} 🪙
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Distance:</span>
                <span className="font-bold text-slate-800">
                  {calculateEstimatedDistanceKm(selectedDay.steps)} km
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Calories Burned:</span>
                <span className="font-bold text-slate-800">
                  {calculateEstimatedCalories(selectedDay.steps)} kcal
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="w-full mt-4 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
