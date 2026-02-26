import { NextResponse } from 'next/server';
import googleTrends from 'google-trends-api';
import { XMLParser } from 'fast-xml-parser';

// The fallback hardcoded list — always available
const FALLBACK_TRENDS = [
    { id: 1, topic: "The End of the 9-to-5", category: "Remote Work" },
    { id: 2, topic: "AI Replacing Entry-Level Jobs", category: "Technology" },
    { id: 3, topic: "Toxic Positivity on LinkedIn", category: "Culture" },
    { id: 4, topic: "Personal Branding vs Imposter Syndrome", category: "Personal Development" }
];

// RSS feeds from LinkedIn-adjacent professional sources
const RSS_FEEDS = [
    { url: 'https://feeds.feedburner.com/fastcompany/headlines', category: 'Business' },
    { url: 'https://hbr.org/resources/xml/hbr_rss.xml', category: 'Leadership' },
    { url: 'https://techcrunch.com/feed/', category: 'Technology' },
];

type Trend = { id: number; topic: string; category: string };

// ── Helper: Fetch trends from Google Trends (Daily Trending Searches)
async function fetchGoogleTrends(): Promise<Trend[]> {
    const result = await googleTrends.dailyTrends({
        trendDate: new Date(),
        geo: 'US',
    });

    const json = JSON.parse(result);
    const items: { title: { query: string } }[] =
        json?.default?.trendingSearchesDays?.[0]?.trendingSearches ?? [];

    // Pick 4 relevant professional-sounding topics, skip obvious celebrity/sports ones
    const filtered = items
        .map((i) => i.title.query)
        .filter((q) =>
            !/(game|movie|score|died|vs\.|nfl|nba|mlb|nhl|singer|actor|actress|killed|crash)/i.test(q)
        )
        .slice(0, 4);

    return filtered.map((topic, idx) => ({
        id: idx + 1,
        topic,
        category: 'Trending',
    }));
}

// ── Helper: Fetch trends from RSS feeds
async function fetchRssTrends(): Promise<Trend[]> {
    const parser = new XMLParser({ ignoreAttributes: false });
    const results: Trend[] = [];

    await Promise.allSettled(
        RSS_FEEDS.map(async (feed) => {
            const res = await fetch(feed.url, {
                headers: { 'User-Agent': 'LinkedGenie/1.0 (RSS Reader)' },
                signal: AbortSignal.timeout(4000),
            });
            const xml = await res.text();
            const obj = parser.parse(xml);

            const items =
                obj?.rss?.channel?.item ??
                obj?.feed?.entry ??
                [];

            const first = Array.isArray(items) ? items[0] : null;
            if (!first) return;

            const title: string =
                first?.title?.['#text'] ?? first?.title ?? '';

            if (title) {
                results.push({
                    id: results.length + 1,
                    topic: title.length > 70 ? title.substring(0, 70) + '...' : title,
                    category: feed.category,
                });
            }
        })
    );

    return results;
}

export async function GET() {
    let trends: Trend[] = [];
    let source = 'hardcoded';

    // TIER 1: Try Google Trends
    try {
        const googleTrendItems = await fetchGoogleTrends();
        if (googleTrendItems.length >= 2) {
            trends = googleTrendItems;
            source = 'google-trends';
        }
    } catch {
        // Google Trends failed — fall through to RSS
    }

    // TIER 2: Try RSS feeds if Google Trends didn't work or returned too few
    if (trends.length < 2) {
        try {
            const rssItems = await fetchRssTrends();
            if (rssItems.length >= 2) {
                trends = rssItems;
                source = 'rss';
            }
        } catch {
            // RSS also failed — fall through to hardcoded
        }
    }

    // TIER 3: Hardcoded fallback — always wins if above two failed
    if (trends.length === 0) {
        trends = FALLBACK_TRENDS;
        source = 'hardcoded';
    }

    return NextResponse.json(
        { trends, source },
        {
            status: 200,
            headers: {
                // Cache for 1 hour on CDN edge (Vercel), revalidate in background
                'Cache-Control': 's-maxage=3600, stale-while-revalidate=600',
            },
        }
    );
}
