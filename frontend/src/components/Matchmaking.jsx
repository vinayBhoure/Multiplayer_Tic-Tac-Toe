import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Search } from 'lucide-react';
import { useGameStore } from '../gameStore';
import { nakamaClient } from '../nakamaClient';

export default function Matchmaking() {
  const [isSearching, setIsSearching] = useState(false);
  const { username, setMatchStarted, resetGame } = useGameStore();

  useEffect(() => {
    const socket = nakamaClient.getSocket();
    if (!socket) return;

    // Listen for matchmaker successful match
    socket.onmatchmakermatched = async (matched) => {
      console.log('Matchmaker matched:', matched);
      try {
        const match = await socket.joinMatch(matched.match_id);
        
        // Find our mark and opponent
        const selfId = nakamaClient.getSession().user_id;
        
        // Let's assume the players are sorted by their session IDs or simply order in list
        // In this implementation, the match state dictates the exact X and O.
        // But for display, we'll keep it simple for now, standard matched payload has users.
        const opponentUser = matched.users.find(u => u.presence.user_id !== selfId);
        
        const opponentName = opponentUser ? opponentUser.presence.username : 'Opponent';

        // Set the match started
        // Note: the backend handles X vs O on the first match data broadcast, 
        // we start blindly and await state packet.
        setMatchStarted(match.match_id, null, opponentName);
        toast.success(`Match found against ${opponentName}!`);
      } catch (error) {
        console.error('Error joining match:', error);
        toast.error('Failed to join the match.');
        setIsSearching(false);
      }
    };

    return () => {
      socket.onmatchmakermatched = null;
    };
  }, [setMatchStarted]);

  const handleFindMatch = async () => {
    setIsSearching(true);
    const socket = nakamaClient.getSocket();
    try {
      await socket.addMatchmaker(2, 2);
    } catch (error) {
      console.error('Matchmaker error:', error);
      toast.error('Could not join matchmaking queue.');
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
        <button
          onClick={handleFindMatch}
          className="w-full mt-2 bg-gray-900 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-all duration-200"
        >
          Find Match
        </button>
      )}
    </motion.div>
  );
}
