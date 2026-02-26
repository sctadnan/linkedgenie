"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export type Badge = {
    id: string;
    icon: string;
    title: string;
    description: string;
};

interface BadgeToastProps {
    badge: Badge | null;
    onDismiss: () => void;
}

export function BadgeToast({ badge, onDismiss }: BadgeToastProps) {
    useEffect(() => {
        if (!badge) return;
        const timer = setTimeout(() => onDismiss(), 4500);
        return () => clearTimeout(timer);
    }, [badge, onDismiss]);

    return (
        <AnimatePresence>
            {badge && (
                <motion.div
                    initial={{ opacity: 0, y: 80, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed bottom-6 right-6 z-[100] max-w-xs w-full"
                >
                    <div className="relative bg-[#111318] border border-indigo-500/40 rounded-2xl p-4 shadow-2xl shadow-indigo-500/20 overflow-hidden">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-pink-500/5 pointer-events-none" />

                        {/* Content */}
                        <div className="relative flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-pink-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl flex-shrink-0">
                                {badge.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Achievement Unlocked!</span>
                                </div>
                                <p className="text-sm font-bold text-white">{badge.title}</p>
                                <p className="text-xs text-zinc-400 mt-0.5">{badge.description}</p>
                            </div>
                            <button
                                onClick={onDismiss}
                                className="text-zinc-600 hover:text-zinc-400 transition-colors flex-shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Progress indicator */}
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: 4.5, ease: 'linear' }}
                            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-pink-500"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Badge definitions
export const BADGES: Record<string, Badge> = {
    HOOK_MASTER: {
        id: 'HOOK_MASTER',
        icon: '🪝',
        title: 'Hook Master',
        description: "You've generated 50 viral hooks. The algorithm bends to your will.",
    },
    ON_FIRE: {
        id: 'ON_FIRE',
        icon: '🔥',
        title: 'On Fire!',
        description: "7 days straight of creating content. Unstoppable.",
    },
    TREND_HUNTER: {
        id: 'TREND_HUNTER',
        icon: '🎯',
        title: 'Trend Hunter',
        description: "You've explored 25 live trends. You see the market before it moves.",
    },
    FIRST_HOOK: {
        id: 'FIRST_HOOK',
        icon: '✨',
        title: 'First Hook',
        description: "Your first viral hook is generated. The journey begins!",
    },
};

// Utility: check and award badges
export function checkBadges(
    hooksGenerated: number,
    streak: number,
    currentBadges: string[],
): string | null {
    if (hooksGenerated === 1 && !currentBadges.includes('FIRST_HOOK')) return 'FIRST_HOOK';
    if (hooksGenerated >= 50 && !currentBadges.includes('HOOK_MASTER')) return 'HOOK_MASTER';
    if (streak >= 7 && !currentBadges.includes('ON_FIRE')) return 'ON_FIRE';
    return null;
}
