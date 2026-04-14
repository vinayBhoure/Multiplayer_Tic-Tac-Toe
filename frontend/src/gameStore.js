import { create } from 'zustand';

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
