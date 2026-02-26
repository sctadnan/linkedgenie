import { NextResponse } from 'next/server';
import googleTrends from 'google-trends-api';
import { XMLParser } from 'fast-xml-parser';

// Google Trends category IDs relevant to LinkedIn professionals
// 107 = Jobs & Education | 12 = Business & Industrial | 958 = Business News
const BUSINESS_CATEGORIES = [107, 12, 958];

// Curated professional RSS sources — topics that LinkedIn users actually opine on
const PROFESSIONAL_RSS_FEEDS = [
    { url: 'https://www.inc.com/rss', category: 'Entrepreneurship' },
    { url: 'https://hbr.org/resources/xml/hbr_rss.xml', category: 'Leadership' },
    { url: 'https://feeds.wired.com/wired/index', category: 'Technology & Work' },
    { url: 'https://sloanreview.mit.edu/feed', category: 'Management Strategy' },
    { url: 'https://www.entrepreneur.com/latest.rss', category: 'Business' },
    { url: 'https://feeds.feedburner.com/fastcompany/headlines', category: 'Future of Work' },
];

// Patterns to reject — article-style titles that are bad hook prompts
const SKIP_PATTERNS =
    /(how to|review:|vs\.|ranking|top \d+|best \d+|died|killed|crash|score|nfl|nba|nhl|mlb|actor|actress|\$\d+[MB] round)/i;

type Trend = { id: number; topic: string; category: string };

// ── Google Trends: filter by Business & Jobs categories only
async function fetchBusinessTrends(): Promise<string[]> {
    const results: string[] = [];

    await Promise.allSettled(
        BUSINESS_CATEGORIES.map(async (cat) => {
            const raw = await googleTrends.dailyTrends({
                trendDate: new Date(),
                geo: 'US',
                category: cat,
            });
            const json = JSON.parse(raw);
            const items: { title: { query: string } }[] =
                json?.default?.trendingSearchesDays?.[0]?.trendingSearches ?? [];

            const queries = items
                .map((i) => i.title.query)
                .filter((q) => !SKIP_PATTERNS.test(q) && q.split(' ').length >= 2);

            results.push(...queries.slice(0, 2));
        })
    );

    // Dedupe
    return [...new Set(results)].slice(0, 3);
}

// ── RSS: extract the headline topic, not the full article title
function cleanHeadline(raw: string): string {
    // Strip HTML tags if any, trim whitespace
    const clean = raw.replace(/<[^>]+>/g, '').trim();
    // Shorten to ~60 chars at a word boundary
    if (clean.length <= 65) return clean;
    const cut = clean.substring(0, 65);
    return cut.substring(0, cut.lastIndexOf(' ')) + '...';
}

async function fetchProfessionalRss(): Promise<{ title: string; category: string }[]> {
    const parser = new XMLParser({ ignoreAttributes: false });
    const results: { title: string; category: string }[] = [];

    await Promise.allSettled(
        PROFESSIONAL_RSS_FEEDS.map(async (feed) => {
            const res = await fetch(feed.url, {
                headers: { 'User-Agent': 'LinkedGenie/1.0 (Content Research)' },
                signal: AbortSignal.timeout(4000),
            });
            const xml = await res.text();
            const obj = parser.parse(xml);

            const items: unknown[] =
                obj?.rss?.channel?.item ?? obj?.feed?.entry ?? [];

            const list = Array.isArray(items) ? items.slice(0, 3) : [];

            for (const item of list) {
                const raw = item as Record<string, unknown>;
                const titleVal = raw?.title;
                const rawTitle: string =
                    typeof titleVal === 'object' && titleVal !== null
                        ? String((titleVal as Record<string, unknown>)['#text'] ?? '')
                        : String(titleVal ?? '');

                const title = cleanHeadline(rawTitle);

                // Skip article-style titles that make poor hook prompts
                if (!title || SKIP_PATTERNS.test(title)) continue;

                results.push({ title, category: feed.category });
                break; // only 1 good headline per source
            }
        })
    );

    return results;
}

// ── Hardcoded: professional, opinion-provoking LinkedIn staples
const FALLBACK_TRENDS: Trend[] = [
    { id: 1, topic: 'AI Replacing Mid-Level Managers', category: 'Future of Work' },
    { id: 2, topic: 'The 4-Day Work Week: Is It Real?', category: 'Workplace Culture' },
    { id: 3, topic: 'Personal Branding vs. Imposter Syndrome', category: 'Career Growth' },
    { id: 4, topic: 'Quiet Quitting Is Back — And Louder', category: 'Work Culture' },
    { id: 5, topic: 'Remote Work Is Not Fair to Junior Employees', category: 'Remote Work' },
];

export async function GET() {
    const businessTopics: string[] = [];
    const rssItems: { title: string; category: string }[] = [];

    // Run both sources in parallel
    await Promise.allSettled([
        fetchBusinessTrends().then((r) => businessTopics.push(...r)).catch(() => null),
        fetchProfessionalRss().then((r) => rssItems.push(...r)).catch(() => null),
    ]);

    const combined: Trend[] = [];

    // Google Trends (business-category only) — up to 3
    for (const topic of businessTopics) {
        if (combined.length >= 3) break;
        combined.push({ id: combined.length + 1, topic, category: 'Trending in Business' });
    }

    // Professional RSS — fill up to 6
    for (const item of rssItems) {
        if (combined.length >= 6) break;
        combined.push({ id: combined.length + 1, topic: item.title, category: item.category });
    }

    // Hardcoded fallback if not enough
    if (combined.length < 4) {
        for (const f of FALLBACK_TRENDS) {
            if (combined.length >= 5) break;
            combined.push({ ...f, id: combined.length + 1 });
        }
    }

    const source =
        businessTopics.length > 0 ? 'google-business+rss'
            : rssItems.length > 0 ? 'rss'
                : 'hardcoded';

    return NextResponse.json(
        { trends: combined, source },
        { status: 200, headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=600' } }
    );
}
