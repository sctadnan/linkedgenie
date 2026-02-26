"use client";

import { useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Loader2, Wand2, Copy, Check, ChevronRight, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ViralGauge } from "@/components/ViralGauge";
import { LinkedInPreview } from "@/components/LinkedInPreview";
import { z } from "zod";
import { useRouter } from "next/navigation";

const hookSchema = z.object({
    hooks: z.array(z.object({
        text: z.string(),
        angle: z.string(),
        viralityScore: z.number(),
        metrics: z.object({
            stoppingPower: z.number(),
            readability: z.number(),
            dwellTime: z.number(),
            ctaEfficiency: z.number(),
        }),
    })),
});

export type TrendContext = {
    topic: string;
    sentiment: 'positive' | 'negative' | 'mixed';
    momentum: number;
    unexploredAngles: string[];
};

interface HookLabProps {
    trendContext: TrendContext | null;
    sessionToken: string;
    userName: string;
    avatarUrl: string;
    onXpGain?: (amount: number) => void;
    onHookGenerated?: () => void;
}

export function HookLab({ trendContext, sessionToken, userName, avatarUrl, onXpGain, onHookGenerated }: HookLabProps) {
    const router = useRouter();
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [launched, setLaunched] = useState<number | null>(null);

    const { object, submit, isLoading, error } = useObject({
        api: "/api/generate-hook",
        schema: hookSchema,
        headers: {
            "Content-Type": "application/json",
            ...(sessionToken ? { "Authorization": `Bearer ${sessionToken}` } : {}),
        },
    });

    const handleGenerate = () => {
        if (!trendContext) return;
        submit({
            prompt: trendContext.topic,
            trendContext,
        });
        onHookGenerated?.();
    };

    const handleCopy = (text: string, index: number) => {
        const isArabic = /[\u0600-\u06FF]/.test(text);
        const rtlPrefix = isArabic ? "\u200F" : "";
        navigator.clipboard.writeText(rtlPrefix + text.replace('►', '').trim());
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
        onXpGain?.(10);
    };

    const handleUseHook = (hookText: string, index: number) => {
        if (!trendContext) return;
        setLaunched(index);
        // Save context to sessionStorage for post-generator
        const context = {
            hook: hookText.replace('►', '').trim(),
            topic: trendContext.topic,
            sentiment: trendContext.sentiment,
            angles: trendContext.unexploredAngles,
        };
        sessionStorage.setItem('genie_hook_context', JSON.stringify(context));

        // Short delay for the animation, then navigate
        setTimeout(() => {
            router.push('/post-generator');
        }, 600);
        onXpGain?.(25);
    };

    if (!trendContext) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                    <Wand2 className="w-7 h-7 text-indigo-400/50" />
                </div>
                <h3 className="text-zinc-400 font-medium mb-2">Hook Lab</h3>
                <p className="text-zinc-600 text-sm max-w-xs">
                    Select a trend from the left to instantly generate 5 scroll-stopping hooks optimized for that topic.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/8">
                <div>
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <Wand2 className="w-4 h-4 text-indigo-400" />
                        Hook Lab
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                        Topic: {trendContext.topic}
                    </p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all active:scale-95"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    {isLoading ? 'Generating...' : 'Generate Hooks'}
                </button>
            </div>

            {/* Loading State — pulsing glow instead of spinner */}
            <AnimatePresence>
                {isLoading && !object?.hooks?.length && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12 gap-4"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 rounded-2xl bg-indigo-500/30 blur-xl animate-pulse" />
                            <div className="relative w-14 h-14 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 flex items-center justify-center">
                                <Wand2 className="w-6 h-6 text-indigo-400" />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-indigo-300 animate-pulse">Running Viral Algorithm...</p>
                            <p className="text-xs text-zinc-500 mt-1">Analyzing {trendContext.sentiment} sentiment trends</p>
                        </div>
                        {/* Skeleton rows */}
                        <div className="w-full space-y-3 mt-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error */}
            {error && !isLoading && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{error.message === 'GUEST_LIMIT_REACHED' ? 'Sign in for more free generations.' : error.message || 'Failed to generate hooks.'}</p>
                </div>
            )}

            {/* Hook Results */}
            <AnimatePresence>
                {object?.hooks && object.hooks.length > 0 && (
                    <motion.div className="flex flex-col gap-5 overflow-y-auto pr-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {object.hooks.map((hook, idx) => {
                            if (!hook?.text || !hook?.metrics) return null;
                            const hookText = hook.text;
                            const isRtl = /[\u0600-\u06FF]/.test(hookText);
                            const isLaunching = launched === idx;

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`rounded-2xl border bg-white/[0.03] p-4 transition-all duration-300 ${isLaunching ? 'scale-105 border-indigo-500/60 shadow-xl shadow-indigo-500/20' : 'border-white/8 hover:border-white/15'}`}
                                >
                                    {/* Angle badge + actions */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                                            {hook.angle || 'Optimizing...'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleCopy(hookText, idx)}
                                                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all active:scale-95 ${copiedIndex === idx ? 'bg-emerald-500 text-white' : 'bg-white/8 hover:bg-white/15 text-zinc-300'}`}
                                            >
                                                {copiedIndex === idx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                {copiedIndex === idx ? 'Copied!' : 'Copy'}
                                            </button>
                                            <button
                                                onClick={() => handleUseHook(hookText, idx)}
                                                disabled={isLaunching}
                                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all active:scale-95 disabled:opacity-70"
                                            >
                                                {isLaunching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                {isLaunching ? 'Launching...' : 'Use Hook'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Hook preview */}
                                    <LinkedInPreview
                                        hookText={hookText.replace('►', '').trim()}
                                        userName={userName}
                                        userTagline="Content Creator | Growth Expert"
                                        avatarUrl={avatarUrl}
                                        isRtl={isRtl}
                                    />

                                    {/* Viral Gauge */}
                                    <div className="mt-3">
                                        <ViralGauge
                                            score={hook.viralityScore || 0}
                                            metrics={{
                                                stoppingPower: hook.metrics?.stoppingPower || 0,
                                                readability: hook.metrics?.readability || 0,
                                                dwellTime: hook.metrics?.dwellTime || 0,
                                                ctaEfficiency: hook.metrics?.ctaEfficiency || 0,
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty state when trendContext is set but not generated yet */}
            {!isLoading && !error && (!object?.hooks || object.hooks.length === 0) && trendContext && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-zinc-500 text-sm mb-4">Ready to generate hooks for:</p>
                    <p className="text-zinc-300 text-sm font-medium italic max-w-xs mb-6">"{trendContext.topic}"</p>
                    <button
                        onClick={handleGenerate}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                    >
                        <Wand2 className="w-4 h-4" />
                        Generate 5 Viral Hooks →
                    </button>
                </div>
            )}
        </div>
    );
}
