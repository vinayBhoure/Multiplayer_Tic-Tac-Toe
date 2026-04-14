import { create } from 'zustand';
import { nakamaClient } from './nakamaClient';

export const useGameStore = create((set, get) => ({
  appState: 'LOGIN', // 'LOGIN' | 'MATCHMAKING' | 'LEADERBOARD' | 'PLAYING' | 'GAME_OVER'
  username: '',
  matchId: null,
  board: Array(9).fill(null),
  activeTurn: 'X',
  selfMark: null,
  opponent: null,
  winner: null,
  isDraw: false,
  gameOverReason: null,

  // Leaderboard state
  leaderboard: [],
  isLoadingLeaderboard: false,

  setUsername: (username) => set({ username }),
  setAppState: (appState) => set({ appState }),

  // Set when matchmaking successfully connects and returns a match ID
  setMatchStarted: (matchId, selfMark, opponent) =>
    set({
      appState: 'PLAYING',
      matchId,
      selfMark,
      opponent,
      board: Array(9).fill(null),
      activeTurn: 'X',
      winner: null,
      isDraw: false,
      gameOverReason: null,
      turnTimer: 30,
    }),

  // Fully server-authoritative state replacement.
  updateGameState: (board, activeTurn, winner, isDraw) =>
    set((state) => {
      const nextState = { board, activeTurn, winner, isDraw };
      if (winner || isDraw) {
        nextState.appState = 'GAME_OVER';
      }
      return nextState;
    }),

  // Centralized processing of any match data from server
  processMatchData: (payload) =>
    set((state) => {
      const { board, currentTurn, status, players, winner, symbol, reason, turnTimer } = payload;

      const session = nakamaClient.getSession();
      const selfId = session ? session.user_id : null;

      // 1. Always resolve selfMark from server payload (authoritative).
      let selfMark = state.selfMark;
      if (players && selfId && players[selfId]) {
        selfMark = players[selfId].symbol;
      }

      // 2. Determine winner symbol
      const winnerMark = symbol || (winner && players && players[winner] ? players[winner].symbol : null);

      return {
        board: board || state.board,
        activeTurn: currentTurn || state.activeTurn,
        selfMark,
        winner: winnerMark,
        isDraw: status === 'finished' && !winnerMark,
        appState: (status === 'finished' || winnerMark) ? 'GAME_OVER' : 'PLAYING',
        gameOverReason: reason || state.gameOverReason,
        turnTimer: turnTimer !== undefined ? turnTimer : state.turnTimer,
      };
    }),

  resetGame: () =>
    set((state) => ({
      appState: state.username ? 'MATCHMAKING' : 'LOGIN',
      matchId: null,
      board: Array(9).fill(null),
      activeTurn: 'X',
      selfMark: null,
      opponent: null,
      winner: null,
      isDraw: false,
      gameOverReason: null,
      turnTimer: 30,
    })),

  // Fetch leaderboard data via RPC
  fetchLeaderboard: async () => {
    set({ isLoadingLeaderboard: true });
    try {
      const session = nakamaClient.getSession();
      const result = await nakamaClient.client.rpc(session, 'rpc_get_leaderboard', JSON.stringify({ limit: 10 }));
      const data = JSON.parse(result.payload || '[]');
      set({ leaderboard: data, isLoadingLeaderboard: false });
    } catch (err) {
      console.error('[Leaderboard] Failed to fetch:', err);
      set({ isLoadingLeaderboard: false });
    }
  },
}));
