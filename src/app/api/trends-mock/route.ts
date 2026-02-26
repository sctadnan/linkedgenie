import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

// Reddit professional subreddits via free RSS
const REDDIT_FEEDS = [
    { url: 'https://www.reddit.com/r/Entrepreneur/top/.rss?t=week&limit=10', category: 'Entrepreneurship' },
    { url: 'https://www.reddit.com/r/careerguidance/top/.rss?t=week&limit=10', category: 'Career Growth' },
    { url: 'https://www.reddit.com/r/personalfinance/top/.rss?t=week&limit=10', category: 'Finance & Work' },
    { url: 'https://www.reddit.com/r/cscareerquestions/top/.rss?t=week&limit=10', category: 'Tech Careers' },
    { url: 'https://www.reddit.com/r/WorkplacePolitics/top/.rss?t=week&limit=10', category: 'Workplace Culture' },
    { url: 'https://www.reddit.com/r/digitalnomad/top/.rss?t=week&limit=10', category: 'Remote Work' },
];

const SKIP_PATTERNS = /(\[meta\]|\[update\]|rant:|advice:|help:|need help|just got|am i wrong|am I wrong|AITA|weekly thread|looking for|anyone else|does anyone)/i;
const MIN_LEN = 20;
const MAX_LEN = 80;

export type EnrichedTrend = {
    id: number;
    topic: string;
    category: string;
    sentiment: 'positive' | 'negative' | 'mixed';
    momentum: number; // 0-100, how fast the trend is growing
    unexploredAngles: string[];
};

// Sentiment detection heuristics
function detectSentiment(title: string): 'positive' | 'negative' | 'mixed' {
    const positiveWords = /\b(success|win|growth|increase|better|best|improve|achieve|thrive|opportunity|gain|rise|top|great|amazing|love|breakthrough)\b/i;
    const negativeWords = /\b(fail|problem|issue|struggle|hard|difficult|wrong|bad|worse|crisis|fear|losing|hurting|quit|fire|lay off|layoff|avoid|mistake|toxic)\b/i;
    const hasPositive = positiveWords.test(title);
    const hasNegative = negativeWords.test(title);
    if (hasPositive && hasNegative) return 'mixed';
    if (hasNegative) return 'negative';
    return 'positive';
}

// Generate unexplored angles based on category and topic
function generateAngles(topic: string, category: string): string[] {
    const baseAngles: Record<string, string[]> = {
        'Entrepreneurship': ['Founder mental health angle', 'Bootstrapped vs VC-backed take', 'First-principles contrarian view'],
        'Career Growth': ['Mid-career pivot perspective', 'Gen Z vs Millennial lens', 'Remote-first career strategy'],
        'Finance & Work': ['Psychological money relationship', 'Side hustle vs salary trade-off', 'Generational wealth angle'],
        'Tech Careers': ['Non-technical leader viewpoint', 'AI-resistant skills angle', 'Hiring manager insider take'],
        'Workplace Culture': ['Leadership accountability angle', 'Individual contributor voice', 'Cultural psychology lens'],
        'Remote Work': ['Async-first methodology', 'Digital nomad freedom vs stability', 'Productivity science angle'],
        'Future of Work': ['Human skills irreplaceable angle', 'AI collaboration not replacement', 'Reskilling urgency perspective'],
        'Career Philosophy': ['Ikigai framework application', 'Stoic career philosophy', 'Systems thinking vs goal setting'],
    };
    const angles = baseAngles[category] || ['Contrarian take', 'Data-driven perspective', 'Personal experience angle'];

    // Add a topic-specific angle
    const words = topic.split(' ').filter(w => w.length > 4);
    if (words.length > 0) {
        angles.unshift(`The "${words[0]}" untold story`);
    }
    return angles.slice(0, 3);
}

// Assign a momentum score (higher = more urgent/trending)
function assignMomentum(index: number, source: 'reddit' | 'fallback'): number {
    if (source === 'reddit') {
        // Reddit items are week's top — give high momentum, vary by position
        return Math.max(60, 95 - index * 8);
    }
    return Math.max(40, 75 - index * 10);
}

type RawTrend = { title: string; category: string; source: 'reddit' | 'fallback' };

const FALLBACK_TRENDS: RawTrend[] = [
    { title: 'AI is replacing mid-level managers faster than anyone expected', category: 'Future of Work', source: 'fallback' },
    { title: 'Return-to-office mandates are destroying company culture', category: 'Workplace Culture', source: 'fallback' },
    { title: 'The 4-day work week works — companies just refuse to try it', category: 'Work Culture', source: 'fallback' },
    { title: 'Quiet quitting is just called "working your hours" in Europe', category: 'Career Philosophy', source: 'fallback' },
    { title: 'Your personal brand is more valuable than your job title', category: 'Career Growth', source: 'fallback' },
];

function cleanTitle(raw: string): string {
    return raw
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/<[^>]+>/g, '')
        .trim();
}

async function fetchRedditTrends(): Promise<RawTrend[]> {
    const parser = new XMLParser({ ignoreAttributes: false });
    const results: RawTrend[] = [];

    await Promise.allSettled(
        REDDIT_FEEDS.map(async (feed) => {
            const res = await fetch(feed.url, {
                headers: {
                    'User-Agent': 'LinkedGenie/1.0 (Content Research Bot)',
                    'Accept': 'application/rss+xml, application/xml, text/xml',
                },
                signal: AbortSignal.timeout(5000),
            });

            const xml = await res.text();
            const obj = parser.parse(xml);

            const entries: unknown[] = obj?.feed?.entry ?? [];
            const list = Array.isArray(entries) ? entries : [];

            for (const entry of list) {
                const raw = entry as Record<string, unknown>;
                const titleVal = raw?.title;
                const rawTitle: string =
                    typeof titleVal === 'object' && titleVal !== null
                        ? String((titleVal as Record<string, unknown>)['#text'] ?? '')
                        : String(titleVal ?? '');

                const title = cleanTitle(rawTitle);

                if (
                    !title ||
                    SKIP_PATTERNS.test(title) ||
                    title.length < MIN_LEN ||
                    title.length > MAX_LEN
                ) continue;

                results.push({ title, category: feed.category, source: 'reddit' });
                break;
            }
        })
    );

    return results;
}

export async function GET() {
    const redditItems: RawTrend[] = [];

    await fetchRedditTrends()
        .then((r) => redditItems.push(...r))
        .catch(() => null);

    const rawTrends: RawTrend[] = redditItems.length > 0 ? redditItems : [];

    // Pad with fallback if Reddit returned fewer than 4
    if (rawTrends.length < 4) {
        for (const f of FALLBACK_TRENDS) {
            if (rawTrends.length >= 5) break;
            rawTrends.push(f);
        }
    }

    const enrichedTrends: EnrichedTrend[] = rawTrends.map((item, i) => ({
        id: i + 1,
        topic: item.title,
        category: item.category,
        sentiment: detectSentiment(item.title),
        momentum: assignMomentum(i, item.source),
        unexploredAngles: generateAngles(item.title, item.category),
    }));

    const source = redditItems.length > 0 ? 'reddit' : 'hardcoded';

    return NextResponse.json(
        { trends: enrichedTrends, source },
        { status: 200, headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=600' } }
    );
}
