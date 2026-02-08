const KV_URL = process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
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
  await fetch(KV_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(["SET", key, JSON.stringify(value)])
  });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ============ PROMPT BUILDERS ============

const toneMap = {
  professional: "Use a professional, polished tone suitable for senior professionals and executives.",
  casual: "Use a conversational, friendly tone as if talking to a colleague over coffee.",
  bold: "Use a confident, assertive tone. Make strong statements. Be direct and unapologetic.",
  humorous: "Use humor and wit where appropriate. Be clever but keep it professional enough for LinkedIn."
};

function langInstruction(lang) {
  const langMap = {
    english: "Write the entire output in English.",
    spanish: "Write the entire output in Spanish. Use professional, modern Spanish.",
    portuguese: "Write the entire output in Portuguese. Use modern, professional Portuguese.",
    french: "Write the entire output in French. Use modern, professional French.",
    german: "Write the entire output in German. Use modern, professional German.",
    arabic: "Write the entire output in Arabic. Use modern, professional Arabic suitable for LinkedIn."
  };
  return langMap[lang] || langMap.english;
}

const POST_SYSTEM = `You are a world-class LinkedIn content strategist who has helped thousands of professionals build their personal brand. You write posts that feel authentic, human, and engaging — never robotic or AI-generated.

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

const styleMap = {
  storytelling: "Write using a personal storytelling format. Start with a hook, share a personal experience or observation, include a turning point, and end with actionable takeaways and a call-to-action.",
  educational: "Write an educational post. Use a list or framework format. Include specific tips, numbered points or a cheat sheet format. Make it highly actionable and saveable.",
  motivational: "Write a motivational post. Use short, punchy lines. Build emotional momentum. Include powerful one-liners and end with an inspiring call-to-action.",
  contrarian: "Write a contrarian/hot take post. Challenge conventional wisdom. Present a bold, unpopular opinion with strong reasoning. Be provocative but thoughtful.",
  career_update: "Write a career update post (new job, promotion, work anniversary). Be genuine and grateful, mention lessons learned, and thank key people. Keep it celebratory but humble.",
  achievement: "Write an achievement/milestone post. Share the accomplishment, the journey behind it, lessons learned, and inspire others. Be proud but not arrogant.",
  job_posting: "Write an engaging job posting post. Make the role sound exciting, highlight culture and benefits, use a conversational tone instead of corporate speak. End with a clear call-to-action to apply or share.",
  open_to_work: "Write an 'open to work' post. Be confident, highlight key skills and value proposition, mention what you're looking for, and make it easy for people to help. Avoid sounding desperate — position it as an exciting next chapter."
};

function buildPostWrite(body) {
  const { idea, style, tone, lang } = body;
  if (!idea) return null;
  const userPrompt = `Generate a single LinkedIn post:\n\nTOPIC: ${idea}\nSTYLE: ${styleMap[style] || styleMap.storytelling}\nTONE: ${toneMap[tone] || toneMap.professional}\nLANGUAGE: ${langInstruction(lang)}\n\nOutput ONLY the post text. Nothing else.`;
  return { system: POST_SYSTEM, user: userPrompt, outputTitle: 'Your LinkedIn Post' };
}

function buildPostRewrite(body) {
  const { idea, style, tone, lang } = body;
  if (!idea) return null;
  const system = `You are a world-class LinkedIn content editor. You take draft posts and transform them into high-performing LinkedIn content. You improve the hook, tighten the writing, add engagement elements, and make it feel authentic and compelling.

