import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ratelimit } from '@/lib/ratelimit';
import { enforceUsageLimit } from '@/lib/usage-gate';
import { siteConfig } from '@/config/site';

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

    let topic;
    try {
        const body = await req.json();
        topic = body.topic || body.prompt; // Support both standard and AI SDK payload
    } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!topic) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!process.env.OPENAI_API_KEY) {
        return new Response(JSON.stringify({ error: "No OpenAI API key found. Please add OPENAI_API_KEY to your .env file." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const systemPrompt = `You are a top-tier LinkedIn Growth Strategist and Trend Analyst.
The user will provide a topic, niche, or a live breaking news headline.

Your objective is to:
1. Explain WHY people are talking about this topic right now.
2. Provide 3 specific, viral "Angles" a user could take to post about this.
3. Suggest 3 highly relevant hashtags.
4. **VELOCITY RULE RECOMMENDATION:** Analyze the "age" or intensity of this trend.
   - If it feels like "Breaking News" or a fresh, sudden trend: Suggest high-velocity formats like a "Text-only post" or a "Poll" to capture immediate attention.
   - If it's a mature, ongoing trend (e.g., AI in Healthcare): Suggest deep-dive formats like a "Document/Carousel" or a "Long-form Listicle".
5. LANGUAGE: You MUST detect the language of the user's Topic/Input and write the output in that EXACT SAME language (e.g., if input is in Arabic, output must be in Arabic). Do not default to English unless the input is in English.

Format the output cleanly with brief headings. No markdown bolding (**). Keep it punchy and actionable.`;

    try {
        const result = streamText({
            model: openai(siteConfig.aiConfig.defaultModel),
            system: systemPrompt,
            prompt: `Analyze this trend/topic: ${topic}`,
        });

        return result.toTextStreamResponse();
    } catch (err: any) {
        console.error("OpenAI API Error:", err);
        return new Response(JSON.stringify({ error: err.message || "Failed to analyze trends" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
