import { kvGet, kvSet, todayStr } from './_shared.js';

const KV_URL = process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;

function verifyAdmin(req) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const auth = req.headers.authorization;
  return auth === `Bearer ${secret}`;
}

async function kvKeys(pattern) {
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(["KEYS", pattern])
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.result || [];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { action, email, duration, planType } = req.body || {};

    // === LIST: عرض كل المستخدمين ===
    if (action === 'list') {
      const keys = await kvKeys('user:*');
      const users = [];
      for (const key of keys) {
        const data = await kvGet(key);
        if (data) {
          users.push({
            email: data.email,
            name: data.name || '',
            isPro: data.isPro || false,
            subscription: data.subscription || null,
            lastUsage: data.usage?.date || null,
            usageCount: data.usage?.count || 0
          });
        }
      }
      // Pro أولاً ثم حسب الاسم
      users.sort((a, b) => (b.isPro - a.isPro) || (a.name || '').localeCompare(b.name || ''));
      return res.status(200).json({ users, total: users.length, pro: users.filter(u => u.isPro).length });
    }

    // === GET: بيانات مستخدم محدد ===
    if (action === 'get') {
      if (!email) return res.status(400).json({ error: 'Email required' });
      const data = await kvGet(`user:${email}`);
      if (!data) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json({ user: data });
    }

    // === GRANT: إعطاء اشتراك Pro ===
    if (action === 'grant') {
      if (!email) return res.status(400).json({ error: 'Email required' });
      if (!duration) return res.status(400).json({ error: 'Duration required (e.g. 7d, 30d, 90d, 365d)' });

      // حساب تاريخ الانتهاء
      const days = parseInt(duration);
      if (isNaN(days) || days < 1) return res.status(400).json({ error: 'Invalid duration' });
      const now = new Date();
      const expiryDate = new Date(now.getTime() + days * 86400000).toISOString();

      let userData = await kvGet(`user:${email}`);
      if (!userData) {
        userData = {
          email,
          name: '',
          usage: { date: todayStr(), count: 0 },
          isPro: false
        };
      }

      userData.isPro = true;
      userData.subscription = {
        startDate: now.toISOString(),
        renewalDate: null,
        expiryDate,
        planType: planType || 'gift',
        status: 'active'
      };

      await kvSet(`user:${email}`, userData);
      return res.status(200).json({ success: true, email, expiryDate, daysGranted: days });
    }

    // === REVOKE: إلغاء اشتراك ===
    if (action === 'revoke') {
      if (!email) return res.status(400).json({ error: 'Email required' });
      const userData = await kvGet(`user:${email}`);
      if (!userData) return res.status(404).json({ error: 'User not found' });

      userData.isPro = false;
      if (userData.subscription) {
        userData.subscription.status = 'revoked';
      }

      await kvSet(`user:${email}`, userData);
      return res.status(200).json({ success: true, email, status: 'revoked' });
    }

    return res.status(400).json({ error: 'Unknown action. Use: list, get, grant, revoke' });

  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
