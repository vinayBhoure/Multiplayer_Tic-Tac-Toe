import { Client, Session } from '@heroiclabs/nakama-js';


async function run() {
  try {
    // Node process.env since this is not a vite build
    const SERVER_KEY = process.env.VITE_NAKAMA_SERVER_KEY || "defaultkey";
    const client = new Client(SERVER_KEY, "127.0.0.1", "7350", false);
    const session = await client.authenticateDevice("test_device_" + Date.now(), true, "testname");
    const result = await client.rpc(session, "rpc_get_leaderboard", JSON.stringify({ limit: 10 }));
    console.log("RPC Result Object:", result);
    const data = JSON.parse(result.payload || '[]');
    console.log("Parsed Data:", data);
  } catch (e) {
    console.error(e);
  }
}
run();
