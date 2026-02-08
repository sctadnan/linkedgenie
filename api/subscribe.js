import { kvGet, kvSet } from './_shared.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email required' });
    }

    const cleaned = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // Store subscriber
    const key = `sub:${cleaned}`;
    const existing = await kvGet(key);
    if (existing) {
      return res.status(200).json({ success: true, message: 'Already subscribed' });
    }

    await kvSet(key, { email: cleaned, date: new Date().toISOString() });

    // Update subscriber count
    const countData = await kvGet('subscribers:count') || { count: 0 };
    countData.count++;
    await kvSet('subscribers:count', countData);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    return res.status(500).json({ error: 'Subscription failed' });
  }
}
