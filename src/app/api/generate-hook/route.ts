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

    const systemPrompt = `You are a master copywriter specializing in LinkedIn hooks.
Your goal is to generate exactly 5 Scroll-Stopping Hooks based on the topic provided by the user.
Rules:
1. Provide exactly 5 hooks, numbered 1 to 5, each on a new line.
2. Prefix each hook with the symbol ► (e.g. ► Hook text goes here)
3. Keep them incredibly engaging, punchy, and under 2 sentences each.
4. Do not provide any conversational text before or after the hooks. Just the 5 hooks.`;

    try {
        const result = streamText({
            model: openai('gpt-4o'),
            system: systemPrompt,
            prompt: `Topic: ${prompt}`,
        });

        return result.toTextStreamResponse();
    } catch (err: any) {
        console.error("OpenAI API Error:", err);
        return new Response(JSON.stringify({ error: err.message || "Failed to generate hooks" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
