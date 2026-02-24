import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ratelimit } from '@/lib/ratelimit';

// Require OPENAI_API_KEY environment variable
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

    let prompt, tone, format;
    try {
        const body = await req.json();
        prompt = body.prompt; // AI SDK always sends the text here
        tone = body.tone;
        format = body.format;
    } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!process.env.OPENAI_API_KEY) {
        return new Response(JSON.stringify({ error: "No OpenAI API key found. Please add OPENAI_API_KEY to your .env file." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const systemPrompt = `You are a world-class LinkedIn ghostwriter who helps professionals grow their personal brand. 
Your goal is to write a highly engaging, viral LinkedIn post based on the user's input.
Rules:
1. Start with a scroll-stopping hook (short, punchy).
2. Use short paragraphs and lots of white space.
3. Keep the tone ${tone || 'professional but engaging'}.
4. Structure the post using the ${format || 'PAS (Problem, Agitation, Solution)'} framework if possible.
5. End with a clear call-to-action or a question for the comments.
6. Under NO circumstances should you use hashtags.
7. Return raw text only, no markdown formatting like bolding or asterisks unless necessary.`;

    try {
        const result = streamText({
            model: openai('gpt-4o'),
            system: systemPrompt,
            prompt: `Topic: ${prompt}`,
        });

        return result.toTextStreamResponse();
    } catch (err: any) {
        console.error("OpenAI API Error:", err);
        return new Response(JSON.stringify({ error: err.message || "Failed to generate content" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
