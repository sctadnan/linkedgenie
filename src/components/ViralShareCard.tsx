"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Zap } from "lucide-react";
import { useState } from "react";

interface ViralShareCardProps {
    isOpen: boolean;
    onClose: () => void;
    score: number;
    hookPreview: string;
    hookScore?: number;
}

export function ViralShareCard({ isOpen, onClose, score, hookPreview }: ViralShareCardProps) {
    const [copied, setCopied] = useState(false);

    const scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
    const scoreLabel = score >= 80 ? 'Viral Ready 🔥' : score >= 60 ? 'Strong Post 💪' : 'Needs Work 🛠️';

    const handleCopy = () => {
        const shareText = `📊 My LinkedIn post scored ${score}/100 on LinkedGenie!\n\n"${hookPreview.slice(0, 100)}${hookPreview.length > 100 ? '...' : ''}"\n\n🚀 Create yours at linkedgenie.com`;
        navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-sm w-full"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute -top-3 -right-3 w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Card */}
                        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#0d0f1a]">
                            {/* Gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/15 via-transparent to-pink-600/10 pointer-events-none" />
                            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

                            <div className="relative p-6">
                                {/* Header */}
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="text-xl">🧞</span>
                                    <span className="text-sm font-bold text-white">LinkedGenie</span>
                                    <span className="ml-auto text-[10px] text-zinc-500 uppercase tracking-widest">Viral Score</span>
                                </div>

                                {/* Big Score */}
                                <div className="text-center mb-6">
                                    <div className="relative inline-block">
                                        <svg viewBox="0 0 120 120" className="w-32 h-32">
                                            {/* Background track */}
                                            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                            {/* Score arc */}
                                            <motion.circle
                                                cx="60" cy="60" r="50"
                                                fill="none"
                                                stroke={scoreColor}
                                                strokeWidth="8"
                                                strokeDasharray={`${2 * Math.PI * 50}`}
                                                strokeDashoffset={`${2 * Math.PI * 50 * (1 - score / 100)}`}
                                                strokeLinecap="round"
                                                transform="rotate(-90 60 60)"
                                                initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                                                animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - score / 100) }}
                                                transition={{ duration: 1.2, ease: 'easeOut' }}
                                                style={{ filter: `drop-shadow(0 0 8px ${scoreColor}60)` }}
                                            />
                                            <text x="60" y="55" textAnchor="middle" className="text-3xl font-black" fill="white" fontSize="26" fontWeight="900">
                                                {score}
                                            </text>
                                            <text x="60" y="72" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11">
                                                / 100
                                            </text>
                                        </svg>
                                    </div>
                                    <p className="text-sm font-bold mt-1" style={{ color: scoreColor }}>{scoreLabel}</p>
                                </div>

                                {/* Hook preview */}
                                <div className="bg-white/[0.04] rounded-2xl p-4 mb-5 border border-white/8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="w-3.5 h-3.5 text-indigo-400" />
                                        <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400">Hook Preview</span>
                                    </div>
                                    <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3" dir="auto">
                                        {hookPreview}
                                    </p>
                                </div>

                                {/* Footer */}
                                <p className="text-center text-[10px] text-zinc-600 mb-4">linkedgenie.com · AI LinkedIn Content Suite</p>

                                {/* Copy CTA */}
                                <button
                                    onClick={handleCopy}
                                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-zinc-900 hover:bg-zinc-100'}`}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied to clipboard!' : 'Copy & Share'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
