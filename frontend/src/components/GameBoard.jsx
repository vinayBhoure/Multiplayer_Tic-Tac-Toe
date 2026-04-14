import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useGameStore } from '../gameStore';
import { nakamaClient } from '../nakamaClient';

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
    updateGameState,
    setMatchStarted
  } = useGameStore();

  useEffect(() => {
    const socket = nakamaClient.getSocket();
    if (!socket) return;

    socket.onmatchdata = (matchState) => {
      try {
        const payloadStr = new TextDecoder().decode(matchState.data);
        const payload = JSON.parse(payloadStr);

        console.log('Received match data:', matchState.op_code, payload);

        // Update the global state directly off the authoritative server packet
        if (payload.board !== undefined) {
          // If server provides the marks for players via some logic, handle selfMark.
          // By convention, assume backend payload contains selfMark mapping, OR we infer it if needed.
          // In a real implementation: `payload.players` might object map user_id -> "X"/"O".
          
          if (payload.myMark && !selfMark) {
             setMatchStarted(matchId, payload.myMark, opponent);
          }

          updateGameState(
            payload.board,
            payload.turn,
            payload.winner || null,
            payload.isDraw || false
          );
        }
      } catch (err) {
        console.error('Failed to parse match data:', err);
      }
    };

    return () => {
      socket.onmatchdata = null;
    };
  }, [matchId, selfMark, opponent, updateGameState, setMatchStarted]);

  const handleTileClick = (index) => {
    if (winner || isDraw) return;
    if (activeTurn !== selfMark) {
      toast.info("Not your turn!");
      return;
    }
    if (board[index]) {
      return;
    }

    const socket = nakamaClient.getSocket();
    if (socket && matchId) {
      // Encode move and send to backend
      const payload = JSON.stringify({ position: index });
      socket.sendMatchState(matchId, OP_CODE_MOVE, payload);
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
          <span className="text-xs uppercase tracking-wider text-muted font-semibold mb-1">Status</span>
          <div className="px-3 py-1 bg-surface border border-border shadow-subtle rounded-full text-sm font-medium">
             {winner ? (winner === selfMark ? 'Victory!' : 'Defeat') : isDraw ? 'Draw' : (activeTurn === selfMark ? 'Your Turn' : "Opponent's Turn")}
          </div>
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
            className={`w-full h-full flex items-center justify-center rounded-xl transition-colors duration-200 ${
              mark ? 'cursor-default bg-gray-50' : 'cursor-pointer hover:bg-gray-50 focus:bg-gray-100 outline-none'
            } border-2 ${
              activeTurn === selfMark && !mark && !winner && !isDraw ? 'border-transparent hover:border-gray-200' : 'border-transparent' // Subtly hint you can click
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
