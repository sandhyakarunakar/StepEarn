import React, { useMemo } from 'react';
import { Mascot } from './Mascot';
import { MILESTONES, MAX_DAILY_STEPS, MilestoneDefinition } from '../config/economy';

interface StepGaugeProps {
  currentSteps: number;
  claimedMilestones: number[];
  userLevel?: number;
  levelProgress?: string; // e.g. "1/3"
  onClaimMilestone: (threshold: number, event: React.MouseEvent) => void;
  onConvertAll: () => void;
  isConverting?: boolean;
}

export const StepGauge: React.FC<StepGaugeProps> = ({
  currentSteps,
  claimedMilestones,
  userLevel = 3,
  levelProgress = '1/3',
  onClaimMilestone,
  onConvertAll,
  isConverting = false,
}) => {
  // Arc geometry:
  // Speedometer style: starts at 145 degrees (bottom left) and sweeps 250 degrees to 395 (bottom right)
  const START_ANGLE = 145;
  const SWEEP_ANGLE = 250;
  const RADIUS = 142;
  const CENTER_X = 180;
  const CENTER_Y = 175;

  const progressFraction = Math.min(Math.max(currentSteps / MAX_DAILY_STEPS, 0), 1);
  const currentAngle = START_ANGLE + progressFraction * SWEEP_ANGLE;

  // Helper to convert polar degrees to SVG cartesian coords
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const bgArcPath = useMemo(
    () => describeArc(CENTER_X, CENTER_Y, RADIUS, START_ANGLE, START_ANGLE + SWEEP_ANGLE),
    []
  );

  const fillArcPath = useMemo(() => {
    if (progressFraction <= 0.001) return '';
    return describeArc(CENTER_X, CENTER_Y, RADIUS, START_ANGLE, currentAngle);
  }, [currentAngle, progressFraction]);

  // Major ticks matching the design: 2,100, 5,200, 8,300, 12,400, 17,000
  const majorTicks = [
    { value: 2100, label: '2,100' },
    { value: 5200, label: '5,200' },
    { value: 8300, label: '8,300' },
    { value: 12400, label: '12,400' },
    { value: 17000, label: '17,000' },
  ];

  // Minor ticks around the arc for the realistic speedometer look
  const minorTickLines = useMemo(() => {
    const lines = [];
    const tickCount = 40;
    for (let i = 0; i <= tickCount; i++) {
      const angle = START_ANGLE + (i / tickCount) * SWEEP_ANGLE;
      const isMajor = i % 8 === 0;
      const rInner = RADIUS - (isMajor ? 12 : 6);
      const rOuter = RADIUS - 2;
      const p1 = polarToCartesian(CENTER_X, CENTER_Y, rInner, angle);
      const p2 = polarToCartesian(CENTER_X, CENTER_Y, rOuter, angle);
      lines.push({
        id: i,
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        isMajor,
      });
    }
    return lines;
  }, []);

  // Display markers: 5 prominent milestone pills around the arc like in Screenshot 1
  // (2k -> 6w, 5k -> 6w/star, 8k -> 10w, 12k -> 15w, 17k/20k -> 25w)
  // Plus every eligible unclaimed milestone is interactive!
  const displayMarkers: { milestone: MilestoneDefinition; hasStar?: boolean }[] = [
    { milestone: MILESTONES[1] }, // ~2,100
    { milestone: MILESTONES[4], hasStar: true }, // ~5,200
    { milestone: MILESTONES[7] }, // ~8,300
    { milestone: MILESTONES[11] }, // ~12,400
    { milestone: MILESTONES[19], hasStar: true }, // 20,000 (25 coins)
  ];

  // Check if any milestone is currently unclaimed and ready
  const eligibleUnclaimed = MILESTONES.filter(
    (m) => currentSteps >= m.threshold && !claimedMilestones.includes(m.threshold)
  );

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-sm mx-auto select-none">
      {/* SVG Speedometer Gauge */}
      <div className="relative w-full aspect-[360/320] flex items-center justify-center">
        <svg
          viewBox="0 0 360 320"
          className="w-full h-full drop-shadow-sm overflow-visible"
        >
          <defs>
            <linearGradient id="gaugeTrackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
            <linearGradient id="gaugeProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF8A3D" />
              <stop offset="50%" stopColor="#FF6A1A" />
              <stop offset="100%" stopColor="#FF4D00" />
            </linearGradient>
            <filter id="glowOrange" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FF6A1A" floodOpacity="0.75" />
            </filter>
            <filter id="goldPulse" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#F59E0B" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d={bgArcPath}
            fill="none"
            stroke="url(#gaugeTrackGrad)"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Minor Tick Marks */}
          {minorTickLines.map((t) => (
            <line
              key={t.id}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.isMajor ? '#94A3B8' : '#CBD5E1'}
              strokeWidth={t.isMajor ? 2.5 : 1.5}
              strokeLinecap="round"
            />
          ))}

          {/* Active Orange Progress Arc */}
          {fillArcPath && (
            <path
              d={fillArcPath}
              fill="none"
              stroke="url(#gaugeProgressGrad)"
              strokeWidth="12"
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          )}

          {/* Major Numerical Step Ticks (2,100 / 5,200 / 8,300 / 12,400 / 17,000) */}
          {majorTicks.map((tick) => {
            const fraction = tick.value / MAX_DAILY_STEPS;
            const angle = START_ANGLE + fraction * SWEEP_ANGLE;
            const pos = polarToCartesian(CENTER_X, CENTER_Y, RADIUS - 28, angle);
            return (
              <text
                key={tick.value}
                x={pos.x}
                y={pos.y + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="#64748B"
                className="font-sans"
              >
                {tick.label}
              </text>
            );
          })}

          {/* Milestone markers along the arc */}
          {displayMarkers.map(({ milestone, hasStar }) => {
            const fraction = milestone.threshold / MAX_DAILY_STEPS;
            const angle = START_ANGLE + fraction * SWEEP_ANGLE;
            // Place outside the arc
            const pos = polarToCartesian(CENTER_X, CENTER_Y, RADIUS + 25, angle);
            const isReached = currentSteps >= milestone.threshold;
            const isClaimed = claimedMilestones.includes(milestone.threshold);
            const isReadyToClaim = isReached && !isClaimed;

            return (
              <g
                key={milestone.threshold}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer select-none transition-transform duration-300"
                onClick={(e: any) => {
                  if (isReadyToClaim) {
                    onClaimMilestone(milestone.threshold, e);
                  }
                }}
              >
                {/* Star icon if special milestone */}
                {hasStar && (
                  <path
                    d="M0 -15 L2.5 -8 L9.5 -8 L4 -3.5 L6 3.5 L0 0 L-6 3.5 L-4 -3.5 L-9.5 -8 L-2.5 -8 Z"
                    fill={isReached ? '#FF6A1A' : '#CBD5E1'}
                    transform="scale(0.85)"
                  />
                )}

                {/* Pill Chip */}
                {isReadyToClaim ? (
                  // GLOWING / PULSING UNCLAIMED MILESTONE
                  <g filter="url(#goldPulse)">
                    <rect
                      x="-22"
                      y="-11"
                      width="44"
                      height="22"
                      rx="11"
                      fill="#FF6A1A"
                      className="animate-pulse"
                    />
                    <circle cx="-11" cy="0" r="6" fill="#FFFFFF" />
                    <text
                      x="-11"
                      y="3"
                      textAnchor="middle"
                      fontSize="8"
                      fontWeight="900"
                      fill="#FF6A1A"
                    >
                      W
                    </text>
                    <text
                      x="7"
                      y="4"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="900"
                      fill="#FFFFFF"
                    >
                      {milestone.cumulativeCoins}
                    </text>
                  </g>
                ) : (
                  // REGULAR OR CLAIMED PILL
                  <g>
                    <rect
                      x="-20"
                      y="-10"
                      width="40"
                      height="20"
                      rx="10"
                      fill={isClaimed ? '#F1F5F9' : '#FFFFFF'}
                      stroke={isClaimed ? '#E2E8F0' : '#E2E8F0'}
                      strokeWidth="1.5"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
                    />
                    <circle
                      cx="-10"
                      cy="0"
                      r="5"
                      fill={isClaimed ? '#94A3B8' : '#64748B'}
                    />
                    <text
                      x="-10"
                      y="2.8"
                      textAnchor="middle"
                      fontSize="7"
                      fontWeight="800"
                      fill="#FFFFFF"
                    >
                      W
                    </text>
                    <text
                      x="7"
                      y="3.5"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="800"
                      fill={isClaimed ? '#94A3B8' : '#475569'}
                    >
                      {milestone.cumulativeCoins}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Center Mascot & Level Indicator */}
        <div className="absolute top-[35%] flex flex-col items-center justify-center pointer-events-none">
          <Mascot size={110} mood={eligibleUnclaimed.length > 0 ? 'cheer' : 'normal'} />

          {/* Level pill: "Lvl 3 1/3 ★" */}
          <div className="mt-1 flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-slate-100">
            <span className="text-xs font-black text-slate-800">Lvl {userLevel}</span>
            <span className="text-[11px] font-bold text-teal-600">{levelProgress}</span>
            <span className="text-amber-400 text-xs">★</span>
          </div>
        </div>
      </div>

      {/* Live Step Counter */}
      <div className="text-center mt-[-10px] mb-3">
        <div className="text-5xl font-black tracking-tight text-slate-900 font-sans">
          {currentSteps.toLocaleString()}
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
          steps taken
        </p>
      </div>

      {/* Claim Prompt Banner if milestone is glowing */}
      {eligibleUnclaimed.length > 0 && (
        <div className="w-full mb-3 px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2">
            <span className="text-base">🪙</span>
            <p className="text-xs font-bold text-orange-900">
              {eligibleUnclaimed.length} milestone{eligibleUnclaimed.length > 1 ? 's' : ''} ready to claim!
            </p>
          </div>
          <span className="text-[11px] font-black text-orange-600 uppercase tracking-wider bg-orange-100 px-2 py-0.5 rounded-full">
            Tap glowing coin
          </span>
        </div>
      )}

      {/* Primary CTA Button: "Convert my steps" */}
      <button
        onClick={onConvertAll}
        disabled={isConverting || eligibleUnclaimed.length === 0}
        className={`w-full py-3.5 px-6 rounded-full font-black text-base shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
          eligibleUnclaimed.length > 0
            ? 'bg-gradient-to-r from-[#FF7A1F] to-[#FF5500] text-white shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98]'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
        }`}
      >
        {isConverting ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <span>Convert my steps</span>
        )}
      </button>
    </div>
  );
};
