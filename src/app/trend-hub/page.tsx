"use client";

import { useState, useEffect } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Loader2, TrendingUp, Search, Hash, Copy, Send, ArrowRight, Rss, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { fetchLiveTrends, TrendItem } from "@/actions/fetch-trends";

export default function TrendHubPage() {
    const [topic, setTopic] = useState("");
    const [input, setInput] = useState(""); // This will hold the user's direct input or selected trend title
    const [liveTrends, setLiveTrends] = useState<TrendItem[]>([]);
    const [isLoadingTrends, setIsLoadingTrends] = useState(true);
    const [isSaving, setIsSaving] = useState(false); // Added as per instruction, though not used in provided diff
    const [sessionToken, setSessionToken] = useState("");

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setSessionToken(session.access_token);
        });
    }, []);

    useEffect(() => {
        const loadTrends = async () => {
            try {
                const trends = await fetchLiveTrends();
                setLiveTrends(trends);
            } catch (err) {
                console.error("Failed to load live trends", err);
            } finally {
                setIsLoadingTrends(false);
            }
        };
        loadTrends();
    }, []);

    const { completion, complete, isLoading, error } = useCompletion({
        api: "/api/trend-analysis",
        streamProtocol: "text",
        headers: {
            "Content-Type": "application/json",
            ...(sessionToken ? { "Authorization": `Bearer ${sessionToken}` } : {})
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input || topic) {
            complete(input || topic); // Use input if available, otherwise use topic
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const hasResult = completion.length > 0;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center pt-32 pb-20 px-6 relative overflow-hidden">

            {/* Background gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute bottom-[20%] left-[20%] w-[30%] h-[40%] rounded-full bg-orange-600/10 blur-[120px]" />
                <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] rounded-full bg-red-600/10 blur-[120px]" />
            </div>

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
                            placeholder="Paste a live trend URL or keyword (e.g., GPT-5 release)..."
                            className="flex-1 bg-zinc-900 border border-white/10 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all placeholder:text-zinc-600 shadow-xl"
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
                        </div>
                    )}

                    {isLoading && !hasResult && (
                        <div className="absolute inset-0 glass rounded-2xl p-8 flex flex-col gap-6">
                            <div className="h-6 bg-white/5 rounded w-1/3 animate-pulse"></div>
                            <div className="h-20 bg-white/5 rounded w-full animate-pulse"></div>
                            <div className="h-20 bg-white/5 rounded w-full animate-pulse"></div>
                            <div className="h-20 bg-white/5 rounded w-full animate-pulse"></div>
                        </div>
                    )}

                    <AnimatePresence>
                        {hasResult && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass rounded-2xl p-8 relative z-10"
                            >
                                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Current Viral Concepts</h2>
                                        <p className="text-zinc-400 text-sm">For "{topic || input}"</p>
                                    </div>
                                </div>

                                <div className="prose prose-invert prose-orange max-w-none">
                                    <div className="whitespace-pre-wrap font-sans text-[16px] leading-relaxed text-zinc-200">
                                        {completion}
                                        {isLoading && (
                                            <span className="inline-block w-2 h-4 ml-1 bg-orange-500 animate-pulse"></span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}
