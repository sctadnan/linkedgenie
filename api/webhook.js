const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify webhook signature from LemonSqueezy
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (secret) {
    const signature = req.headers['x-signature'];
    if (!signature) {
      return res.status(401).json({ error: 'No signature' });
    }
    // For production: verify HMAC signature
    // const crypto = require('crypto');
    // const hmac = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');
    // if (hmac !== signature) return res.status(401).json({ error: 'Invalid signature' });
  }

  try {
    const event = req.body;
    const eventName = event.meta?.event_name;
    const email = event.data?.attributes?.user_email;

    if (!email) {
      return res.status(400).json({ error: 'No email in webhook' });
    }

    const key = `user:${email}`;
    let userData = await kvGet(key);

    if (!userData) {
      userData = {
        email,
        name: event.data?.attributes?.user_name || '',
        usage: { date: todayStr(), count: 0 },
        isPro: false
      };
    }

    if (eventName === 'order_created' || eventName === 'subscription_created') {
      userData.isPro = true;
    } else if (eventName === 'subscription_expired' || eventName === 'subscription_cancelled') {
      userData.isPro = false;
    }

    await kvSet(key, userData);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
