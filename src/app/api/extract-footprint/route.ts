import { generateText } from 'ai';
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
    const usageCheck = await enforceUsageLimit(req, 'post');
    if (usageCheck.error) {
        return new Response(
            JSON.stringify({ error: usageCheck.error === "OUT_OF_CREDITS" ? "You have run out of free generations. Please upgrade to Pro." : usageCheck.error }),
            { status: usageCheck.status || 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    let posts, roleModel;
    try {
        const body = await req.json();
        posts = body.posts; // Array of strings or a single large string
        roleModel = body.roleModel; // Optional: A specific role model name they want to sound like
    } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!process.env.OPENAI_API_KEY) {
        return new Response(JSON.stringify({ error: "No OpenAI API key found. Please add OPENAI_API_KEY to your .env file." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    if (!posts || posts.length === 0) {
        return new Response(JSON.stringify({ error: "No posts provided for analysis." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const systemPrompt = `You are an Elite Brand Strategist and Linguistic Analyst.
Your job is to reverse-engineer a user's writing style based on the provided sample posts.
${roleModel ? `The user also mentioned they want to blend their style with the influence of: ${roleModel}.` : ''}

Analyze the provided text and extract a "Digital Footprint" in a concise, authoritative format.
Identify and list:
1. Tone & Voice (e.g., authoritative, vulnerable, punchy, academic).
2. Vocabulary & Lexicon (Any specific words, jargon, or phrasing they favor).
3. Pacing & Rhythm (e.g., staccato sentences, long flowing paragraphs).
4. Signature Moves (e.g., starting with a contrarian statement, ending with a specific sign-off).

Return ONLY the analysis as a clear, instructional text guide that another AI could use to perfectly mimic this writing style. Do not include markdown headers, just pure text instructions.`;

    try {
        const result = await generateText({
            model: openai(siteConfig.aiConfig.defaultModel),
            system: systemPrompt,
            prompt: `Here are the sample posts to analyze:\n\n${Array.isArray(posts) ? posts.join('\n\n---\n\n') : posts}`,
        });

        return new Response(JSON.stringify({ footprint: result.text }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
        console.error("OpenAI API Error (Footprint Extraction):", err);
        return new Response(JSON.stringify({ error: err.message || "Failed to extract digital footprint" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
