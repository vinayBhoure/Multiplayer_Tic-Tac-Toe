# Project Progress

## Phase 1: Environment Setup
- [x] Docker environment configured (Nakama + Postgres)
- [x] `local.yml` runtime configuration prepared
- [x] Initial `index.js` entry point created

## Phase 2: Backend Development
- [x] Server-authoritative match handler implemented
- [x] Real-time move validation logic (turn, cell status, boundaries)
- [x] Win and Draw detection (8 patterns)
- [x] Matchmaking RPC (`rpc_create_match`) implemented and tested
- [x] Graceful disconnect handling with forfeit logic
- [x] Verified clean module loading and RPC execution in Nakama 3.21.1

## Phase 3: Frontend Development
- [x] Initialized minimalist aesthetic, fonts, and Tailwind config
- [x] Implemented core Nakama client and socket bindings (`nakamaClient.js`)
- [x] Built Zustand global game state orchestration (`gameStore.js`)
- [x] Developed animated Login UI with username authentication
- [x] Integrated Matchmaking dashboard with queue logic
- [x] Implemented real-time Game Board with server-authoritative sync
- [x] Processed game outcomes with Result Modals and disconnect recovery

## Phase 4: Integration and Stability Fixes
- [x] Fixed multi-tab testing by keying `deviceId` to username in `localStorage`
- [x] Resolved stale socket issues with a robust refresh-on-auth logic in `nakamaClient.js`
- [x] Implemented authoritative `selfMark` synchronization in `gameStore.js` to ensure clients respect server-assigned symbols
- [x] Fixed critical backend crash in `matchmakerMatched` by removing unserializable params from `nk.matchCreate`
- [x] Added comprehensive debug logging to `GameBoard.jsx` for move tracing and error handling
- [x] Verified full real-time gameplay loop across multiple tabs
- [x] Conducted E2E validations for win, draw, and network disconnect states
- [x] Verified Nakama rejection resilience against malicious inputs (out-of-turn, duplicate cell moves)
- [x] Cleaned up vestigial console debug traces across Frontend React components
- [x] Finalized user-friendly error pathway toast notifications

## Bonus Features: Leaderboard & Turn Timers
- [x] Created authoritative lifetime leaderboard `tictactoe_leaderboard` on backend
- [x] Implemented scoring model (+10 Win, -5 Loss, +1 Draw) with persistence
- [x] Added `rpc_get_leaderboard` for ranked global standings
- [x] Developed separate Leaderboard Screen with top 10 display and rank medals
- [x] Implemented 30-second server-authoritative turn timer with auto-forfeit logic
- [x] Built SVG timer ring UI with adaptive color thresholds (Amber at 15s, Red at 10s)
- [x] Updated game status and result modals to reflect timeout and forfeit reasons

## Connectivity & Infrastructure Stabilisation (Post-Phase 4)
- [x] Fixed 409 Conflict authentication errors by switching to deterministic username-based Device IDs
- [x] Resolved 400 Bad Request by ensuring Device IDs meet the Nakama minimum length requirement (>10 chars)
- [x] Fixed Leaderboard write crash by removing negative increments (-5) that violated database check constraints
- [x] Isolated backend scoring tasks into individual try/catch blocks for transactional integrity
- [x] Fixed Frontend Leaderboard display failure by removing redundant JSON.parse() on already-parsed SDK payloads

