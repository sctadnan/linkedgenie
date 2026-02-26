"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, TrendingUp, Zap, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { TrendCard, EnrichedTrend } from "@/components/TrendCard";
import { HookLab, TrendContext } from "@/components/HookLab";

export default function DynamicWorkspace() {
    const [sessionToken, setSessionToken] = useState("");
    const [userName, setUserName] = useState("Genie User");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [trends, setTrends] = useState<EnrichedTrend[]>([]);
    const [isLoadingTrends, setIsLoadingTrends] = useState(true);
    const [trendsError, setTrendsError] = useState(false);
    const [selectedTrend, setSelectedTrend] = useState<EnrichedTrend | null>(null);
    const [xp, setXp] = useState(0);
    const trendRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        // Load XP from localStorage
        const saved = localStorage.getItem('genie_xp');
        if (saved) setXp(parseInt(saved, 10));

        // Load session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSessionToken(session.access_token);
                setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "Genie User");
                setAvatarUrl(session.user.user_metadata?.avatar_url || "");
            }
        });

        // Load enriched trends
        const loadTrends = async () => {
            try {
                const res = await fetch('/api/trends-mock');
                if (!res.ok) throw new Error('Failed');
                const data = await res.json();
                if (data.trends) setTrends(data.trends);
            } catch {
                setTrendsError(true);
            } finally {
                setIsLoadingTrends(false);
            }
        };
        loadTrends();
    }, []);

    // Scrollytelling: IntersectionObserver on trend cards
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('trend-visible');
                    }
                });
            },
            { threshold: 0.1 }
        );
        trendRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });
        return () => observer.disconnect();
    }, [trends]);

    const handleXpGain = (amount: number) => {
        const newXp = xp + amount;
        setXp(newXp);
        localStorage.setItem('genie_xp', newXp.toString());
    };

    const handleHookGenerated = () => {
        handleXpGain(5); // bonus XP for generating
    };

    const handleSelectTrend = (trend: EnrichedTrend) => {
        setSelectedTrend(trend);
        // On mobile, scroll to hook lab
        if (window.innerWidth < 768) {
            setTimeout(() => {
                document.getElementById('hook-lab-panel')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    const selectedContext: TrendContext | null = selectedTrend
        ? {
            topic: selectedTrend.topic,
            sentiment: selectedTrend.sentiment,
            momentum: selectedTrend.momentum,
            unexploredAngles: selectedTrend.unexploredAngles,
        }
        : null;

    const level = Math.floor(xp / 100) + 1;
    const progress = xp % 100;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-[35%] h-[40%] rounded-full bg-indigo-600/8 blur-[150px]" />
                <div className="absolute top-[30%] right-[5%] w-[40%] h-[50%] rounded-full bg-pink-600/8 blur-[150px]" />
                <div className="absolute bottom-[10%] left-[30%] w-[30%] h-[35%] rounded-full bg-purple-600/6 blur-[120px]" />
            </div>

<<<<<<< Updated upstream
            <div className="max-w-3xl w-full flex flex-col items-center text-center mb-12 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-orange-400 text-sm font-medium mb-6">
                    <TrendingUp className="w-4 h-4" />
                    Trend Jacking Radar
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                    Discover Viral <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Industry Trends</span>
                </h1>
                <p className="text-lg text-zinc-400 max-w-xl mx-auto">
                    Stop guessing what to post. Enter your industry or niche, and our AI will analyze the most viral concepts working right now on LinkedIn.
                </p>
            </div>

            <div className="w-full max-w-3xl">
                <form onSubmit={handleSubmit} className="relative mt-auto pt-6 pb-20 md:pb-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none md:hidden" />
                    <div className="relative flex items-center gap-2 max-w-lg mx-auto md:w-full">
                        <input
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Paste a live trend URL or keyword..."
                            className="flex-1 w-full bg-zinc-900 border border-white/10 rounded-full px-4 md:px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all placeholder:text-zinc-600 shadow-xl text-ellipsis"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || (!input && !topic)}
                            className="bg-pink-600 hover:bg-pink-500 text-white rounded-full p-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex-shrink-0"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error.message || "Failed to fetch trends."}</p>
                    </div>
                )}

                <div className="relative min-h-[400px]">
                    {!hasResult && !isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 p-8 glass rounded-2xl">
                            <TrendingUp className="w-12 h-12 opacity-20 mb-4" />
                            <p>Looking for the next big topic...</p>
=======
            {/* Page Header */}
            <div className="pt-28 pb-6 px-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full text-indigo-400 text-xs font-semibold mb-3">
                            <Zap className="w-3.5 h-3.5" />
                            Dynamic Workspace — Trend × Hook Intelligence
>>>>>>> Stashed changes
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Trend Hub &{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">
                                Hook Lab
                            </span>
                        </h1>
                        <p className="text-zinc-400 text-sm mt-2 max-w-lg">
                            Discover what's hot right now, then instantly engineer scroll-stopping hooks — all in one connected workspace.
                        </p>
                    </div>

                    {/* XP Bar */}
                    <div className="flex-shrink-0 bg-white/[0.03] border border-white/8 px-4 py-3 rounded-2xl flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Level {level}</span>
                            <span className="text-xs font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400">Trendsetter</span>
                        </div>
                        <div className="w-28 h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-indigo-500 to-pink-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.6 }}
                            />
                        </div>
                        <span className="text-[11px] font-mono text-zinc-500">{xp} XP</span>
                    </div>
                </div>
            </div>

<<<<<<< Updated upstream
                                <div className="prose prose-invert prose-orange max-w-none break-words overflow-hidden">
                                    <div className="whitespace-pre-wrap font-sans text-sm md:text-[16px] leading-relaxed text-zinc-200 break-words">
                                        {completion}
                                        {isLoading && (
                                            <span className="inline-block w-2 h-4 ml-1 bg-orange-500 animate-pulse"></span>
                                        )}
                                    </div>
=======
            {/* Bento Box Grid */}
            <div className="flex-1 px-6 pb-20 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">

                    {/* Left Bento: Trend Stream */}
                    <div className="bg-white/[0.02] border border-white/8 rounded-3xl p-6 flex flex-col min-h-[600px]">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-orange-400" />
>>>>>>> Stashed changes
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-white">Trend Stream</h2>
                                    <p className="text-[11px] text-zinc-500">Live from the web · Click to select</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setIsLoadingTrends(true);
                                    setTrendsError(false);
                                    fetch('/api/trends-mock')
                                        .then(r => r.json())
                                        .then(d => { if (d.trends) setTrends(d.trends); })
                                        .catch(() => setTrendsError(true))
                                        .finally(() => setIsLoadingTrends(false));
                                }}
                                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 rounded-lg hover:bg-white/5"
                                title="Refresh trends"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Trends content */}
                        {isLoadingTrends ? (
                            <div className="flex flex-col gap-3 flex-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-28 rounded-2xl bg-white/[0.03] animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                                ))}
                            </div>
                        ) : trendsError ? (
                            <div className="flex flex-col items-center justify-center flex-1 text-center">
                                <AlertCircle className="w-8 h-8 text-zinc-600 mb-3" />
                                <p className="text-zinc-500 text-sm">Could not load live trends.</p>
                                <button onClick={() => window.location.reload()} className="mt-3 text-xs text-indigo-400 hover:text-indigo-300">
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1">
                                {trends.map((trend, i) => (
                                    <div
                                        key={trend.id}
                                        ref={el => { trendRefs.current[i] = el; }}
                                        className={`transition-all duration-500 ${selectedTrend?.id !== trend.id && selectedTrend ? 'opacity-60 scale-[0.99] blur-[0.5px]' : 'opacity-100 scale-100 blur-0'}`}
                                    >
                                        <TrendCard
                                            trend={trend}
                                            isSelected={selectedTrend?.id === trend.id}
                                            onSelect={handleSelectTrend}
                                            index={i}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Bento: Hook Lab */}
                    <div
                        id="hook-lab-panel"
                        className={`border rounded-3xl p-6 flex flex-col min-h-[600px] transition-all duration-500 ${selectedTrend
                            ? 'bg-indigo-500/[0.04] border-indigo-500/30 shadow-2xl shadow-indigo-500/10'
                            : 'bg-white/[0.02] border-white/8'
                            }`}
                    >
                        {/* Pulsing glow on selected */}
                        {selectedTrend && (
                            <div className="absolute inset-0 rounded-3xl bg-indigo-500/5 pointer-events-none animate-pulse" style={{ animationDuration: '3s' }} />
                        )}
                        <div className="relative flex-1 flex flex-col overflow-y-auto">
                            <AnimatePresence mode="wait">
                                {selectedTrend ? (
                                    <motion.div
                                        key={selectedTrend.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex-1 flex flex-col"
                                    >
                                        <HookLab
                                            trendContext={selectedContext}
                                            sessionToken={sessionToken}
                                            userName={userName}
                                            avatarUrl={avatarUrl}
                                            onXpGain={handleXpGain}
                                            onHookGenerated={handleHookGenerated}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex-1"
                                    >
                                        <HookLab
                                            trendContext={null}
                                            sessionToken={sessionToken}
                                            userName={userName}
                                            avatarUrl={avatarUrl}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                </div>

                {/* Tip row */}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-600">
                    <Zap className="w-3.5 h-3.5 text-indigo-500/50" />
                    <span>Select a trend → Generate hooks → Click "Use Hook" to build your full post in the Post Generator</span>
                </div>
            </div>
        </div>
    );
}
