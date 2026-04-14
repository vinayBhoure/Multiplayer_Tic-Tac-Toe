import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Medal } from 'lucide-react';
import { useGameStore } from '../gameStore';

export default function LeaderboardScreen() {
  const {
    leaderboard,
    isLoadingLeaderboard,
    fetchLeaderboard,
    username,
    setAppState,
  } = useGameStore();

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleBack = () => {
    setAppState('MATCHMAKING');
  };

  const getRankDecoration = (rank) => {
    if (rank === 1) return { icon: '🥇', color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200' };
    if (rank === 2) return { icon: '🥈', color: 'text-gray-400', bg: 'bg-gray-50 border-gray-200' };
    if (rank === 3) return { icon: '🥉', color: 'text-orange-400', bg: 'bg-orange-50 border-orange-200' };
    return { icon: null, color: 'text-gray-500', bg: 'bg-white border-gray-100' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-surface border border-border shadow-subtle p-8 rounded-2xl w-full max-w-md flex flex-col items-center"
    >
      {/* Header */}
      <div className="w-full flex items-center mb-6">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          aria-label="Back to matchmaking"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 text-center">
          <h2 className="font-serif text-2xl font-semibold text-gray-900 tracking-tight">
            Leaderboard
          </h2>
        </div>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      <div className="w-full flex items-center justify-center mb-6">
        <div className="bg-gray-100 p-3 rounded-full">
          <Trophy className="w-6 h-6 text-gray-700" />
        </div>
      </div>

      <p className="text-muted text-xs uppercase tracking-widest font-semibold mb-4">
        Top Players
      </p>

      {/* Loading state */}
      {isLoadingLeaderboard && (
        <div className="w-full space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-gray-50 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoadingLeaderboard && leaderboard.length === 0 && (
        <div className="w-full py-12 flex flex-col items-center text-center">
          <Medal className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No games played yet.</p>
          <p className="text-muted text-xs mt-1">Play a match to appear here!</p>
        </div>
      )}

      {/* Leaderboard rows */}
      {!isLoadingLeaderboard && leaderboard.length > 0 && (
        <div className="w-full space-y-2">
          {leaderboard.map((entry, index) => {
            const { icon, bg } = getRankDecoration(Number(entry.rank));
            const isSelf = entry.username === username;

            return (
              <motion.div
                key={entry.userId || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${bg} ${
                  isSelf
                    ? 'ring-2 ring-gray-900 ring-offset-1 border-gray-900'
                    : ''
                }`}
              >
                {/* Rank */}
                <div className="w-8 text-center flex-shrink-0">
                  {icon ? (
                    <span className="text-lg">{icon}</span>
                  ) : (
                    <span className="text-sm font-medium text-gray-400">
                      #{entry.rank}
                    </span>
                  )}
                </div>

                {/* Username */}
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-sm font-medium truncate block ${
                      isSelf ? 'text-gray-900 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {entry.username}
                    {isSelf && (
                      <span className="ml-1.5 text-xs font-normal text-muted">
                        (you)
                      </span>
                    )}
                  </span>
                </div>

                {/* Score */}
                <div className="flex-shrink-0">
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      entry.score > 0
                        ? 'text-gray-900'
                        : entry.score < 0
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {entry.score > 0 ? '+' : ''}
                    {entry.score}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Back button */}
      <button
        onClick={handleBack}
        className="w-full mt-6 bg-gray-900 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-all duration-200"
      >
        Back to Lobby
      </button>
    </motion.div>
  );
}
