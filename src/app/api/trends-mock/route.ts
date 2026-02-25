import { NextResponse } from 'next/server';

export async function GET() {
    // Mock trends based on the strategy report, localized for bilingual possibilities.
    const trends = [
        { id: 1, topic: "The End of the 9-to-5", category: "Remote Work" },
        { id: 2, topic: "AI Replacing Entry-Level Jobs", category: "Technology" },
        { id: 3, topic: "Toxic Positivity on LinkedIn", category: "Culture" },
        { id: 4, topic: "Personal Branding vs Imposter Syndrome", category: "Personal Development" }
    ];

    return NextResponse.json({ trends }, { status: 200, headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate' } });
}
