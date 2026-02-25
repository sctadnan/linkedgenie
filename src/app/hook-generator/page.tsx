"use client";

import { useState, useEffect } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Loader2, Wand2, Copy, AlertCircle, Sparkles, TrendingUp, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { LinkedInPreview } from "@/components/LinkedInPreview";
import { ViralGauge } from "@/components/ViralGauge";
import { z } from "zod";

const hookSchema = z.object({
    hooks: z.array(z.object({
        text: z.string(),
        angle: z.string(),
        viralityScore: z.number(),
        metrics: z.object({
            stoppingPower: z.number(),
            readability: z.number(),
            dwellTime: z.number(),
            ctaEfficiency: z.number()
        })
    }))
});

export default function HookGenerator() {
    const [sessionToken, setSessionToken] = useState("");
    const [userName, setUserName] = useState("Genie User");
    const userHeadline = "Content Creator | Growth Expert";
    const [avatarUrl, setAvatarUrl] = useState("");
    const [xp, setXp] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('genie_xp');
            return saved ? parseInt(saved, 10) : 0;
        }
        return 0;
    });
    const [trends, setTrends] = useState<{ id: number, topic: string, category: string }[]>([]);
    const [topicInput, setTopicInput] = useState("");
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    useEffect(() => {
        // Load User Profile
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSessionToken(session.access_token);
                setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "Genie User");
                setAvatarUrl(session.user.user_metadata?.avatar_url || "");
            }
        });


        // Load Trends
        const loadTrends = async () => {
            try {
                const res = await fetch('/api/trends-mock');
                const data = await res.json();
                if (data.trends) setTrends(data.trends);
            } catch {
                // trends are non-critical
            }
        };
        loadTrends();
    }, []);

    const { object, submit, isLoading, error } = useObject({
        api: "/api/generate-hook",
        schema: hookSchema,
        headers: {
            "Content-Type": "application/json",
            ...(sessionToken ? { "Authorization": `Bearer ${sessionToken}` } : {})
        },
    });

    const level = Math.floor(xp / 100) + 1;
    const progress = (xp % 100);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!topicInput.trim()) return;
        submit({ prompt: topicInput });
    };

    const handleCopy = (text: string, index: number) => {
        // Find if Arabic (very basic detection)
        const isArabic = /[\\u0600-\\u06FF]/.test(text);
        const rtlPrefix = isArabic ? "\\u200F" : ""; // RLM
        navigator.clipboard.writeText(rtlPrefix + text.replace('►', '').trim());
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);

        // Add XP for engagement
        const newXp = xp + 10;
        setXp(newXp);
        localStorage.setItem("genie_xp", newXp.toString());
    };

    // Detect if input is mostly RTL
    const isInputRtl = /[\\u0600-\\u06FF]/.test(topicInput);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center pt-28 pb-20 px-4 md:px-6 relative overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-pink-600/10 blur-[120px]" />
                <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
            </div>

            {/* Gamification Header */}
            <div className="w-full max-w-4xl flex justify-end mb-8 animate-fade-in">
                <div className="glass px-4 py-2 rounded-xl flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Level {level}</span>
                        <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400">Trendsetter</span>
                    </div>
                    <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-pink-500 to-indigo-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="text-xs font-mono text-zinc-500">{xp} XP</span>
                </div>
            </div>

            {/* Hero Section */}
            <div className="max-w-4xl w-full text-center mb-10 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 glass border-indigo-500/20 px-4 py-2 rounded-full text-indigo-400 text-sm font-medium mb-6">
                    <Sparkles className="w-4 h-4" />
                    AI Viral Predictor 2.0
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
                    Engineer <span className="text-transparent bg-clip-text bg-gradient-to-br from-pink-500 to-indigo-500">Virality</span> Instantly.
                </h1>
                <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 font-light">
                    Don&apos;t guess what works. Drop a topic and let our AI predict, score, and optimize your opening hooks to beat the LinkedIn algorithm.
                </p>

                {/* Trending Topics Pre-fill */}
                <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                    {trends.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTopicInput(t.topic)}
                            className="glass text-xs md:text-sm px-3 py-1.5 md:py-2 rounded-full flex items-center gap-1.5 text-zinc-300 hover:text-white hover:border-pink-500/50 transition-all active:scale-95"
                        >
                            <TrendingUp className="w-3.5 h-3.5 text-pink-400" />
                            {t.topic}
                        </button>
                    ))}
                </div>
            </div>

            {/* Form Section */}
            <div className="w-full max-w-3xl mb-16">
                <form onSubmit={handleSubmit} className="glass rounded-2xl p-2 flex flex-col sm:flex-row gap-2 relative z-10 shadow-2xl shadow-indigo-900/10">
                    <input
                        type="text"
                        className={`flex-1 w-full bg-transparent border-none px-4 md:px-6 py-4 text-zinc-100 outline-none placeholder:text-zinc-500 text-sm md:text-lg text-ellipsis ${isInputRtl ? 'dir-rtl' : 'dir-ltr'}`}
                        placeholder="What's your post about? (Paste an idea or click a trend)"
                        value={topicInput}
                        dir="auto"
                        onChange={(e) => setTopicInput(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !topicInput}
                        className="bg-zinc-100 text-zinc-900 hover:bg-white hover:scale-[1.02] font-bold rounded-xl px-8 py-4 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:min-w-[200px]"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                Generate Virality <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error.message || "Failed to generate hooks."}</p>
                    </div>
                )}
            </div>

            {/* Loading State Animation */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="w-full max-w-3xl flex flex-col items-center justify-center gap-6 py-12"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
                            <Wand2 className="w-12 h-12 text-indigo-400 animate-bounce relative z-10" />
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400 font-semibold animate-pulse">Running Viral Algorithm...</p>
                            <div className="flex gap-2">
                                <span className="w-2 h-2 rounded-full bg-zinc-700 animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Section */}
            <AnimatePresence>
                {object?.hooks && object.hooks.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full max-w-5xl flex flex-col gap-12"
                    >
                        <div className="text-center">
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 inline-block mb-2">Here are your Viral Angles</h2>
                            <p className="text-zinc-500">Pick the one that fits your brand voice best.</p>
                        </div>

                        {object.hooks.map((hook, idx) => {
                            if (!hook || !hook.text || typeof hook.text !== 'string' || !hook.metrics) return null;
                            const hookText = hook.text;
                            const hookIsRtl = /[\u0600-\u06FF]/.test(hookText);

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.15 }}
                                    className="group grid grid-cols-1 lg:grid-cols-12 gap-6 relative"
                                >
                                    {/* Left Panel: Preview */}
                                    <div className="lg:col-span-4 flex flex-col items-center justify-center">
                                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-4xl font-black text-zinc-800">0{idx + 1}</span>
                                        </div>
                                        <LinkedInPreview
                                            hookText={hookText.replace('►', '').trim()}
                                            userName={userName}
                                            userTagline={userHeadline}
                                            avatarUrl={avatarUrl}
                                            isRtl={hookIsRtl}
                                        />
                                    </div>

                                    {/* Right Panel: Metrics & Action */}
                                    <div className="lg:col-span-8 flex flex-col gap-4 justify-between h-full bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm hover:border-indigo-500/30 transition-colors">
                                        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                                                Angle: {hook.angle || 'Optimizing...'}
                                            </span>

                                            <button
                                                onClick={() => handleCopy(hookText, idx)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all active:scale-95 ${copiedIndex === idx ? 'bg-emerald-500 text-white' : 'bg-white text-zinc-900 hover:bg-zinc-200'}`}
                                            >
                                                {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                {copiedIndex === idx ? "Copied" : "Copy to LinkedIn"}
                                            </button>
                                        </div>

                                        <ViralGauge
                                            score={hook.viralityScore || 0}
                                            metrics={{
                                                stoppingPower: hook.metrics?.stoppingPower || 0,
                                                readability: hook.metrics?.readability || 0,
                                                dwellTime: hook.metrics?.dwellTime || 0,
                                                ctaEfficiency: hook.metrics?.ctaEfficiency || 0
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
