import { create } from 'zustand';
import { nakamaClient } from './nakamaClient';

export const useGameStore = create((set, get) => ({
  appState: 'LOGIN', // 'LOGIN' | 'MATCHMAKING' | 'PLAYING' | 'GAME_OVER'
  username: '',
  matchId: null,
  board: Array(9).fill(null),
  activeTurn: 'X',
  selfMark: null,
  opponent: null,
  winner: null,
  isDraw: false,

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
      const { board, currentTurn, status, players, winner, symbol } = payload;

      const session = nakamaClient.getSession();
      const selfId = session ? session.user_id : null;

      // 1. Always resolve selfMark from server payload (authoritative).
      // The optimistic mark set during matchmaking may differ if the server's
      // join order differs from the matchmaker array order.
      let selfMark = state.selfMark;
      if (players && selfId && players[selfId]) {
        selfMark = players[selfId].symbol; // Always trust server
      }

      // 2. Determine winner symbol
      const winnerMark = symbol || (winner && players && players[winner] ? players[winner].symbol : null);

      return {
        board: board || state.board,
        activeTurn: currentTurn || state.activeTurn,
        selfMark,
        winner: winnerMark,
        isDraw: status === 'finished' && !winnerMark,
        appState: (status === 'finished' || winnerMark) ? 'GAME_OVER' : 'PLAYING'
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
    })),
}));
