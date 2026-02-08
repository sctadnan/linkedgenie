import crypto from 'crypto';
import { kvGet, kvSet, todayStr } from './_shared.js';

function verifySignature(rawBody, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export const config = {
  api: { bodyParser: false }
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await getRawBody(req);
    const bodyStr = rawBody.toString('utf8');

    // Verify webhook signature
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (secret) {
      const signature = req.headers['x-signature'];
      if (!signature) {
        return res.status(401).json({ error: 'No signature' });
      }
      try {
        if (!verifySignature(bodyStr, signature, secret)) {
          return res.status(401).json({ error: 'Invalid signature' });
        }
      } catch {
        return res.status(401).json({ error: 'Signature verification failed' });
      }
    }

    const event = JSON.parse(bodyStr);
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
