const KV_URL = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function verifyGoogleToken(idToken) {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.aud !== process.env.GOOGLE_CLIENT_ID) return null;
  return { email: data.email, name: data.name, picture: data.picture };
}

async function kvGet(key) {
  const res = await fetch(`${KV_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` }
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.result ? JSON.parse(data.result) : null;
}

async function kvSet(key, value) {
  await fetch(`${KV_URL}/set/${key}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ value: JSON.stringify(value) })
  });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  const googleUser = await verifyGoogleToken(idToken);
  if (!googleUser) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const key = `user:${googleUser.email}`;
  let userData = await kvGet(key);

  if (!userData) {
    userData = {
      email: googleUser.email,
      name: googleUser.name,
      usage: { date: todayStr(), count: 0 },
      isPro: false
    };
    await kvSet(key, userData);
  }

  // Reset daily count if new day
  if (userData.usage.date !== todayStr()) {
    userData.usage = { date: todayStr(), count: 0 };
    await kvSet(key, userData);
  }

  const FREE_LIMIT = 3;
  const remaining = userData.isPro ? 999 : Math.max(0, FREE_LIMIT - userData.usage.count);

  return res.status(200).json({
    email: googleUser.email,
    name: googleUser.name,
    isPro: userData.isPro,
    remaining,
    limit: userData.isPro ? 'unlimited' : FREE_LIMIT
  });
}
