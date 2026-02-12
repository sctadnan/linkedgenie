import { verifyGoogleToken, kvGet, kvSet, todayStr } from './_shared.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!process.env.UPSTASH_REDIS_REST_KV_REST_API_URL || !process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'Google Client ID not configured' });
    }

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

    if (!userData || !userData.usage) {
      userData = {
        email: googleUser.email,
        name: googleUser.name,
        usage: { date: todayStr(), count: 0 },
        isPro: userData?.isPro || false
      };
      await kvSet(key, userData);
    }

    // Track last seen + reset daily count
    const today = todayStr();
    let needSave = false;
    if (userData.lastSeen !== today) {
      userData.lastSeen = today;
      needSave = true;
    }
    if (userData.usage.date !== today) {
      userData.usage = { date: today, count: 0 };
      needSave = true;
    }
    if (needSave) await kvSet(key, userData);

    // Auto-expire subscriptions
    if (userData.isPro && userData.subscription?.expiryDate) {
      if (new Date(userData.subscription.expiryDate) < new Date()) {
        userData.isPro = false;
        userData.subscription.status = 'expired';
        await kvSet(key, userData);
      }
    }

    // Dev account always PRO
    if (process.env.DEV_EMAIL && googleUser.email === process.env.DEV_EMAIL) {
      userData.isPro = true;
    }

    const FREE_LIMIT = 3;
    const remaining = userData.isPro ? 999 : Math.max(0, FREE_LIMIT - userData.usage.count);

    let subscription = null;
    if (userData.isPro && userData.subscription) {
      const expiry = userData.subscription.renewalDate || userData.subscription.expiryDate;
      const daysRemaining = expiry ? Math.max(0, Math.ceil((new Date(expiry) - new Date()) / 86400000)) : null;
      subscription = { ...userData.subscription, daysRemaining };
    }

    return res.status(200).json({
      email: googleUser.email,
      name: googleUser.name,
      isPro: userData.isPro,
      remaining,
      limit: userData.isPro ? 'unlimited' : FREE_LIMIT,
      subscription
    });

  } catch (error) {
    console.error('User API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
