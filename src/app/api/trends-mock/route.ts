import { NextResponse } from 'next/server';
import googleTrends from 'google-trends-api';
import { XMLParser } from 'fast-xml-parser';

const FALLBACK_TRENDS = [
    { id: 1, topic: "The End of the 9-to-5", category: "Remote Work" },
    { id: 2, topic: "AI Replacing Entry-Level Jobs", category: "Technology" },
    { id: 3, topic: "Toxic Positivity on LinkedIn", category: "Culture" },
    { id: 4, topic: "Personal Branding vs Imposter Syndrome", category: "Personal Development" },
];

const RSS_FEEDS = [
    { url: 'https://feeds.feedburner.com/fastcompany/headlines', category: 'Business' },
    { url: 'https://hbr.org/resources/xml/hbr_rss.xml', category: 'Leadership' },
    { url: 'https://techcrunch.com/feed/', category: 'Technology' },
];

type Trend = { id: number; topic: string; category: string };

// Fetch top Google Trends (relaxed filter — skip only obvious sports/death/games)
async function fetchGoogleTrends(): Promise<string[]> {
    const result = await googleTrends.dailyTrends({ trendDate: new Date(), geo: 'US' });
    const json = JSON.parse(result);
    const items: { title: { query: string } }[] =
        json?.default?.trendingSearchesDays?.[0]?.trendingSearches ?? [];

    return items
        .map((i) => i.title.query)
        .filter((q) => !/(score|killed|crash|nfl|nba|mlb|nhl|actor|actress)/i.test(q))
        .slice(0, 4);
}

// Fetch top 2 headlines from each RSS feed
async function fetchRssTrends(): Promise<{ title: string; category: string }[]> {
    const parser = new XMLParser({ ignoreAttributes: false });
    const results: { title: string; category: string }[] = [];

    await Promise.allSettled(
        RSS_FEEDS.map(async (feed) => {
            const res = await fetch(feed.url, {
                headers: { 'User-Agent': 'LinkedGenie/1.0' },
                signal: AbortSignal.timeout(4000),
            });
            const xml = await res.text();
            const obj = parser.parse(xml);

            const items: unknown[] =
                obj?.rss?.channel?.item ?? obj?.feed?.entry ?? [];

            const list = Array.isArray(items) ? items.slice(0, 2) : [];

            for (const item of list) {
                const raw = (item as Record<string, unknown>);
                const titleVal = raw?.title;
                const title: string =
                    typeof titleVal === 'object' && titleVal !== null
                        ? String((titleVal as Record<string, unknown>)['#text'] ?? '')
                        : String(titleVal ?? '');

                if (title.trim()) {
                    results.push({
                        title: title.length > 65 ? title.substring(0, 65) + '...' : title,
                        category: feed.category,
                    });
                }
            }
        })
    );

    return results;
}

export async function GET() {
    const googleTopics: string[] = [];
    const rssItems: { title: string; category: string }[] = [];

    // Run both sources in parallel
    await Promise.allSettled([
        fetchGoogleTrends().then((r) => googleTopics.push(...r)).catch(() => null),
        fetchRssTrends().then((r) => rssItems.push(...r)).catch(() => null),
    ]);

    // Build combined list — Google Trends first, then RSS, up to 6 total
    const combined: Trend[] = [];

    for (const topic of googleTopics) {
        if (combined.length >= 3) break;
        combined.push({ id: combined.length + 1, topic, category: 'Trending' });
    }

    for (const item of rssItems) {
        if (combined.length >= 6) break;
        combined.push({ id: combined.length + 1, topic: item.title, category: item.category });
    }

    // Always fall back to hardcoded if we still don't have enough
    if (combined.length < 3) {
        const fallbackNeeded = FALLBACK_TRENDS.slice(combined.length);
        combined.push(
            ...fallbackNeeded.map((f, i) => ({ ...f, id: combined.length + i + 1 }))
        );
    }

    const source = googleTopics.length > 0 ? 'google+rss' : rssItems.length > 0 ? 'rss' : 'hardcoded';

    return NextResponse.json(
        { trends: combined, source },
        { status: 200, headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=600' } }
    );
}
