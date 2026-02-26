"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

type SimpleTrend = { id: number; topic: string; category: string; momentum: number; };

export function TrendAlertBanner() {
    const router = useRouter();
    const [alertTrend, setAlertTrend] = useState<SimpleTrend | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Check if already dismissed this session
        const wasDismissed = sessionStorage.getItem('genie_trend_alert_dismissed');
        if (wasDismissed) return;

        const fetchTopTrend = async () => {
            try {
                const res = await fetch('/api/trends-mock');
                if (!res.ok) return;
                const data = await res.json();
                if (!data.trends?.length) return;
                // Pick the highest-momentum trend
                const topTrend = data.trends.reduce((best: SimpleTrend, t: SimpleTrend) =>
                    (t.momentum > best.momentum ? t : best), data.trends[0]);
                if (topTrend.momentum >= 75) {
                    setAlertTrend(topTrend);
                }
            } catch {
                // non-critical
            }
        };

        // Slight delay so it doesn't flash immediately
        const timer = setTimeout(fetchTopTrend, 2500);
        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setDismissed(true);
        sessionStorage.setItem('genie_trend_alert_dismissed', '1');
    };

    const handleCTA = () => {
        handleDismiss();
        sessionStorage.setItem('genie_preselect_trend', JSON.stringify(alertTrend));
        router.push('/trend-hub');
    };

    if (!alertTrend || dismissed) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -60, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.3 }}
                className="fixed top-16 left-0 right-0 z-40 px-4 py-2 flex justify-center pointer-events-none"
            >
                <div className="pointer-events-auto flex items-center gap-3 bg-[#0e0f1a] border border-indigo-500/40 rounded-full px-4 py-2.5 shadow-2xl shadow-indigo-500/15 max-w-2xl w-full">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500" />
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400">Hot Trend</span>
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <p className="text-xs text-zinc-300 truncate">
                            <span className="font-medium text-white">{alertTrend.topic}</span>
                        </p>
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                            {alertTrend.momentum}% ↑
                        </span>
                    </div>
                    <button
                        onClick={handleCTA}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full transition-all flex-shrink-0 whitespace-nowrap"
                    >
                        <Zap className="w-3 h-3" />
                        Write About It
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="text-zinc-600 hover:text-zinc-400 transition-colors flex-shrink-0 p-0.5"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
