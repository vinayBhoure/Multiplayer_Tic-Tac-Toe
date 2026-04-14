// =============================================================================
// Multiplayer Tic-Tac-Toe — Nakama Authoritative Match Handler
// Single-file module (Nakama JS runtime does not support require())
// =============================================================================

// --- OpCodes (must match frontend) ---
var OpCode = {
    MAKE_MOVE:   1,
    MATCH_STATE: 2,
    MOVE_REJECT: 3,
    GAME_OVER:   4,
};

// --- 8 standard Tic-Tac-Toe win lines ---
var WIN_PATTERNS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  // cols
    [0, 4, 8], [2, 4, 6],             // diags
];

// --- Initial state factory ---
function createInitialState() {
    return {
        board:       [null, null, null, null, null, null, null, null, null],
        players:     {},   // userId -> { symbol: "X"|"O", presence: <presence> }
        symbols:     {},   // "X"|"O" -> userId  (reverse lookup)
        currentTurn: "X",
        status:      "waiting",  // waiting -> playing -> finished
        winner:      null,
        turnsPlayed: 0,
    };
}

// --- Helper: strip presences from player data before sending to clients ---
function buildPublicPlayers(state) {
    var result = {};
    var userIds = Object.keys(state.players);
    for (var i = 0; i < userIds.length; i++) {
        var uid = userIds[i];
        result[uid] = { symbol: state.players[uid].symbol };
    }
    return result;
}

// =============================================================================
// Match Handler Lifecycle Functions
// =============================================================================

// --- matchInit: Bootstraps empty game state on match creation ---
function matchInit(ctx, logger, nk, params) {
    logger.info("Match created");
    var state = createInitialState();
    var tickRate = 1;
    var label = "tictactoe";
    return { state: state, tickRate: tickRate, label: label };
}

// --- matchJoinAttempt: Gate to accept/reject join requests ---
function matchJoinAttempt(ctx, logger, nk, dispatcher, tick, state, presence, metadata) {
    var playerCount = Object.keys(state.players).length;
    return { state: state, accept: playerCount < 2 };
}

// --- matchJoin: Assigns symbols X/O and starts game when 2 players join ---
function matchJoin(ctx, logger, nk, dispatcher, tick, state, presences) {
    for (var i = 0; i < presences.length; i++) {
        var presence = presences[i];
        var playerCount = Object.keys(state.players).length;

        if (playerCount >= 2) {
            logger.warn("Match full — rejecting " + presence.userId);
            continue;
        }

        var symbol = playerCount === 0 ? "X" : "O";
        state.players[presence.userId] = { symbol: symbol, presence: presence };
        state.symbols[symbol] = presence.userId;
        logger.info("Player joined: " + presence.userId + " as " + symbol);
    }

    // If 2 players are in, start the game
    if (Object.keys(state.players).length === 2) {
        state.status = "playing";

        // Update label so matchmaker knows this room is full
        dispatcher.matchLabelUpdate("tictactoe-full");

        // Broadcast initial state to both players
        var statePayload = JSON.stringify({
            board:       state.board,
            currentTurn: state.currentTurn,
            status:      state.status,
            players:     buildPublicPlayers(state),
        });
        dispatcher.broadcastMessage(OpCode.MATCH_STATE, statePayload);
        logger.info("Match started — broadcasting initial state");
    }

    return { state: state };
}

// --- matchLoop: Stub (will be replaced with full game engine) ---
function matchLoop(ctx, logger, nk, dispatcher, tick, state, messages) {
    return { state: state };
}

// --- matchLeave: Stub (will be replaced with disconnect handling) ---
function matchLeave(ctx, logger, nk, dispatcher, tick, state, presences) {
    return { state: state };
}

// --- matchTerminate: Stub ---
function matchTerminate(ctx, logger, nk, dispatcher, tick, state, graceSeconds) {
    return { state: state };
}

// --- matchSignal: Stub ---
function matchSignal(ctx, logger, nk, dispatcher, tick, state, data) {
    return { state: state, data: data };
}

// =============================================================================
// Module Entry Point
// =============================================================================

function InitModule(ctx, logger, nk, initializer) {
    logger.info("JS module loaded successfully");

    // Register the authoritative match handler
    initializer.registerMatch("tic-tac-toe", {
        matchInit:        matchInit,
        matchJoinAttempt: matchJoinAttempt,
        matchJoin:        matchJoin,
        matchLoop:        matchLoop,
        matchLeave:       matchLeave,
        matchTerminate:   matchTerminate,
        matchSignal:      matchSignal,
    });

    logger.info("Match handler 'tic-tac-toe' registered");
}
