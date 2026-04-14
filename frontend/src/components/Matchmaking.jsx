import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Search, Trophy } from 'lucide-react';
import { useGameStore } from '../gameStore';
import { nakamaClient } from '../nakamaClient';

export default function Matchmaking() {
  const [isSearching, setIsSearching] = useState(false);
  const { username, setMatchStarted, resetGame, setAppState } = useGameStore();

  useEffect(() => {
    // Initial binding for immediate connectivity
    const socket = nakamaClient.getSocket();
    if (socket) {
      socket.onmatchmakermatched = () => {};
    }
  }, []);

  const handleFindMatch = async () => {
    setIsSearching(true);
    try {
      let socket = nakamaClient.getSocket();
      if (!socket || !socket.connected) {

        socket = await nakamaClient.connectSocket();
      }

      // ATTACH LISTENER TO THE CURRENT ACTIVE SOCKET
      // This is crucial for receiving the match notification after search
      socket.onmatchmakermatched = async (matched) => {

        try {
          const matchId = matched.match_id || matched.matchId;
          const token = matched.token;

          const selfId = nakamaClient.getSession().user_id;
          const opponentUser = matched.users.find(u => u.presence.user_id !== selfId);
          const opponentName = opponentUser ? opponentUser.presence.username : 'Opponent';

          // Derive selfMark from matchmaker order: first user in array = X, second = O
          // The server assigns X to the first player who joins and O to the second.
          // matched.users is ordered by join sequence, so we use that as our hint.
          // The authoritative symbol will be confirmed/overwritten by the MATCH_STATE broadcast.
          const selfIndex = matched.users.findIndex(u => u.presence.user_id === selfId);
          const optimisticSelfMark = selfIndex === 0 ? 'X' : 'O';

          let match;
          if (matchId) {
            match = await socket.joinMatch(matchId);
          } else if (token) {
            match = await socket.joinMatch(null, token);
          } else {
            throw new Error("No match_id or token received");
          }

          const finalMatchId = match.match_id || match.matchId;

          // Set match as started with the optimistic selfMark.
          // The first MATCH_STATE broadcast will overwrite selfMark via processMatchData
          // if it differs (it shouldn't, but this keeps us authoritative).
          setMatchStarted(finalMatchId, optimisticSelfMark, opponentName);
          toast.success(`Match found against ${opponentName}!`);
        } catch (error) {

          toast.error('Failed to join the match.');
          setIsSearching(false);
        }
      };


      await socket.addMatchmaker('*', 2, 2);
      toast.info("Searching for opponent...");
    } catch (error) {

      toast.error('Could not join matchmaking queue. Please try again.');
      setIsSearching(false);
    }
  };

  const handleCancel = () => {
    // Basic cancel: reload or navigate back to login. 
    // Nakama JS client removeMatchmaker typically requires the ticket, but we can just disconnect/logout to cancel forcefully for simplicity, or soft reset
    nakamaClient.logout();
    resetGame();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-surface border border-border shadow-subtle p-8 rounded-2xl w-full max-w-sm flex flex-col items-center"
    >
      <div className="bg-gray-100 p-4 rounded-full mb-6 relative">
        <Search className={`w-8 h-8 text-gray-700 ${isSearching ? 'animate-pulse' : ''}`} />
        {isSearching && (
          <motion.div
            className="absolute inset-0 border-2 border-gray-900 rounded-full"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
          />
        )}
      </div>

      <h2 className="font-serif text-3xl font-semibold mb-2 text-center text-gray-900">
        {isSearching ? 'Searching...' : 'Ready to Play?'}
      </h2>
      <p className="text-muted text-sm text-center mb-8">
        {isSearching
          ? 'Looking for a worthy opponent.'
          : `Logged in as ${username}`}
      </p>

      {isSearching ? (
        <button
          onClick={handleCancel}
          className="w-full mt-2 bg-white text-gray-900 border border-gray-200 font-medium py-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
        >
          Cancel
        </button>
      ) : (
        <>
          <button
            onClick={handleFindMatch}
            className="w-full mt-2 bg-gray-900 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-all duration-200"
          >
            Find Match
          </button>
          <button
            onClick={() => setAppState('LEADERBOARD')}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 font-medium py-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            <Trophy className="w-4 h-4" />
            Leaderboard
          </button>
        </>
      )}
    </motion.div>
  );
}
