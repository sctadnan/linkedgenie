'use client';

import { Sparkles } from "lucide-react";

export function GenieCredits() {
    // For MVP, we'll mock a local state counter since true sync with Upstash requires a DB log
    // In a real production app, this would be fetched from the user's DB profile.

    // We'll hardcode 5 credits as the max for the visual to match Upstash
    const maxCredits = 5;

    // Simulate reading from local storage or context (mocking 3 remaining for the demo UI)
    const creditsRemaining = 3;

    const percentage = (creditsRemaining / maxCredits) * 100;

    return (
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 hidden md:flex">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{creditsRemaining} / {maxCredits}</span>
            </div>

            <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <span className="text-[10px] text-zinc-500 font-medium tracking-wide uppercase">Credits</span>
        </div>
    );
}
