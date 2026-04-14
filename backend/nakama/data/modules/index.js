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

// --- checkWinner: Checks all 8 win patterns ---
function checkWinner(board) {
    for (var i = 0; i < WIN_PATTERNS.length; i++) {
        var a = WIN_PATTERNS[i][0];
        var b = WIN_PATTERNS[i][1];
        var c = WIN_PATTERNS[i][2];
        if (board[a] !== null && board[a] === board[b] && board[b] === board[c]) {
            return board[a]; // returns "X" or "O"
        }
    }
    return null;
}

// --- matchLoop: Core game engine — processes moves, validates, detects win/draw ---
function matchLoop(ctx, logger, nk, dispatcher, tick, state, messages) {
    // Only process messages when game is active
    if (state.status !== "playing") {
        return { state: state };
    }

    for (var i = 0; i < messages.length; i++) {
        var message = messages[i];

        // Only handle MAKE_MOVE opcode
        if (message.opCode !== OpCode.MAKE_MOVE) {
            continue;
        }

        // Parse the move payload
        var data;
        try {
            data = JSON.parse(nk.binaryToString(message.data));
        } catch (e) {
            logger.warn("Invalid JSON from " + message.sender.userId);
            continue;
        }

        var cellIndex = data.cellIndex;
        var senderId  = message.sender.userId;

        // ---- VALIDATION 1: Is this player in the match? ----
        if (!state.players[senderId]) {
            logger.warn("Unknown player tried to move: " + senderId);
            continue;
        }

        // ---- VALIDATION 2: Is it this player's turn? ----
        var senderSymbol = state.players[senderId].symbol;
        if (senderSymbol !== state.currentTurn) {
            logger.warn("Not your turn: " + senderId + " (" + senderSymbol + ")");
            var rejectPayload = JSON.stringify({ reason: "not_your_turn" });
            dispatcher.broadcastMessage(OpCode.MOVE_REJECT, rejectPayload, [message.sender]);
            continue;
        }

        // ---- VALIDATION 3: Is cellIndex valid (0-8)? ----
        if (typeof cellIndex !== "number" || cellIndex < 0 || cellIndex > 8) {
            logger.warn("Invalid cell index: " + cellIndex);
            var rejectPayload2 = JSON.stringify({ reason: "invalid_cell" });
            dispatcher.broadcastMessage(OpCode.MOVE_REJECT, rejectPayload2, [message.sender]);
            continue;
        }

        // ---- VALIDATION 4: Is the cell empty? ----
        if (state.board[cellIndex] !== null) {
            logger.warn("Cell already occupied: " + cellIndex);
            var rejectPayload3 = JSON.stringify({ reason: "cell_occupied" });
            dispatcher.broadcastMessage(OpCode.MOVE_REJECT, rejectPayload3, [message.sender]);
            continue;
        }

        // ---- MOVE IS VALID — Apply it ----
        state.board[cellIndex] = senderSymbol;
        state.turnsPlayed++;
        logger.info("Move: " + senderSymbol + " -> cell " + cellIndex);

        // ---- Check for winner ----
        var winnerSymbol = checkWinner(state.board);
        if (winnerSymbol) {
            state.status = "finished";
            state.winner = state.symbols[winnerSymbol]; // userId of winner

            var gameOverPayload = JSON.stringify({
                board:   state.board,
                winner:  state.winner,
                reason:  "win",
                symbol:  winnerSymbol,
                status:  state.status,
                players: buildPublicPlayers(state),
            });
            dispatcher.broadcastMessage(OpCode.GAME_OVER, gameOverPayload);
            logger.info("Game over — " + winnerSymbol + " wins!");
            return { state: state };
        }

        // ---- Check for draw ----
        if (state.turnsPlayed >= 9) {
            state.status = "finished";
            state.winner = null;

            var drawPayload = JSON.stringify({
                board:   state.board,
                winner:  null,
                reason:  "draw",
                status:  state.status,
                players: buildPublicPlayers(state),
            });
            dispatcher.broadcastMessage(OpCode.GAME_OVER, drawPayload);
            logger.info("Game over — draw!");
            return { state: state };
        }

        // ---- Switch turn ----
        state.currentTurn = (state.currentTurn === "X") ? "O" : "X";

        // ---- Broadcast updated state ----
        var statePayload = JSON.stringify({
            board:       state.board,
            currentTurn: state.currentTurn,
            status:      state.status,
            players:     buildPublicPlayers(state),
        });
        dispatcher.broadcastMessage(OpCode.MATCH_STATE, statePayload);
    }

    return { state: state };
}

// --- matchLeave: Handles player disconnect — awards forfeit win ---
function matchLeave(ctx, logger, nk, dispatcher, tick, state, presences) {
    for (var i = 0; i < presences.length; i++) {
        var presence = presences[i];
        var leaverId = presence.userId;
        logger.info("Player left: " + leaverId);

        // If game was in progress, opponent wins by forfeit
        if (state.status === "playing" && state.players[leaverId]) {
            state.status = "finished";

            // Find the remaining player
            var remainingUserId = null;
            var userIds = Object.keys(state.players);
            for (var j = 0; j < userIds.length; j++) {
                if (userIds[j] !== leaverId) {
                    remainingUserId = userIds[j];
                    break;
                }
            }

            state.winner = remainingUserId;

            var gameOverPayload = JSON.stringify({
                board:   state.board,
                winner:  remainingUserId,
                reason:  "opponent_left",
                status:  state.status,
                players: buildPublicPlayers(state),
            });
            dispatcher.broadcastMessage(OpCode.GAME_OVER, gameOverPayload);
            logger.info("Game over — " + leaverId + " left, " + remainingUserId + " wins by forfeit");
        }

        // Clean up player from state
        delete state.players[leaverId];
    }

    // If no players left, signal match to end
    if (Object.keys(state.players).length === 0) {
        return null; // Returning null ends the match
    }

    return { state: state };
}

// --- matchTerminate: Notifies players on server-initiated match end ---
function matchTerminate(ctx, logger, nk, dispatcher, tick, state, graceSeconds) {
    logger.info("Match terminating with " + graceSeconds + "s grace period");

    // Notify any remaining players that the match is ending
    if (state.status === "playing") {
        var payload = JSON.stringify({
            board:   state.board,
            winner:  null,
            reason:  "match_terminated",
            status:  "finished",
            players: buildPublicPlayers(state),
        });
        dispatcher.broadcastMessage(OpCode.GAME_OVER, payload);
    }

    return { state: state };
}

// --- matchSignal: Stub ---
function matchSignal(ctx, logger, nk, dispatcher, tick, state, data) {
    return { state: state, data: data };
}

// =============================================================================
// RPC Endpoints
// =============================================================================

// --- rpcCreateMatch: Find an open match or create a new one ---
function rpcCreateMatch(ctx, logger, nk, payload) {
    // Look for an existing open match (label "tictactoe", 0-2 players)
    var matches = nk.matchList(10, true, "tictactoe", 0, 2, "");

    if (matches && matches.length > 0) {
        // Found an open match — return its ID for the client to join
        var matchId = matches[0].matchId;
        logger.info("Found open match: " + matchId);
        return JSON.stringify({ matchId: matchId });
    }

    // No open match found — create a new one
    var newMatchId = nk.matchCreate("tic-tac-toe", {});
    logger.info("Created new match: " + newMatchId);
    return JSON.stringify({ matchId: newMatchId });
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

    // Register the matchmaking RPC
    initializer.registerRpc("rpc_create_match", rpcCreateMatch);
    logger.info("RPC 'rpc_create_match' registered");
}