RULES:
- Dramatically improve the opening hook (first 2 lines are critical)
- Shorten sentences for punch and rhythm
- Add line breaks for readability
- Add emojis sparingly (3-6 total)
- Add a strong call-to-action at the end
- Keep the original message and voice intact
- Do NOT use hashtags
- Do NOT add meta-commentary — just output the improved post
- Keep it between 150-280 words`;

  const userPrompt = `Rewrite and improve this LinkedIn post draft:\n\n---\n${idea}\n---\n\nSTYLE: ${styleMap[style] || styleMap.storytelling}\nTONE: ${toneMap[tone] || toneMap.professional}\nLANGUAGE: ${langInstruction(lang)}\n\nOutput ONLY the improved post. Nothing else.`;
  return { system, user: userPrompt, outputTitle: 'Improved Post' };
}

function buildPostHooks(body) {
  const { idea, lang } = body;
  if (!idea) return null;
  const system = `You are a LinkedIn hook specialist. You write scroll-stopping opening lines that make people click "see more". Your hooks are specific, curiosity-driven, and emotionally compelling.`;
  const userPrompt = `Generate exactly 5 different LinkedIn post hooks (opening 1-2 lines) for this topic:\n\nTOPIC: ${idea}\nLANGUAGE: ${langInstruction(lang)}\n\nOutput the 5 hooks separated by "---" on its own line. Each hook should be 1-2 lines max. Do NOT number them. Do NOT add any commentary.`;
  return { system, user: userPrompt, multi: true, separator: '---', title: 'Hook Options' };
}

function buildProfileHeadline(body) {
  const { inputs, tone, lang } = body;
  if (!inputs?.role) return null;
  const { role, skill, value, audience } = inputs;
  const system = `You are a LinkedIn headline expert. You write compelling, keyword-rich headlines that make profiles stand out in search results and attract the right audience. Each headline must be under 220 characters.`;
  const userPrompt = `Generate exactly 3 different LinkedIn headlines:\n\nCURRENT ROLE: ${role}\nKEY SKILL: ${skill || 'not specified'}\nVALUE PROPOSITION: ${value || 'not specified'}\nTARGET AUDIENCE: ${audience || 'not specified'}\nTONE: ${toneMap[tone] || toneMap.professional}\nLANGUAGE: ${langInstruction(lang)}\n\nOutput 3 headlines separated by "---" on its own line. Each must be under 220 characters. Do NOT number them. Do NOT add commentary.`;
  return { system, user: userPrompt, multi: true, separator: '---', title: 'Headline Options' };
}

function buildProfileAbout(body) {
  const { inputs, tone, lang } = body;
  if (!inputs?.background) return null;
  const { background, achievements, expertise, goal } = inputs;
  const system = `You are a LinkedIn About section specialist. You write compelling, authentic About sections that tell a professional story, highlight key achievements, and drive action. The output must be under 2600 characters.`;
  const userPrompt = `Write a complete LinkedIn About section:\n\nBACKGROUND: ${background}\nKEY ACHIEVEMENTS: ${achievements || 'not specified'}\nEXPERTISE AREAS: ${expertise || 'not specified'}\nGOAL (what I'm looking for): ${goal || 'not specified'}\nTONE: ${toneMap[tone] || toneMap.professional}\nLANGUAGE: ${langInstruction(lang)}\n\nOutput ONLY the About section text. Keep it under 2600 characters. Do NOT add any commentary.`;
  return { system, user: userPrompt, outputTitle: 'Your About Section' };
}

function buildProfileExperience(body) {
  const { inputs, tone, lang } = body;
  if (!inputs?.title) return null;
  const { title, company, details } = inputs;
  const system = `You are a LinkedIn experience description specialist. You write professional, achievement-focused role descriptions with bullet points, action verbs, and quantified results where possible.`;
  const userPrompt = `Write a LinkedIn experience description:\n\nJOB TITLE: ${title}\nCOMPANY: ${company || 'not specified'}\nRESPONSIBILITIES & ACHIEVEMENTS: ${details || 'not specified'}\nTONE: ${toneMap[tone] || toneMap.professional}\nLANGUAGE: ${langInstruction(lang)}\n\nOutput ONLY the description with bullet points. Use • for bullets. Include action verbs and quantified results. Do NOT add commentary.`;
  return { system, user: userPrompt, outputTitle: 'Experience Description' };
}

