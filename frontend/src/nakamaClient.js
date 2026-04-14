import { Client } from '@heroiclabs/nakama-js';
import { v4 as uuidv4 } from 'uuid';

const USE_SSL = false;
const HOST = '127.0.0.1';
const PORT = '7350';
const SERVER_KEY = 'defaultkey';

class NakamaService {
  constructor() {
    this.client = new Client(SERVER_KEY, HOST, PORT, USE_SSL);
    this.session = null;
    this.socket = null;
  }

  /**
   * Authenticate the user via Device Auth to ensure persistent sessions
   * across reloads without requiring a full login system.
   */
  async authenticate(username) {
    let deviceId = localStorage.getItem('nakama_device_id');
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem('nakama_device_id', deviceId);
    }

    try {
      this.session = await this.client.authenticateDevice(deviceId, true, username);
      console.log('Successfully authenticated with Nakama:', this.session.user_id);
      return this.session;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Initialize and connect the real-time socket.
   */
  async connectSocket() {
    if (!this.session) {
      throw new Error('Must authenticate before connecting socket.');
    }

    if (!this.socket) {
      this.socket = this.client.createSocket(USE_SSL, false);
      try {
        await this.socket.connect(this.session, true);
        console.log('Socket connected successfully');
      } catch (error) {
        console.error('Socket connection failed:', error);
        throw error;
      }
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
      this.socket.disconnect();
      this.socket = null;
    }
    this.session = null;
  }
}

export const nakamaClient = new NakamaService();
