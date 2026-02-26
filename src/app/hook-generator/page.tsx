"use client";

<<<<<<< Updated upstream
import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Loader2, Wand2, Copy, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
=======
import { useState, useEffect } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Loader2, Wand2, Copy, AlertCircle, Sparkles, TrendingUp, ChevronRight, Check, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { LinkedInPreview } from "@/components/LinkedInPreview";
import { ViralGauge } from "@/components/ViralGauge";
import { BadgeToast, Badge, BADGES, checkBadges } from "@/components/BadgeToast";
import { useRouter } from "next/navigation";
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
>>>>>>> Stashed changes

function getLocalInt(key: string, fallback = 0) {
    if (typeof window === 'undefined') return fallback;
    const v = localStorage.getItem(key);
    return v ? parseInt(v, 10) : fallback;
}

function calcStreak(): { streak: number; updated: boolean } {
    if (typeof window === 'undefined') return { streak: 0, updated: false };
    const today = new Date().toDateString();
    const lastActive = localStorage.getItem('genie_last_active');
    const streak = getLocalInt('genie_streak', 0);

    if (lastActive === today) return { streak, updated: false };

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = lastActive === yesterday.toDateString();

    const newStreak = isConsecutive ? streak + 1 : 1;
    localStorage.setItem('genie_streak', newStreak.toString());
    localStorage.setItem('genie_last_active', today);
    return { streak: newStreak, updated: true };
}

export default function HookGenerator() {
    const router = useRouter();
    const [sessionToken, setSessionToken] = useState("");
<<<<<<< Updated upstream

    useEffect(() => {
=======
    const [userName, setUserName] = useState("Genie User");
    const userHeadline = "Content Creator | Growth Expert";
    const [avatarUrl, setAvatarUrl] = useState("");
    const [xp, setXp] = useState(0);
    const [streak, setStreak] = useState(0);
    const [trends, setTrends] = useState<{ id: number, topic: string, category: string }[]>([]);
    const [topicInput, setTopicInput] = useState("");
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [launched, setLaunched] = useState<number | null>(null);
    const [activeBadge, setActiveBadge] = useState<Badge | null>(null);
    const [hooksGeneratedCount, setHooksGeneratedCount] = useState(0);

    useEffect(() => {
        setXp(getLocalInt('genie_xp'));
        setHooksGeneratedCount(getLocalInt('genie_hooks_count'));
        const { streak: s } = calcStreak();
        setStreak(s);

>>>>>>> Stashed changes
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setSessionToken(session.access_token);
        });
<<<<<<< Updated upstream
=======

        fetch('/api/trends-mock')
            .then(r => r.json())
            .then(d => { if (d.trends) setTrends(d.trends); })
            .catch(() => null);
>>>>>>> Stashed changes
    }, []);

    const { completion, input, handleInputChange, handleSubmit, isLoading, error } = useCompletion({
        api: "/api/generate-hook",
        streamProtocol: "text",
        headers: {
            "Content-Type": "application/json",
            ...(sessionToken ? { "Authorization": `Bearer ${sessionToken}` } : {}),
        },
    });

<<<<<<< Updated upstream
    const generatedHooks = completion.split('\n').filter(h => h.trim().length > 0);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center pt-32 pb-20 px-6 relative overflow-hidden">

            {/* Background gradients */}
=======
    const level = Math.floor(xp / 100) + 1;
    const progress = xp % 100;

    const gainXp = (amount: number) => {
        const newXp = xp + amount;
        setXp(newXp);
        localStorage.setItem("genie_xp", newXp.toString());
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!topicInput.trim()) return;
        submit({ prompt: topicInput });

        // Track hook generation count
        const newCount = hooksGeneratedCount + 1;
        setHooksGeneratedCount(newCount);
        localStorage.setItem('genie_hooks_count', newCount.toString());

        // Check for badge unlocks
        const currentBadges = JSON.parse(localStorage.getItem('genie_badges') || '[]');
        const newBadge = checkBadges(newCount, streak, currentBadges);
        if (newBadge && BADGES[newBadge]) {
            setActiveBadge(BADGES[newBadge]);
            localStorage.setItem('genie_badges', JSON.stringify([...currentBadges, newBadge]));
        }
    };

    const handleCopy = (text: string, index: number) => {
        const isArabic = /[\u0600-\u06FF]/.test(text);
        const rtlPrefix = isArabic ? "\u200F" : "";
        navigator.clipboard.writeText(rtlPrefix + text.replace('►', '').trim());
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
        gainXp(10);
    };

    const handleUseHook = (hookText: string, index: number) => {
        setLaunched(index);
        const context = {
            hook: hookText.replace('►', '').trim(),
            topic: topicInput,
            sentiment: 'mixed',
            angles: [],
        };
        sessionStorage.setItem('genie_hook_context', JSON.stringify(context));
        gainXp(15);
        setTimeout(() => router.push('/post-generator'), 600);
    };

    const isInputRtl = /[\u0600-\u06FF]/.test(topicInput);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center pt-28 pb-20 px-4 md:px-6 relative overflow-hidden">
            {/* Background */}
>>>>>>> Stashed changes
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-[30%] h-[40%] rounded-full bg-pink-600/10 blur-[120px]" />
                <div className="absolute top-[30%] right-[20%] w-[30%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
            </div>

<<<<<<< Updated upstream
            <div className="max-w-3xl w-full text-center mb-12 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-pink-400 text-sm font-medium mb-6">
                    <Wand2 className="w-4 h-4" />
                    Free Lead Magnet Tool