function buildMessageConnection(body) {
  const { inputs, lang } = body;
  if (!inputs?.name) return null;
  const { name, common, goal } = inputs;
  const goalMap = {
    networking: "general networking and building professional relationships",
    collaboration: "exploring potential collaboration opportunities",
    learning: "learning from their experience and expertise",
    hiring: "discussing a job opportunity"
  };
  const system = `You are a LinkedIn networking expert. You write concise, personalized connection request messages that feel genuine, not spammy. Messages must be under 300 characters (LinkedIn limit for connection notes).`;
  const userPrompt = `Write a LinkedIn connection request message:\n\nRECIPIENT: ${name}\nCOMMON GROUND: ${common || 'not specified'}\nGOAL: ${goalMap[goal] || goal || 'networking'}\nLANGUAGE: ${langInstruction(lang)}\n\nOutput ONLY the message. Must be under 300 characters. Be personal and genuine. Do NOT add commentary.`;
  return { system, user: userPrompt, outputTitle: 'Connection Request' };
}

function buildMessageFollowup(body) {
  const { inputs, lang } = body;
  if (!inputs?.name) return null;
  const { name, context, ask } = inputs;
  const system = `You are a LinkedIn messaging expert. You write thoughtful follow-up messages that reference shared context, add value, and clearly state the ask without being pushy.`;
  const userPrompt = `Write a LinkedIn follow-up message:\n\nRECIPIENT: ${name}\nHOW WE MET/CONNECTED: ${context || 'not specified'}\nWHAT I'D LIKE: ${ask || 'not specified'}\nLANGUAGE: ${langInstruction(lang)}\n\nOutput ONLY the message. Keep it concise (3-5 sentences). Be warm and professional. Do NOT add commentary.`;
  return { system, user: userPrompt, outputTitle: 'Follow-up Message' };
}

function buildMessageThankyou(body) {
  const { inputs, lang } = body;
  if (!inputs?.name) return null;
  const { name, context, takeaway } = inputs;
  const system = `You are a LinkedIn messaging expert. You write sincere, specific thank you messages that strengthen professional relationships by referencing specific moments or insights from the interaction.`;
  const userPrompt = `Write a LinkedIn thank you message:\n\nRECIPIENT: ${name}\nCONTEXT: ${context || 'not specified'}\nKEY TAKEAWAY: ${takeaway || 'not specified'}\nLANGUAGE: ${langInstruction(lang)}\n\nOutput ONLY the message. Keep it concise and sincere. Reference something specific. Do NOT add commentary.`;
  return { system, user: userPrompt, outputTitle: 'Thank You Message' };
}

function buildReply(body) {
  const { idea, mode, lang } = body;
  if (!idea) return null;
  const styleMap = {
    supportive: "Write a supportive, encouraging reply that validates the original poster's point and adds a personal perspective.",
    value: "Write a reply that adds genuine value — share a relevant insight, resource, tip, or data point that extends the conversation.",
    question: "Write a reply that asks a thoughtful follow-up question that shows genuine curiosity and deepens the discussion.",
    disagree: "Write a reply that respectfully disagrees. Present an alternative viewpoint with reasoning. Be constructive, not confrontational."
  };
  const system = `You are a LinkedIn engagement specialist. You write thoughtful, authentic comment replies that build relationships and add value to conversations. Your replies stand out from generic comments.`;
  const userPrompt = `Generate exactly 3 different reply options for this LinkedIn comment/post:\n\nORIGINAL: ${idea}\nSTYLE: ${styleMap[mode] || styleMap.supportive}\nLANGUAGE: ${langInstruction(lang)}\n\nOutput 3 reply options separated by "---" on its own line. Each reply should be 2-4 sentences. Do NOT number them. Do NOT add commentary.`;
  return { system, user: userPrompt, multi: true, separator: '---', title: 'Reply Options' };
}

// ============ ROUTE REQUEST TO BUILDER ============

function buildPrompt(body) {
  const { type, mode } = body;

  if (type === 'post') {
    if (mode === 'write') return buildPostWrite(body);
    if (mode === 'rewrite') return buildPostRewrite(body);
    if (mode === 'hooks') return buildPostHooks(body);
  }
  if (type === 'profile') {
    if (mode === 'headline') return buildProfileHeadline(body);
    if (mode === 'about') return buildProfileAbout(body);
    if (mode === 'experience') return buildProfileExperience(body);
  }
  if (type === 'message') {
    if (mode === 'connection') return buildMessageConnection(body);
    if (mode === 'followup') return buildMessageFollowup(body);
    if (mode === 'thankyou') return buildMessageThankyou(body);
  }
  if (type === 'reply') return buildReply(body);

  return null;
}

