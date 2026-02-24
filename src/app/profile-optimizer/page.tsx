"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Loader2, UserCheck, AlertCircle, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileOptimizer() {
    const [profileData, setProfileData] = useState({
        headline: "",
        about: "",
        experience: ""
    });

    const { completion, complete, isLoading, error } = useCompletion({
        api: "/api/optimize-profile",
        streamProtocol: "text",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (profileData.headline) {
            complete(JSON.stringify(profileData));
        }
    };

    const hasResult = completion.length > 0;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center pt-32 pb-20 px-6 relative overflow-hidden">

            {/* Background gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px]" />
            </div>

            <div className="max-w-4xl w-full flex flex-col items-center text-center mb-12 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-emerald-400 text-sm font-medium mb-6">
                    <UserCheck className="w-4 h-4" />
                    AI Profile Grader
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                    Turn Your Profile Into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Lead Magnet</span>
                </h1>
                <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                    Paste your current LinkedIn Headline and About section. Our AI will analyze it against top 1% profiles and give you actionable rewrites.
                </p>
            </div>

            <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8">

                {/* Left Side: Input Form */}
                <div className="flex-1 glass p-6 md:p-8 rounded-2xl relative z-10 flex flex-col">
                    <h2 className="text-xl font-semibold border-b border-white/10 pb-4 mb-6">Your Current Profile</h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-zinc-300">Headline (Required)</label>
                            <input
                                type="text"
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
                                placeholder="E.g., Software Engineer at Tech Corp..."
                                value={profileData.headline}
                                onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm font-medium text-zinc-300">About / Summary</label>
                            <textarea
                                className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors resize-none"
                                placeholder="Paste your LinkedIn About section here..."
                                value={profileData.about}
                                onChange={(e) => setProfileData({ ...profileData, about: e.target.value })}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="font-medium">{error.message || "Failed to analyze profile."}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !profileData.headline}
                            className="mt-auto bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white font-semibold rounded-xl px-8 py-4 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analyzing Profile Info...
                                </>
                            ) : (
                                <>
                                    <UserCheck className="w-5 h-5" />
                                    Roast & Optimize My Profile
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Right Side: AI Output */}
                <div className="flex-1 glass relative z-10 rounded-2xl overflow-hidden flex flex-col min-h-[500px]">

                    <div className="p-6 md:p-8 border-b border-light/10 bg-black/20 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <SparklesIcon className="w-4 h-4" />
                        </div>
                        <h2 className="text-xl font-semibold">AI Analysis & Rewrites</h2>
                    </div>

                    <div className="p-6 md:p-8 flex-1 overflow-y-auto h-full">
                        {!hasResult && !isLoading && (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center p-8">
                                <div className="w-16 h-16 rounded-full glass mb-4 flex items-center justify-center">
                                    <UserCheck className="w-8 h-8 opacity-50" />
                                </div>
                                <p>Provide your current headline and summary to receive actionable tips and rewritten sections.</p>
                            </div>
                        )}

                        {isLoading && !hasResult && (
                            <div className="animate-pulse flex flex-col gap-6">
                                <div className="h-4 bg-white/5 rounded w-1/3 mb-2"></div>
                                <div className="h-6 bg-white/5 rounded w-full"></div>
                                <div className="h-6 bg-white/5 rounded w-full"></div>
                                <div className="h-6 bg-white/5 rounded w-3/4"></div>

                                <div className="h-4 bg-white/5 rounded w-1/4 mt-8 mb-2"></div>
                                <div className="h-6 bg-white/5 rounded w-full"></div>
                                <div className="h-6 bg-white/5 rounded w-full"></div>
                                <div className="h-6 bg-white/5 rounded w-5/6"></div>
                            </div>
                        )}

                        <AnimatePresence>
                            {hasResult && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="prose prose-invert prose-emerald max-w-none text-zinc-300"
                                >
                                    {/* We are parsing simple markdown-like text from the AI stream */}
                                    <div className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed break-words">
                                        {completion}
                                        {isLoading && (
                                            <span className="inline-block w-2 h-4 ml-1 bg-emerald-500 animate-pulse"></span>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>

        </div>
    );
}

function SparklesIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
        </svg>
    );
}
