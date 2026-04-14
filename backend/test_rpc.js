const http = require('http');

async function test() {
  try {
    const authRes = await fetch('http://127.0.0.1:7350/v2/account/authenticate/device?create=true&username=testuser1', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Basic ZGVmYXVsdGtleTo='
      },
      body: JSON.stringify({ id: "1234567890123" })
    });
    const authPayload = await authRes.json();
    const token = authPayload.token;

    const rpcRes = await fetch('http://127.0.0.1:7350/v2/rpc/rpc_get_leaderboard', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const rpcPayload = await rpcRes.json();
    console.log(JSON.stringify(rpcPayload, null, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
