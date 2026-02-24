import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ratelimit } from '@/lib/ratelimit';

export async function POST(req: Request) {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";

    // Apply rate limiting if Upstash Redis variables are present
    if (process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_KV_REST_API_URL) {
        const { success } = await ratelimit.limit(ip);
        if (!success) {
            return new Response(
                JSON.stringify({ error: "Rate limit exceeded. Please try again tomorrow or upgrade." }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    let prompt;
    try {
        const body = await req.json();
        prompt = body.prompt;
    } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!process.env.OPENAI_API_KEY) {
        return new Response(JSON.stringify({ error: "No OpenAI API key found. Please add OPENAI_API_KEY to your .env file." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const systemPrompt = `You are a social media trend analyst specializing in LinkedIn algorithms.
The user will provide their industry/niche.
Your goal: Analyze current potential viral concepts for that niche.
Provide exactly 3 distinct trend concepts they can post about right now.
For each trend:
- Give a catchy title.
- Briefly explain why it works (e.g., "People love contrarian takes on X right now").
- Provide 1 actionable post idea.

Keep it highly structured, engaging, and use bullet points and bold text where appropriate (using standard markdown). Do not write long essays. Be concise and hard-hitting.`;

    try {
        const result = streamText({
            model: openai('gpt-4o'),
            system: systemPrompt,
            prompt: `My Niche: ${prompt}`,
        });

        return result.toTextStreamResponse();
    } catch (err: any) {
        console.error("OpenAI API Error:", err);
        return new Response(JSON.stringify({ error: err.message || "Failed to analyze trends" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
