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

    // Enforce guest/free/pro usage limits
    const usageCheck = await enforceUsageLimit(req, 'post');
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

    const userMeta = usageCheck.user?.user_metadata || {};

    let prompt, tone, format, digitalFootprint;
    try {
        const body = await req.json();
        prompt = body.prompt; // AI SDK always sends the text here
        tone = body.tone;
        format = body.format;
        digitalFootprint = body.digitalFootprint; // New parameter for extracted style
    } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!process.env.OPENAI_API_KEY) {
        return new Response(JSON.stringify({ error: "No OpenAI API key found. Please add OPENAI_API_KEY to your .env file." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const finalTone = userMeta.tone_of_voice || tone || 'professional but engaging';
    const jobTitleContext = userMeta.job_title
        ? `\nAUTHOR PERSONA & CONTEXT:\nThe author's Job Title / Headline is: "${userMeta.job_title}".\nYou MUST adopt this persona, use terminology specific to this field, and position the author as an expert in this domain.`
        : '';

    const basePrompt = `You are an Elite Brand Strategist and world-class LinkedIn ghostwriter.
Your objective is to craft a highly engaging, viral LinkedIn post based on the user's input.
Use "Chain-of-Thought" reasoning before writing: first analyze the topic, then draft the hook, body, and CTA. 
HOWEVER, ONLY output the final LinkedIn post. Do NOT output your thought process.
${jobTitleContext}

CRITICAL 2026 LINKEDIN ALGORITHM RULES (MANDATORY FOR 100% SCORE):
1. HOOK (First 140 chars): The very first line MUST shatter the scroll-pattern by arousing deep curiosity and MUST contain a specific number/statistic. BE HIGHLY AUTHENTIC. You MUST conceptually avoid all engagement-bait cliches (e.g. "let that sink in", "unpopular opinion", "حقيقة يجهلها", "رأي غير شعبي"). The AI algorithm penalizes superficial hooks that lack actual value.
2. PACING & READABILITY: You MUST write in single sentences. NEVER write a paragraph with more than 2 sentences. YOU MUST put a blank empty line between EVERY SINGLE thought or sentence. No walls of text! If you use a bulleted list, it MUST contain exactly 3 to 6 points.  
3. AUTHENTICITY & SPAM: NEVER include external internet links (https://). Understand the true meaning of organic reach: NEVER artificially beg for engagement (no "comment below", "share this", "علق بتم"). Speak like a high-level executive sharing pure value.
4. ENGAGEMENT & STORYTELLING: If the post is long, you MUST weave in personal storytelling pronouns ("I", "my", "me", "أنا", "تجربتي"). 
5. CLOSING CTA: You MUST end the entire post with ONE profound, open-ended question to spark debate. The very last character of your output MUST be a question mark "?". NEVER use close-ended yes/no questions like "Do you agree?" or "Yes or no?".
6. DISCOVERABILITY (SEO): You MUST include exactly 3 to 5 highly relevant hashtags at the very bottom of the post. No more, no less.
7. TONE & FORMAT: Tone must be ${finalTone}. Format/Structure: ${format || 'PAS (Problem, Agitation, Solution)'}.
8. LANGUAGE STRICT MATCH: You MUST detect the exact language of the Topic/Input and write the output in that EXACT SAME language. If the input is Arabic, output Arabic. If English, output English.`;

    const footprintInstruction = digitalFootprint
        ? `\n\nUSER'S DIGITAL FOOTPRINT (Mimic this exact style):\n${digitalFootprint}\nAnalyze this footprint deeply. Adopt the exact vocabulary, sentence rhythm, and "signature moves" described above. The post must sound like the user wrote it, NOT a generic AI.`
        : '';

    const systemPrompt = basePrompt + footprintInstruction;

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
