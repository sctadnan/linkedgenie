import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ratelimit } from '@/lib/ratelimit';
import { enforceUsageLimit } from '@/lib/usage-gate';
import { siteConfig } from '@/config/site';
import { z } from 'zod';

// Define the structured output schema for the "Viral Engine"
const hookSchema = z.object({
    hooks: z.array(z.object({
        text: z.string().describe("The generated hook text. Needs to be extremely punchy, under 150-200 characters, starting with the ► symbol."),
        angle: z.string().describe("The psychological angle used (e.g., 'Transformation', 'Contrarian', 'Negative bias', 'Listicle', 'Ease of Use', 'Zeigarnik Effect - Curiosity Gap')."),
        viralityScore: z.number().min(0).max(100).describe("Predicted virality score from 0 to 100."),
        metrics: z.object({
            stoppingPower: z.number().min(0).max(100).describe("Stopping power score based on specific opening words."),
            readability: z.number().min(0).max(100).describe("Score based on whitespace and lack of complexity."),
            dwellTime: z.number().min(0).max(100).describe("Predicted ability to retain the reader's attention."),
            ctaEfficiency: z.number().min(0).max(100).describe("Ability to provoke deep comments and conversation.")
        }).describe("Sub-metrics for evaluating the hook's performance parameters, each out of 100.")
    })).length(5).describe("Exactly 5 scroll-stopping hooks covering different psychological angles.")
});

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

    // Enforce guest/free/pro usage limits
    const usageCheck = await enforceUsageLimit(req, 'hook');
    if (usageCheck.error) {
        const message =
            usageCheck.error === "GUEST_LIMIT_REACHED"
                ? "GUEST_LIMIT_REACHED"
                : usageCheck.error === "OUT_OF_CREDITS"
                    ? "You have run out of free generations. Please upgrade to Pro."
                    : usageCheck.error;
        return new Response(
            JSON.stringify({ error: message }),
            { status: usageCheck.status || 403, headers: { 'Content-Type': 'application/json' } }
        );
    }

    let prompt;
    try {
        const body = await req.json();
        prompt = body.prompt;
    } catch {
        return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!process.env.OPENAI_API_KEY) {
        return new Response(JSON.stringify({ error: "No OpenAI API key found. Please add OPENAI_API_KEY to your .env file." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const systemPrompt = `You are an elite LinkedIn Growth Engineer and AI Viral Score Predictor for "LinkedGenie" (SaaS). 
Your objective is to generate exactly 5 Scroll-Stopping Hooks based on the topic provided by the user, and evaluate them rigorously.

Rules:
1. Generate exactly 5 hooks. Use diverse psychological frameworks:
   - Transformation (Past failure vs Present success)
   - Contrarian (Violating industry consensus)
   - Zeigarnik Effect (Curiosity gap in the first 2 lines)
   - Negative Bias (Highlighting a painful mistake)
   - Simple Listicle / Value Bomb
2. Keep the length of the hook text under 150-200 characters so users can read it entirely before the "...see more" cut-off on LinkedIn mobile.
3. Every hook "text" MUST begin with the "► " symbol. Keep styling highly engaging and spacing clear.
4. RIGOROUS SCORING: Provide realistic metrics (0-100) for stoppingPower, readability, dwellTime, and ctaEfficiency. Average them to determine the 'viralityScore'. Make the scores believable (e.g., 85, 92, 78).
5. LANGUAGE COMPLIANCE: If the "Topic" is in Arabic, you MUST write the output perfectly in Arabic while maintaining the same psychological impact. If English, output English.`;

    try {
        const result = streamObject({
            model: openai(siteConfig.aiConfig.defaultModel),
            system: systemPrompt,
            prompt: `Topic: ${prompt}`,
            schema: hookSchema,
        });

        return result.toTextStreamResponse();
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to generate hooks';
        console.error('OpenAI API Error:', err);
        return new Response(JSON.stringify({ error: message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
