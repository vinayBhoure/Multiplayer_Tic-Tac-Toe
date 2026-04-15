import { Client } from '@heroiclabs/nakama-js';
import { v4 as uuidv4 } from 'uuid';

const USE_SSL = false;
const HOST = '127.0.0.1';
const PORT = '7350';
const SERVER_KEY = import.meta.env.VITE_NAKAMA_SERVER_KEY || 'defaultkey';

class NakamaService {
  constructor() {
    this.client = new Client(SERVER_KEY, HOST, PORT, USE_SSL);
    this.session = null;
    this.socket = null;
    this.onMatchData = null; // Global listener for match state updates
  }

  /**
   * Authenticate the user via Device Auth.
   *
   * - The device ID is keyed by username so that two different players in the
   *   same browser (testing with 2 tabs) get distinct Nakama accounts.
   * - Always tears down any stale socket first, so a server restart doesn't
   *   leave a dead socket that blocks the next connect attempt.
   */
  async authenticate(username) {
    // Tear down any stale socket from a previous session / server restart
    if (this.socket) {
      try { this.socket.disconnect(); } catch (_) { /* ignore */ }
      this.socket = null;
    }
    this.session = null;

    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem("deviceId", deviceId);
    }

    try {
      this.session = await this.client.authenticateDevice(deviceId, true, username);

      return this.session;
    } catch (error) {
      console.error('[Nakama] Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Initialize and connect the real-time WebSocket.
   * Always creates a fresh socket — never reuses a potentially stale one.
   */
  async connectSocket() {
    if (!this.session) {
      throw new Error('Must authenticate before connecting socket.');
    }

    // Always create a fresh socket to avoid stale-connection issues
    if (this.socket) {
      try { this.socket.disconnect(); } catch (_) { /* ignore */ }
      this.socket = null;
    }

    this.socket = this.client.createSocket(USE_SSL, false);
    try {
      await this.socket.connect(this.session, true);

      // Attach the global match data listener pipeline
      this.socket.onmatchdata = (data) => {
        if (this.onMatchData) this.onMatchData(data);
      };


    } catch (error) {
      console.error('[Nakama] Socket connection failed:', error);
      this.socket = null;
      throw error;
    }

    return this.socket;
  }

  getSocket() {
    return this.socket;
  }

  getSession() {
    return this.session;
  }

  async logout() {
    if (this.socket) {
      try { this.socket.disconnect(); } catch (_) { /* ignore */ }
      this.socket = null;
    }
    this.session = null;
  }
}

export const nakamaClient = new NakamaService();
