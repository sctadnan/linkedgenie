const KV_URL = process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;

export async function verifyGoogleToken(idToken) {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.aud !== process.env.GOOGLE_CLIENT_ID) return null;
  return { email: data.email, name: data.name, picture: data.picture };
}

export async function kvGet(key) {
  const res = await fetch(`${KV_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` }
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.result ? JSON.parse(data.result) : null;
}

export async function kvSet(key, value) {
  await fetch(KV_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(["SET", key, JSON.stringify(value)])
  });
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Circuit breaker for OpenAI (tracks failures in Redis)
export async function checkCircuitBreaker() {
  try {
    const data = await kvGet('circuit:openai');
    if (!data) return { open: false };
    // If 5+ failures in the last 2 minutes, circuit is open
    if (data.failures >= 5 && (Date.now() - data.lastFailure) < 120000) {
      return { open: true };
    }
    // Auto-reset after 2 minutes of cooldown
    if ((Date.now() - data.lastFailure) >= 120000) {
      return { open: false };
    }
    return { open: false };
  } catch {
    return { open: false };
  }
}

export async function recordCircuitFailure() {
  try {
    const data = await kvGet('circuit:openai') || { failures: 0, lastFailure: 0 };
    // Reset counter if last failure was > 2 min ago
    if ((Date.now() - data.lastFailure) >= 120000) {
      data.failures = 0;
    }
    data.failures++;
    data.lastFailure = Date.now();
    await kvSet('circuit:openai', data);
  } catch { /* fail silently */ }
}

export async function resetCircuitBreaker() {
  try {
    await kvSet('circuit:openai', { failures: 0, lastFailure: 0 });
  } catch { /* fail silently */ }
}

// Rate limiting: returns { allowed: bool, remaining: number }
export async function checkRateLimit(ip, maxPerMinute = 20) {
  const minute = Math.floor(Date.now() / 60000);
  const key = `rl:${ip}:${minute}`;
  try {
    const res = await fetch(`${KV_URL}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, 120]
      ])
    });
    if (!res.ok) return { allowed: true, remaining: maxPerMinute };
    const data = await res.json();
    const count = data[0]?.result || 0;
    return { allowed: count <= maxPerMinute, remaining: Math.max(0, maxPerMinute - count) };
  } catch {
    return { allowed: true, remaining: maxPerMinute };
  }
}
