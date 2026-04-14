import { Client } from "@heroiclabs/nakama-js";
import { v4 as uuidv4 } from "uuid";

const client = new Client("defaultkey", "127.0.0.1", "7350", false);

export const nakamaService = {
  async authenticate(username) {
    const deviceId = localStorage.getItem("deviceId") || uuidv4();
    localStorage.setItem("deviceId", deviceId);
    
    const session = await client.authenticateDevice(deviceId, true, username);
    console.info("Authenticated naturally:", session);
    return session;
  },
  
  createSocket(session) {
    const socket = client.createSocket(false, false);
    return socket.connect(session, true);
  }
};

export default client;
