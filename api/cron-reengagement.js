import { kvGet, kvSet, todayStr } from './_shared.js';

const KV_URL = process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const INACTIVE_DAYS = 2; // days of inactivity before sending email
const TRIAL_DAYS = 7;    // trial duration to grant

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

async function sendEmail(to, name) {
  const firstName = (name || '').split(' ')[0] || 'there';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'LinkedGenie <noreply@linkedgenie.co>',
      to: [to],
      subject: `🎁 ${firstName}, your free Pro trial is waiting!`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#0a0a0f;color:#e8e8f0;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="font-size:32px;">✨</span>
            <h1 style="font-size:22px;margin:8px 0 0;color:#e8e8f0;">LinkedGenie</h1>
          </div>
          <p style="font-size:15px;line-height:1.6;color:#c4c4d0;">
            Hey ${firstName}! 👋
          </p>
          <p style="font-size:15px;line-height:1.6;color:#c4c4d0;">
            We noticed you haven't been back in a while. We miss you! To welcome you back, we've activated a <strong style="color:#f59e0b;">free 7-day Pro trial</strong> on your account.
          </p>
          <div style="background:linear-gradient(135deg,rgba(249,115,22,0.15),rgba(234,179,8,0.15));border:1px solid rgba(249,115,22,0.3);border-radius:12px;padding:16px;margin:20px 0;text-align:center;">
            <div style="font-size:13px;color:#f59e0b;font-weight:600;margin-bottom:4px;">🎉 YOUR PRO TRIAL IS ACTIVE</div>
            <div style="font-size:12px;color:#c4c4d0;">7 days of unlimited AI-powered LinkedIn content</div>
          </div>
          <p style="font-size:15px;line-height:1.6;color:#c4c4d0;">
            With Pro, you get:
          </p>
          <ul style="font-size:14px;line-height:1.8;color:#c4c4d0;padding-left:20px;">
            <li><strong>Unlimited</strong> post generation</li>
            <li>All <strong>premium writing styles</strong></li>
            <li>Profile optimization + messages + replies</li>
          </ul>
          <div style="text-align:center;margin:28px 0;">
            <a href="https://linkedgenie.co" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;">
              Start Creating →
            </a>
          </div>
          <p style="font-size:12px;color:#66667a;text-align:center;margin-top:24px;">
            This trial expires in 7 days. No credit card required.<br>
            <a href="https://linkedgenie.co" style="color:#6366f1;">linkedgenie.co</a>
          </p>
        </div>
      `
    })
  });
  return res.ok;
}

export default async function handler(req, res) {
  // Verify cron secret (Vercel sends this header for cron jobs)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (!RESEND_API_KEY) {
      return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
    }

    const keys = await kvKeys('user:*');
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - INACTIVE_DAYS * 86400000);
    const cutoffStr = cutoffDate.toISOString().slice(0, 10);
    let sent = 0;
    let skipped = 0;

    for (const key of keys) {
      const userData = await kvGet(key);
      if (!userData || !userData.email) continue;

      // Skip if: already Pro, no lastSeen, active recently, already got re-engagement
      if (userData.isPro) { skipped++; continue; }
      if (!userData.lastSeen) { skipped++; continue; }
      if (userData.lastSeen >= cutoffStr) { skipped++; continue; }
      if (userData.reengagementSent) { skipped++; continue; }

      // Skip if never actually used the tool (count = 0 ever)
      if (!userData.usage || userData.usage.count === 0) { skipped++; continue; }

      // Grant trial + send email
      userData.isPro = true;
      userData.subscription = {
        startDate: now.toISOString(),
        renewalDate: null,
        expiryDate: new Date(now.getTime() + TRIAL_DAYS * 86400000).toISOString(),
        planType: 'trial',
        status: 'active'
      };
      userData.reengagementSent = todayStr();

      const emailSent = await sendEmail(userData.email, userData.name);
      if (emailSent) {
        await kvSet(key, userData);
        sent++;
      }
    }

    return res.status(200).json({ success: true, sent, skipped, total: keys.length });

  } catch (error) {
    console.error('Cron re-engagement error:', error);
    return res.status(500).json({ error: error.message || 'Cron failed' });
  }
}
