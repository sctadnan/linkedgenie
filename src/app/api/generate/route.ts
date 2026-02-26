import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ratelimit } from '@/lib/ratelimit';
import { enforceUsageLimit } from '@/lib/usage-gate';
import { siteConfig } from '@/config/site';

// Require OPENAI_API_KEY environment variable
export async function POST(req: Request) {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";

    // Apply rate limiting if Upstash Redis variables are present
    if (process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_KV_REST_API_URL) {
        const { success } = await ratelimit.limit(ip);
        if (!success) {
            return new Response(
                JSON.stringify({ error: "Too many requests. Please try again in a minute." }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    // Enforce Pro/Credits limit
    const usageCheck = await enforceUsageLimit(req);
    if (usageCheck.error) {
        return new Response(
            JSON.stringify({ error: usageCheck.error === "OUT_OF_CREDITS" ? "You have run out of free generations. Please upgrade to Pro." : usageCheck.error }),
            { status: usageCheck.status || 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

<<<<<<< Updated upstream
    let prompt, tone, format, digitalFootprint;
=======
    const userMeta = usageCheck.user?.user_metadata || {};

    let prompt, tone, format, digitalFootprint, trendContext;
>>>>>>> Stashed changes
    try {
        const body = await req.json();
        prompt = body.prompt;
        tone = body.tone;
        format = body.format;
        digitalFootprint = body.digitalFootprint;
        trendContext = body.trendContext; // { hook, topic, sentiment, angles } from hook lab
    } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!process.env.OPENAI_API_KEY) {
        return new Response(JSON.stringify({ error: "No OpenAI API key found. Please add OPENAI_API_KEY to your .env file." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const basePrompt = `You are an Elite Brand Strategist and world-class LinkedIn ghostwriter.
Your objective is to craft a highly engaging, viral LinkedIn post based on the user's input.
Use "Chain-of-Thought" reasoning before writing: first analyze the topic, then draft the hook, body, and CTA. 
HOWEVER, ONLY output the final LinkedIn post. Do NOT output your thought process.

CRITICAL STRUCTURAL RULES (Do not violate these):
1. HOOK: The first 1-2 lines must be a scroll-stopping hook (under 12 words). It must arouse curiosity, emotion, or surprise.
2. PACING: Use extremely short paragraphs. No paragraph should exceed 3 lines. Use generous white space (empty lines) between thoughts.
3. LENGTH: The entire post MUST be strictly under 1300 characters to optimize for the LinkedIn algorithm.
4. HASHTAGS: NEVER use hashtags. They are strictly forbidden.
5. FORMATTING: Return plain raw text. No bolding (**), no italics, no emojis unless they add immense value.
6. CLOSING: End with a single, clear, conversation-starting question (Call-to-Action) to drive comments.
7. TONE: The general tone should be ${tone || 'professional but engaging'}. Structure the narrative using the ${format || 'PAS (Problem, Agitation, Solution)'} framework if possible.
8. LANGUAGE: You MUST detect the language of the user's Topic/Input and write the final output in that EXACT SAME language (e.g., if input is in Arabic, output must be in Arabic). Do not default to English unless the input is in English.`;

    const footprintInstruction = digitalFootprint
        ? `\n\nUSER'S DIGITAL FOOTPRINT (Mimic this exact style):\n${digitalFootprint}\nAnalyze this footprint deeply. Adopt the exact vocabulary, sentence rhythm, and "signature moves" described above. The post must sound like the user wrote it, NOT a generic AI.`
        : '';

    const trendContextInstruction = trendContext
        ? `\n\nHOOK LAB CONTEXT (Build the post around this hook and trend):\n- Selected Hook: "${trendContext.hook}"\n- Trend Topic: ${trendContext.topic}\n- Market Sentiment: ${trendContext.sentiment}\n- Unexplored Angles: ${(trendContext.angles || []).join(', ') || 'N/A'}\n\nCRITICAL: The very first line of your post MUST be the exact hook text provided above, word for word. Build the rest of the post to support and expand on the curiosity gap or claim made in that hook. Do NOT change the hook.`
        : '';

    const systemPrompt = basePrompt + footprintInstruction + trendContextInstruction;

    try {
        const result = streamText({
            model: openai(siteConfig.aiConfig.defaultModel),
            system: systemPrompt,
            prompt: `Topic: ${prompt}`,
        });

        return result.toTextStreamResponse();
    } catch (err: any) {
        console.error("OpenAI API Error:", err);
        return new Response(JSON.stringify({ error: err.message || "Failed to generate content" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
