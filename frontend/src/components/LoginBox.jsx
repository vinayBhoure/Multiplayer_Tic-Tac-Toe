import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useGameStore } from '../gameStore';
import { nakamaClient } from '../nakamaClient';
import { LogIn } from 'lucide-react';

export default function LoginBox() {
  const [username, setInputUsername] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const { setUsername, setAppState } = useGameStore();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Please enter a valid username.', {
        position: 'top-center',
        theme: 'light',
      });
      return;
    }

    setIsConnecting(true);

    try {
      await nakamaClient.authenticate(username.trim());
      await nakamaClient.connectSocket();

      setUsername(username.trim());
      setAppState('MATCHMAKING');
      toast.success(`Welcome, ${username.trim()}!`, { position: 'top-center', theme: 'light' });
    } catch (error) {
      if (error.status === 409) {
        toast.error('This username is already linked to another device. Please try a different name.', {
          position: 'top-center',
          theme: 'light',
        });
      } else {
        toast.error('Failed to connect to the game server. Ensure Nakama is running.', {
          position: 'top-center',
          theme: 'light',
        });
      }
      setIsConnecting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-surface border border-border shadow-subtle p-8 rounded-2xl w-full max-w-sm flex flex-col items-center"
    >
      <div className="bg-gray-100 p-4 rounded-full mb-6">
        <LogIn className="w-8 h-8 text-gray-700" />
      </div>

      <h2 className="font-serif text-3xl font-semibold mb-2 text-center text-gray-900">
        Enter Game
      </h2>
      <p className="text-muted text-sm text-center mb-8">
        Join the server-authoritative arena.
      </p>

      <form onSubmit={handleJoin} className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-shadow duration-200"
            placeholder="Type your alias..."
            value={username}
            onChange={(e) => setInputUsername(e.target.value)}
            disabled={isConnecting}
            autoComplete="off"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={isConnecting}
          className="w-full mt-2 bg-gray-900 text-white font-medium py-3 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isConnecting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            'Connect'
          )}
        </button>
      </form>
    </motion.div>
  );
}