=======
            {/* Badge Toast */}
            <BadgeToast badge={activeBadge} onDismiss={() => setActiveBadge(null)} />

            {/* Gamification Header */}
            <div className="w-full max-w-4xl flex justify-end mb-8 animate-fade-in">
                <div className="glass px-4 py-2 rounded-xl flex items-center gap-4">
                    {/* Streak */}
                    {streak > 0 && (
                        <div className="flex items-center gap-1.5 text-orange-400 border-r border-white/10 pr-4">
                            <Flame className="w-4 h-4" />
                            <span className="text-sm font-bold">{streak}</span>
                            <span className="text-xs text-zinc-500">day streak</span>
                        </div>
                    )}
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
>>>>>>> Stashed changes
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                    Viral <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">Hook Generator</span>
                </h1>
<<<<<<< Updated upstream
                <p className="text-lg text-zinc-400 max-w-xl mx-auto">
                    The first line of your LinkedIn post decides if they stop scrolling or keep swiping. Generate 5 irresistible hooks in seconds.
=======
                <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 font-light">
                    Drop a topic and let our AI predict, score, and optimize your opening hooks to beat the LinkedIn algorithm.
>>>>>>> Stashed changes
                </p>
            </div>

<<<<<<< Updated upstream
            <div className="w-full max-w-2xl">
                <form onSubmit={handleSubmit} className="glass rounded-2xl p-2 flex flex-col sm:flex-row gap-2 relative z-10">
=======
            {/* Form */}
            <div className="w-full max-w-3xl mb-16">
                <form onSubmit={handleSubmit} className="glass rounded-2xl p-2 flex flex-col sm:flex-row gap-2 relative z-10 shadow-2xl shadow-indigo-900/10">
>>>>>>> Stashed changes
                    <input
                        type="text"
                        className="flex-1 w-full bg-transparent border-none px-4 md:px-6 py-4 text-zinc-200 outline-none placeholder:text-zinc-500 text-sm md:text-base text-ellipsis"
                        placeholder="What is your post about? (e.g. Remote work vs Office)"
                        value={input}
                        onChange={handleInputChange}
                        required
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-semibold rounded-xl px-8 py-4 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
                    >
<<<<<<< Updated upstream
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate Hooks"}
                    </button>
                </form>

                {error && (
=======
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>Generate Virality <ChevronRight className="w-5 h-5" /></>
                        )}
                    </button>
                </form>

                {error?.message === "GUEST_LIMIT_REACHED" ? (
                    <div className="mt-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 p-4 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 text-indigo-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-indigo-200 mb-1">لقد استنفدت محاولتك المجانية 🎉</p>
                            <p className="text-sm text-indigo-300/80">سجّل الدخول للحصول على <strong>5 محاولات إضافية</strong> مجاناً.</p>
                            <a href="/" className="mt-3 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                                تسجيل الدخول مجاناً →
                            </a>
                        </div>
                    </div>
                ) : error && (
>>>>>>> Stashed changes
                    <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error.message || "Failed to generate hooks."}</p>
                    </div>
                )}

                <AnimatePresence>
                    {generatedHooks.length > 0 && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-12 flex flex-col gap-4"
                        >
                            <h3 className="text-xl font-semibold mb-2">Your Scroll-Stopping Hooks:</h3>
                            {generatedHooks.map((hook, idx) => (
                                <div key={idx} className="glass p-4 md:p-5 rounded-xl group flex items-start justify-between gap-4 hover:border-pink-500/30 transition-colors break-words overflow-hidden">
                                    <p className="text-zinc-200 leading-relaxed font-medium text-sm md:text-base break-words">{hook.replace('►', '').trim()}</p>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(hook.replace('►', '').trim())}
                                        className="text-zinc-500 hover:text-white transition-colors p-2 glass rounded-lg opacity-0 group-hover:opacity-100 flex-shrink-0"
                                        title="Copy to clipboard"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {isLoading && (
                    <div className="mt-12 flex flex-col gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="glass p-5 rounded-xl animate-pulse flex flex-col gap-2">
                                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                                <div className="h-4 bg-white/5 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

<<<<<<< Updated upstream
=======
            {/* Loading */}
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
                                {[0, 150, 300].map(delay => (
                                    <span key={delay} className="w-2 h-2 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
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
                            const isLaunching = launched === idx;

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
                                        <LinkedInPreview
                                            hookText={hookText.replace('►', '').trim()}
                                            userName={userName}
                                            userTagline={userHeadline}
                                            avatarUrl={avatarUrl}
                                            isRtl={hookIsRtl}
                                        />
                                    </div>

                                    {/* Right Panel: Metrics & Actions */}
                                    <div className={`lg:col-span-8 flex flex-col gap-4 justify-between h-full bg-zinc-900/40 border rounded-2xl p-6 backdrop-blur-sm transition-all ${isLaunching ? 'border-indigo-500/50 shadow-xl shadow-indigo-500/10 scale-[1.01]' : 'border-zinc-800/50 hover:border-indigo-500/30'}`}>
                                        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                                                Angle: {hook.angle || 'Optimizing...'}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleCopy(hookText, idx)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all active:scale-95 ${copiedIndex === idx ? 'bg-emerald-500 text-white' : 'bg-white/8 hover:bg-white/15 text-zinc-300'}`}
                                                >
                                                    {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    {copiedIndex === idx ? "Copied" : "Copy"}
                                                </button>
                                                <button
                                                    onClick={() => handleUseHook(hookText, idx)}
                                                    disabled={isLaunching}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition-all active:scale-95 disabled:opacity-70"
                                                >
                                                    {isLaunching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                                                    {isLaunching ? "Launching..." : "Use Hook →"}
                                                </button>
                                            </div>
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
>>>>>>> Stashed changes
        </div>
    );
}
