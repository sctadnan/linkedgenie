import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ratelimit } from '@/lib/ratelimit';
import { enforceUsageLimit } from '@/lib/usage-gate';
import { siteConfig } from '@/config/site';
<<<<<<< Updated upstream
=======
import { z } from 'zod';

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
>>>>>>> Stashed changes

export async function POST(req: Request) {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";

    if (process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_KV_REST_API_URL) {
        const { success } = await ratelimit.limit(ip);
        if (!success) {
            return new Response(
                JSON.stringify({ error: "Too many requests. Please try again in a minute." }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

<<<<<<< Updated upstream
    // Enforce Pro/Credits limit
    const usageCheck = await enforceUsageLimit(req);
=======
    const usageCheck = await enforceUsageLimit(req, 'hook');
>>>>>>> Stashed changes
    if (usageCheck.error) {
        return new Response(
            JSON.stringify({ error: usageCheck.error === "OUT_OF_CREDITS" ? "You have run out of free generations. Please upgrade to Pro." : usageCheck.error }),
            { status: usageCheck.status || 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    let prompt, trendContext;
    try {
        const body = await req.json();
        prompt = body.prompt;
<<<<<<< Updated upstream
    } catch (e) {
=======
        trendContext = body.trendContext; // { topic, sentiment, momentum, unexploredAngles }
    } catch {
>>>>>>> Stashed changes
        return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!process.env.OPENAI_API_KEY) {
        return new Response(JSON.stringify({ error: "No OpenAI API key found." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

<<<<<<< Updated upstream
    const systemPrompt = `You are a master copywriter specializing in LinkedIn hooks.
Your goal is to generate exactly 5 Scroll-Stopping Hooks based on the topic provided by the user.
Rules:
1. Provide exactly 5 hooks, numbered 1 to 5, each on a new line.
2. Prefix each hook with the symbol ► (e.g. ► Hook text goes here)
3. Keep them incredibly engaging, punchy, and under 2 sentences each.
4. Do not provide any conversational text before or after the hooks. Just the 5 hooks.
5. LANGUAGE: You MUST detect the language of the user's Topic and write the output in that EXACT SAME language (e.g., if input is in Arabic, output must be in Arabic). Do not default to English unless the input is in English.`;
=======
    // Build context-aware additions to the system prompt
    const contextSection = trendContext
        ? `\n\nTREND CONTEXT (use this to make hooks hyper-relevant):\n- Topic: ${trendContext.topic}\n- Current Sentiment in the market: ${trendContext.sentiment} (lean into this tone)\n- Momentum score: ${trendContext.momentum}/100 (higher = more urgency in the hook)\n- Unexplored angles competitors have missed: ${(trendContext.unexploredAngles || []).join(', ')}\n\nPRIORITY: At least 2 of your 5 hooks MUST use one of the unexplored angles above to give the user a genuine competitive edge that competitors cannot easily replicate.`
        : '';

    const systemPrompt = `You are the world's most effective LinkedIn ghostwriter. You write for founders, executives, and professionals who want posts that actually go viral — not posts that sound professional.

Your job: given a topic, produce exactly 5 distinct hooks that would stop someone mid-scroll on LinkedIn. Each hook uses a different psychological angle.

WHAT MAKES A GREAT HOOK:
The first 3-5 words decide everything. They must create an immediate emotional reaction — curiosity, recognition, surprise, or discomfort.

Great hooks are:
- Hyper-specific (numbers, years, dollar amounts, job titles — not vague)
- Slightly uncomfortable to read (they poke at something real)
- Written like a human talking to another human, NOT like a press release
- Short enough to fully show before the LinkedIn "...see more" cutoff (~150 chars)

Bad hooks sound like:
"In today's rapidly changing landscape..." / "I'm excited to share..." / "As a professional..."

THE 5 ANGLES — use exactly one per hook:

1. TRANSFORMATION — a sharp before/after. Specific numbers required.
   Example: "18 months ago I had $0 in savings and 3 job rejections. Today I run a $2M business. One mindset shift made the difference:"
   Formula: [Painful past with specifics] => [Current win with specifics] => "Here's what changed:"

2. CONTRARIAN — say the thing no one dares to say about this topic. Bold, not edgy.
   Example: "Your LinkedIn profile is hurting your career. And your 'personal brand' posts are making it worse."
   Formula: [Common advice or belief] + "is wrong / is killing you / doesn't work" — then hint at why.

3. CURIOSITY GAP — give just enough to create an itch that only the full post scratches.
   Example: "The hiring manager told me exactly why I didn't get the job. I wasn't expecting what she said."
   Formula: Tease the story or insight, withhold the resolution — force the click.

4. PAIN HOOK — name a painful, embarrassing experience your reader has had in vivid specifics.
   Example: "You spent 3 hours writing a LinkedIn post. Got 4 likes. Two were from your mom. Here's why:"
   Formula: Describe the painful moment in vivid specifics => imply you have the answer.

5. BOLD CLAIM / LISTICLE — a promise so specific the reader cannot scroll past.
   Example: "7 things I wish someone told me before I quit my corporate job:"
   Formula: Number + "[topic] I wish I knew / no one tells you / changed everything:"

TONE RULES (non-negotiable):
- Write in first person (I, my, me) — it feels human
- Use em dashes (—) and colons (:) to create rhythm
- NEVER start with: "In today's...", "I'm excited to...", "As a...", "It's important to..."
- Zero buzzwords: synergy, leverage, pivot, ecosystem, thought leadership, game-changer
- A hook ending with a colon (:) powerfully implies "read what comes next"

SCORING — score each hook honestly (0-100):
- stoppingPower: Would this freeze someone's thumb mid-scroll?
- readability: Can it be read in 3 seconds on mobile?
- dwellTime: Does the structure pull toward clicking "see more"?
- ctaEfficiency: Does it naturally provoke comments and sharing?
Average the 4 = viralityScore. Elite hooks score 88+. Do NOT inflate scores.

LANGUAGE: Detect the input language. Arabic input => all 5 hooks in Arabic with same emotional power. English => English.

FINAL CHECK: Before outputting, read each hook out loud. If it sounds like AI wrote it, rewrite it.${contextSection}`;
>>>>>>> Stashed changes

    try {
        const result = streamText({
            model: openai(siteConfig.aiConfig.defaultModel),
            system: systemPrompt,
            prompt: `Topic: ${prompt}`,
        });

        return result.toTextStreamResponse();
    } catch (err: any) {
        console.error("OpenAI API Error:", err);
        return new Response(JSON.stringify({ error: err.message || "Failed to generate hooks" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
