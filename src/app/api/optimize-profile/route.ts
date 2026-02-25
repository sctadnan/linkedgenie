import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ratelimit } from '@/lib/ratelimit';
import { enforceUsageLimit } from '@/lib/usage-gate';

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

    // Enforce Pro/Credits limit
    const usageCheck = await enforceUsageLimit(req);
    if (usageCheck.error) {
        return new Response(
            JSON.stringify({ error: usageCheck.error === "OUT_OF_CREDITS" ? "You have run out of free generations. Please upgrade to Pro." : usageCheck.error }),
            { status: usageCheck.status || 401, headers: { 'Content-Type': 'application/json' } }
        );
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

    const systemPrompt = `You are a world-class LinkedIn Profile Optimizer and Brand Strategist.
The user will provide their current LinkedIn Headline and About/Summary section.

Your Goal:
1. Briefly critique what is wrong with the current headline (e.g. too generic, no value proposition).
2. Provide 3 highly optimized, engaging Headline alternatives (mix of SEO friendly and bold).
3. If they provided an About section, rewrite it to be structured, engaging, and action-oriented. Use short paragraphs and clear formatting.
4. Keep the response clean and easy to read. Do not use complex markdown that cannot be rendered as plain text. Use bullet points and line breaks.
`;

    try {
        const result = streamText({
            model: openai('gpt-4o'),
            system: systemPrompt,
            prompt: `Here is my profile data:\n${prompt}`,
        });

        return result.toTextStreamResponse();
    } catch (err: any) {
        console.error("OpenAI API Error:", err);
        return new Response(JSON.stringify({ error: err.message || "Failed to optimize profile" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
