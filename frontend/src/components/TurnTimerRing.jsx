import React from 'react';
import { motion } from 'framer-motion';

const TIMER_MAX = 30;
const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Circular countdown ring that displays the server-synced turnTimer.
 * Colors transition: calm → amber → urgent red based on remaining time.
 */
export default function TurnTimerRing({ turnTimer, isMyTurn }) {
  const fraction = Math.max(0, Math.min(1, turnTimer / TIMER_MAX));
  const offset = CIRCUMFERENCE * (1 - fraction);

  // Color thresholds
  let strokeColor = '#9ca3af'; // gray-400 (calm, >15s)
  let textColor = 'text-gray-500';
  let bgRing = '#f3f4f6'; // gray-100

  if (turnTimer <= 10) {
    strokeColor = '#ef4444'; // red-500
    textColor = 'text-red-500';
    bgRing = '#fef2f2'; // red-50
  } else if (turnTimer <= 15) {
    strokeColor = '#f59e0b'; // amber-500
    textColor = 'text-amber-500';
    bgRing = '#fffbeb'; // amber-50
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width="52"
        height="52"
        viewBox="0 0 52 52"
        className="transform -rotate-90"
      >
        {/* Background ring */}
        <circle
          cx="26"
          cy="26"
          r={RADIUS}
          fill="none"
          stroke={bgRing}
          strokeWidth="4"
        />
        {/* Countdown ring */}
        <motion.circle
          cx="26"
          cy="26"
          r={RADIUS}
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </svg>

      {/* Numeric countdown */}
      <motion.span
        key={turnTimer}
        initial={{ scale: 1.15, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={`absolute text-sm font-semibold tabular-nums ${textColor} ${
          turnTimer <= 5 && isMyTurn ? 'animate-pulse' : ''
        }`}
      >
        {turnTimer}
      </motion.span>
    </div>
  );
}
