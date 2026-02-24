'use server';

import { XMLParser } from 'fast-xml-parser';

export interface TrendItem {
    id: string;
    title: string;
    description: string;
    link: string;
    pubDate: string;
    source: string;
}

const RSS_FEEDS = [
    { url: 'https://news.ycombinator.com/rss', name: 'Hacker News' },
    { url: 'https://techcrunch.com/feed/', name: 'TechCrunch' }
];

export async function fetchLiveTrends(): Promise<TrendItem[]> {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_"
    });

    let allTrends: TrendItem[] = [];

    for (const feed of RSS_FEEDS) {
        try {
            const response = await fetch(feed.url, { next: { revalidate: 3600 } }); // Cache for 1 hour
            const xmlData = await response.text();

            const result = parser.parse(xmlData);
            const items = result?.rss?.channel?.item || [];

            // Ensure items is an array (fast-xml-parser returns object if only 1 item)
            const itemArray = Array.isArray(items) ? items : [items];

            const mappedItems = itemArray.slice(0, 5).map((item: any, index: number) => ({
                id: `${feed.name.replace(/\s+/g, '')}-${index}`,
                title: item.title,
                description: item.description ? item.description.replace(/(<([^>]+)>)/gi, "").slice(0, 150) + '...' : '', // Strip HTML
                link: item.link,
                pubDate: item.pubDate || new Date().toISOString(),
                source: feed.name
            }));

            allTrends = [...allTrends, ...mappedItems];
        } catch (error) {
            console.error(`Failed to fetch RSS feed from ${feed.name}:`, error);
        }
    }

    // Sort by date (newest first) and return top 6
    return allTrends
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        .slice(0, 6);
}
