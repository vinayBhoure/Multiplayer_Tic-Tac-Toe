import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useGameStore } from '../gameStore';
import { nakamaClient } from '../nakamaClient';
import TurnTimerRing from './TurnTimerRing';

// OpCodes to match backend expectations (assume 1 = Move, 2 = State Update)
const OP_CODE_MOVE = 1;
const OP_CODE_STATE_UPDATE = 2; // For receiving updates from server

export default function GameBoard() {
  const {
    board,
    activeTurn,
    selfMark,
    opponent,
    isDraw,
    winner,
    matchId,
    turnTimer,
    updateGameState,
    setMatchStarted
  } = useGameStore();

  // No local state listener needed - updates are handled globally in App.jsx via gameStore

  const handleTileClick = async (index) => {


    if (winner || isDraw) {

      return;
    }
    if (activeTurn !== selfMark) {

      toast.info("Not your turn!");
      return;
    }
    if (board[index]) {

      return;
    }

    const socket = nakamaClient.getSocket();


    if (!socket) {

      toast.error('Connection lost. Please refresh.');
      return;
    }
    if (!matchId) {

      return;
    }

    try {
      const payload = JSON.stringify({ cellIndex: index });

      await socket.sendMatchState(matchId, OP_CODE_MOVE, payload);

    } catch (err) {

      toast.error('Failed to send move. Please try again.');
    }
  };

  const getTileVariants = () => ({
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center w-full max-w-md mx-auto"
    >
      <div className="flex justify-between w-full mb-8 items-end px-4">
        <div className="flex flex-col items-start">
          <span className="text-xs uppercase tracking-wider text-muted font-semibold mb-1">You</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-medium">{selfMark ? `Mark ${selfMark}` : 'Waiting...'}</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          {!winner && !isDraw ? (
            <>
              <TurnTimerRing turnTimer={turnTimer} isMyTurn={activeTurn === selfMark} />
              <span className="text-xs text-muted font-medium mt-1">
                {activeTurn === selfMark ? 'Your Turn' : "Opponent's Turn"}
              </span>
            </>
          ) : (
            <>
              <span className="text-xs uppercase tracking-wider text-muted font-semibold mb-1">Status</span>
              <div className="px-3 py-1 bg-surface border border-border shadow-subtle rounded-full text-sm font-medium">
                {winner ? (winner === selfMark ? 'Victory!' : 'Defeat') : 'Draw'}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col items-end">
          <span className="text-xs uppercase tracking-wider text-muted font-semibold mb-1">Opponent</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-medium truncate max-w-[100px]">{opponent || 'Rival'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full aspect-square bg-surface border border-border p-3 rounded-2xl shadow-subtle">
        {board.map((mark, index) => (
          <button
            key={index}
            onClick={() => handleTileClick(index)}
            className={`w-full h-full flex items-center justify-center rounded-xl transition-colors duration-200 ${mark ? 'cursor-default bg-gray-50' : 'cursor-pointer hover:bg-gray-50 focus:bg-gray-100 outline-none'
              } border-2 ${activeTurn === selfMark && !mark && !winner && !isDraw ? 'border-transparent hover:border-gray-200' : 'border-transparent' // Subtly hint you can click
              }`}
          >
            {mark && (
              <motion.span
                variants={getTileVariants()}
                initial="initial"
                animate="animate"
                className={`font-serif text-6xl ${mark === 'X' ? 'text-gray-900 leading-none pb-2' : 'text-gray-400 font-light leading-none'}`}
              >
                {mark}
              </motion.span>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
