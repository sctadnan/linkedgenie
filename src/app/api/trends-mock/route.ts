import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';


// Reddit professional subreddits via free RSS — these return real human discussions,
// not polished article titles. Perfect hook-topic seeds.
const REDDIT_FEEDS = [
    { url: 'https://www.reddit.com/r/Entrepreneur/top/.rss?t=week&limit=10', category: 'Entrepreneurship' },
    { url: 'https://www.reddit.com/r/careerguidance/top/.rss?t=week&limit=10', category: 'Career Growth' },
    { url: 'https://www.reddit.com/r/personalfinance/top/.rss?t=week&limit=10', category: 'Finance & Work' },
    { url: 'https://www.reddit.com/r/cscareerquestions/top/.rss?t=week&limit=10', category: 'Tech Careers' },
    { url: 'https://www.reddit.com/r/WorkplacePolitics/top/.rss?t=week&limit=10', category: 'Workplace Culture' },
    { url: 'https://www.reddit.com/r/digitalnomad/top/.rss?t=week&limit=10', category: 'Remote Work' },
];

// Reject Reddit posts that are questions, meta-posts, or too personal to generalize
const SKIP_PATTERNS = /(\[meta\]|\[update\]|rant:|advice:|help:|need help|just got|am i wrong|am I wrong|AITA|weekly thread|looking for|anyone else|does anyone)/i;

// Min characters for a useful hook topic (too short = vague, too long = article title)
const MIN_LEN = 20;
const MAX_LEN = 80;

type Trend = { id: number; topic: string; category: string };

// Hardcoded fallback — opinion-provoking LinkedIn-native debates
const FALLBACK_TRENDS: Trend[] = [
    { id: 1, topic: 'AI is replacing mid-level managers faster than anyone expected', category: 'Future of Work' },
    { id: 2, topic: 'Return-to-office mandates are destroying company culture', category: 'Workplace Culture' },
    { id: 3, topic: 'The 4-day work week works — companies just refuse to try it', category: 'Work Culture' },
    { id: 4, topic: 'Quiet quitting is just called "working your hours" in Europe', category: 'Career Philosophy' },
    { id: 5, topic: 'Your personal brand is more valuable than your job title', category: 'Career Growth' },
];

function cleanTitle(raw: string): string {
    // Strip Reddit formatting artifacts and HTML entities
    return raw
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/<[^>]+>/g, '')
        .trim();
}

async function fetchRedditTrends(): Promise<{ title: string; category: string }[]> {
    const parser = new XMLParser({ ignoreAttributes: false });
    const results: { title: string; category: string }[] = [];

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

            // Reddit RSS uses Atom format: feed.entry[]
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

                // Skip if it matches bad patterns, too short, or too long
                if (
                    !title ||
                    SKIP_PATTERNS.test(title) ||
                    title.length < MIN_LEN ||
                    title.length > MAX_LEN
                ) continue;

                results.push({ title, category: feed.category });
                break; // 1 strong topic per subreddit
            }
        })
    );

    return results;
}

export async function GET() {
    const redditItems: { title: string; category: string }[] = [];

    await fetchRedditTrends()
        .then((r) => redditItems.push(...r))
        .catch(() => null);

    const combined: Trend[] = redditItems.map((item, i) => ({
        id: i + 1,
        topic: item.title,
        category: item.category,
    }));

    // Pad with hardcoded if Reddit returned fewer than 4
    if (combined.length < 4) {
        for (const f of FALLBACK_TRENDS) {
            if (combined.length >= 5) break;
            combined.push({ ...f, id: combined.length + 1 });
        }
    }

    const source = redditItems.length > 0 ? 'reddit' : 'hardcoded';

    return NextResponse.json(
        { trends: combined, source },
        { status: 200, headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=600' } }
    );
}
