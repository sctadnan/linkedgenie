const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const FREE_LIMIT = 3;

async function verifyGoogleToken(idToken) {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.aud !== process.env.GOOGLE_CLIENT_ID) return null;
  return { email: data.email, name: data.name };
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

  // Verify Google token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Please sign in to generate posts' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  const googleUser = await verifyGoogleToken(idToken);
  if (!googleUser) {
    return res.status(401).json({ error: 'Invalid or expired token. Please sign in again.' });
  }

  // Check usage in KV
  const key = `user:${googleUser.email}`;
  let userData = await kvGet(key);

  if (!userData) {
    userData = {
      email: googleUser.email,
      name: googleUser.name,
      usage: { date: todayStr(), count: 0 },
      isPro: false
    };
  }

  // Reset daily count if new day
  if (userData.usage.date !== todayStr()) {
    userData.usage = { date: todayStr(), count: 0 };
  }

  // Check limit (Pro = unlimited)
  if (!userData.isPro && userData.usage.count >= FREE_LIMIT) {
    return res.status(429).json({ error: 'Daily limit reached', remaining: 0 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { idea, style, tone, lang } = req.body;

    if (!idea || !style || !tone || !lang) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (idea.length > 500) {
      return res.status(400).json({ error: 'Idea too long (max 500 chars)' });
    }

    const styleInstructions = {
      storytelling: "Write a LinkedIn post using a personal storytelling format. Start with a hook, share a personal experience or observation, include a turning point, and end with actionable takeaways and a call-to-action.",
      educational: "Write an educational LinkedIn post. Use a list or framework format. Include specific tips, numbered points or a cheat sheet format. Make it highly actionable and saveable.",
      motivational: "Write a motivational LinkedIn post. Use short, punchy lines. Build emotional momentum. Include powerful one-liners and end with an inspiring call-to-action.",
      contrarian: "Write a contrarian/hot take LinkedIn post. Challenge conventional wisdom. Present a bold, unpopular opinion with strong reasoning. Be provocative but thoughtful."
    };

    const toneInstructions = {
      professional: "Use a professional, polished tone suitable for senior professionals and executives.",
      casual: "Use a conversational, friendly tone as if talking to a colleague over coffee.",
      bold: "Use a confident, assertive tone. Make strong statements. Be direct and unapologetic.",
      humorous: "Use humor and wit where appropriate. Be clever but keep it professional enough for LinkedIn."
    };

    const langInstruction = lang === 'arabic'
      ? "Write the entire post in Arabic. Use modern, professional Arabic suitable for LinkedIn."
      : "Write the entire post in English.";

    const systemPrompt = `You are a world-class LinkedIn content strategist who has helped thousands of professionals build their personal brand. You write posts that feel authentic, human, and engaging — never robotic or AI-generated.

RULES:
- Use short paragraphs (1-2 lines max per paragraph)
- Use line breaks liberally for readability
- Include relevant emojis sparingly (3-6 total)
- Include a strong hook in the first line that stops the scroll
- End with engagement prompt (question, call-to-action, or repost request)
- Use → or • for list items instead of numbers when possible
- Keep it between 150-280 words (the sweet spot for LinkedIn engagement)
- Do NOT use hashtags
- Do NOT include any meta-commentary or notes — just output the post itself
- Make it feel authentic and human, not AI-generated
- Vary sentence length for rhythm
- Use power words and emotional triggers`;

    const userPrompt = `Generate a single LinkedIn post:

TOPIC: ${idea}
STYLE: ${styleInstructions[style] || styleInstructions.storytelling}
TONE: ${toneInstructions[tone] || toneInstructions.professional}
LANGUAGE: ${langInstruction}

Output ONLY the post text. Nothing else.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1024,
        temperature: 0.9,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI error:', errText);
      return res.status(502).json({ error: 'AI generation failed' });
    }

    const data = await response.json();
    const post = data.choices[0].message.content;

    // Bump usage after successful generation
    userData.usage.count++;
    await kvSet(key, userData);

    const remaining = userData.isPro ? 999 : Math.max(0, FREE_LIMIT - userData.usage.count);

    return res.status(200).json({ post, remaining });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