// ============ HANDLER ============

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!KV_URL || !KV_TOKEN) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'Google Client ID not configured' });
    }

    // Check auth: signed-in user OR demo mode
    const authHeader = req.headers.authorization;
    let googleUser = null;
    let isDemoMode = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      googleUser = await verifyGoogleToken(idToken);
      if (!googleUser) {
        return res.status(401).json({ error: 'Invalid or expired token. Please sign in again.' });
      }
    } else {
      // Demo mode — 1 free try per day without sign-in
      const demoId = req.headers['x-demo-id'];
      if (!demoId || demoId.length < 8) {
        return res.status(401).json({ error: 'Please sign in to generate content' });
      }
      isDemoMode = true;
      const demoKey = `demo:${demoId}`;
      const demoData = await kvGet(demoKey);
      if (demoData && demoData.date === todayStr() && demoData.count >= 1) {
        return res.status(401).json({ error: 'demo_limit', message: 'Sign in with Google to get 3 free generations per day!' });
      }
    }

    let userData, key;

    if (isDemoMode) {
      const demoId = req.headers['x-demo-id'];
      key = `demo:${demoId}`;
      userData = { usage: { date: todayStr(), count: 0 }, isPro: false };
    } else {
      // Signed-in user flow
      key = `user:${googleUser.email}`;
      userData = await kvGet(key);

      if (!userData || !userData.usage) {
        userData = {
          email: googleUser.email,
          name: googleUser.name,
          usage: { date: todayStr(), count: 0 },
          isPro: userData?.isPro || false
        };
      }

      // Dev account always PRO
      if (process.env.DEV_EMAIL && googleUser.email === process.env.DEV_EMAIL) {
        userData.isPro = true;
      }

      if (userData.usage.date !== todayStr()) {
        userData.usage = { date: todayStr(), count: 0 };
      }

      if (!userData.isPro && userData.usage.count >= FREE_LIMIT) {
        return res.status(429).json({ error: 'Daily limit reached', remaining: 0 });
      }
    }

    // Input validation
    const { type, mode, idea, inputs } = req.body;
    const MAX_INPUT = 3000;
    if (idea && typeof idea === 'string' && idea.length > MAX_INPUT) {
      return res.status(400).json({ error: `Input too long (max ${MAX_INPUT} characters)` });
    }
    if (inputs) {
      for (const val of Object.values(inputs)) {
        if (typeof val === 'string' && val.length > MAX_INPUT) {
          return res.status(400).json({ error: `Input too long (max ${MAX_INPUT} characters)` });
        }
      }
    }
    const allowedTypes = ['post', 'profile', 'message', 'reply'];
    if (type && !allowedTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Build prompt based on content type
    const prompt = buildPrompt(req.body);
    if (!prompt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Call OpenAI with retry
    const maxRetries = 2;
    let content;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
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
            { role: 'system', content: prompt.system },
            { role: 'user', content: prompt.user }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        content = data.choices[0].message.content;
        break;
      }

      if (attempt === maxRetries) {
        const errText = await response.text();
        console.error('OpenAI error after retries:', errText);
        return res.status(502).json({ error: 'AI generation failed. Please try again.' });
      }

      // Wait before retry (1s, 2s)
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }

    // Bump usage
    if (isDemoMode) {
      await kvSet(key, { date: todayStr(), count: 1 });
    } else {
      userData.usage.count++;
      await kvSet(key, userData);
    }

    const remaining = isDemoMode ? 0 : (userData.isPro ? 999 : Math.max(0, FREE_LIMIT - userData.usage.count));
    const demo = isDemoMode ? true : undefined;

    // Multi-output (hooks, headlines, replies)
    if (prompt.multi) {
      const items = content.split(prompt.separator).map(s => s.trim()).filter(s => s.length > 0);
      return res.status(200).json({ items, title: prompt.title, remaining, demo });
    }

    // Single output
    return res.status(200).json({ post: content, outputTitle: prompt.outputTitle, remaining, demo });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
