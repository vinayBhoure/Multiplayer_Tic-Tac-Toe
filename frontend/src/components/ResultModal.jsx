import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../gameStore';
import { nakamaClient } from '../nakamaClient';

export default function ResultModal() {
  const { winner, isDraw, selfMark, matchId, gameOverReason, resetGame } = useGameStore();
  const [isLeaving, setIsLeaving] = useState(false);

  const isVictory = winner === selfMark;
  const isDefeat = winner && winner !== selfMark;

  let headline = 'Game Over';
  if (isVictory) headline = 'Victory';
  else if (isDefeat) headline = 'Defeat';
  else if (isDraw) headline = 'Draw';

  const getSubMessage = () => {
    switch (gameOverReason) {
      case 'timeout':
        return isVictory ? 'Opponent ran out of time.' : 'You ran out of time.';
      case 'opponent_left':
        return 'Opponent has abandoned the match.';
      case 'match_terminated':
        return 'The match was terminated by the server.';
      case 'win':
        return isVictory ? 'Flawless execution.' : 'Better luck next time.';
      case 'draw':
        return 'A battle of equals.';
      default:
        return isVictory ? 'Flawless execution.' : isDefeat ? 'Better luck next time.' : 'Game over.';
    }
  };

  const handlePlayAgain = async () => {
    setIsLeaving(true);
    const socket = nakamaClient.getSocket();
    if (socket && matchId) {
      try {
        await socket.leaveMatch(matchId);
      } catch (err) {

      }
    }
    resetGame();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-surface border border-border shadow-2xl p-8 rounded-2xl w-full max-w-sm flex flex-col items-center"
      >
        <h2 className={`font-serif text-4xl font-semibold mb-2 text-center tracking-tight ${isVictory ? 'text-green-600' : isDefeat ? 'text-red-500' : 'text-gray-900'}`}>
          {headline}
        </h2>
        <p className="text-muted text-sm text-center mb-8">
          {getSubMessage()}
        </p>

        <button
          onClick={handlePlayAgain}
          disabled={isLeaving}
          className="w-full bg-gray-900 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-all duration-200"
        >
          {isLeaving ? 'Returning...' : 'Play Again'}
        </button>
      </motion.div>
    </div>
  );
}
