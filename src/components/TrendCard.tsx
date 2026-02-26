"use client";

import { motion } from "framer-motion";
import { TrendingUp, ChevronRight } from "lucide-react";

export type EnrichedTrend = {
    id: number;
    topic: string;
    category: string;
    sentiment: 'positive' | 'negative' | 'mixed';
    momentum: number;
    unexploredAngles: string[];
};

interface TrendCardProps {
    trend: EnrichedTrend;
    isSelected: boolean;
    onSelect: (trend: EnrichedTrend) => void;
    index: number;
}

const SENTIMENT_CONFIG = {
    positive: { dot: 'bg-emerald-400', label: 'Positive', badge: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    negative: { dot: 'bg-rose-400', label: 'High Tension', badge: 'text-rose-400 bg-rose-400/10 border-rose-400/20' },
    mixed: { dot: 'bg-amber-400', label: 'Mixed', badge: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
};

const MOMENTUM_COLOR = (m: number) =>
    m >= 80 ? 'bg-gradient-to-r from-indigo-500 to-pink-500' :
        m >= 60 ? 'bg-gradient-to-r from-indigo-500 to-purple-500' :
            'bg-gradient-to-r from-zinc-500 to-zinc-400';

export function TrendCard({ trend, isSelected, onSelect, index }: TrendCardProps) {
    const sentiment = SENTIMENT_CONFIG[trend.sentiment];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            onClick={() => onSelect(trend)}
            className={`relative cursor-pointer rounded-2xl border p-4 transition-all duration-300 group ${isSelected
                ? 'border-indigo-500/60 bg-indigo-500/10 shadow-lg shadow-indigo-500/10 scale-[1.02]'
                : 'border-white/8 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                }`}
        >
            {/* Top row: category + sentiment */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{trend.category}</span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${sentiment.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sentiment.dot} animate-pulse`} />
                    {sentiment.label}
                </span>
            </div>

            {/* Topic */}
            <p className={`text-sm font-medium leading-snug mb-3 transition-colors ${isSelected ? 'text-white' : 'text-zinc-200 group-hover:text-white'}`}>
                {trend.topic}
            </p>

            {/* Momentum bar */}
            <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Momentum
                    </span>
                    <span className={`text-[10px] font-bold ${trend.momentum >= 80 ? 'text-pink-400' : trend.momentum >= 60 ? 'text-indigo-400' : 'text-zinc-400'}`}>
                        {trend.momentum}%
                    </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${trend.momentum}%` }}
                        transition={{ delay: index * 0.08 + 0.3, duration: 0.6 }}
                        className={`h-full rounded-full ${MOMENTUM_COLOR(trend.momentum)}`}
                    />
                </div>
            </div>

            {/* Unexplored angles */}
            <div className="flex flex-wrap gap-1.5">
                {trend.unexploredAngles.slice(0, 2).map((angle, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/5">
                        {angle}
                    </span>
                ))}
            </div>

            {/* Select indicator */}
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-zinc-400'}`} />
            </div>

            {/* Glow border on selected */}
            {isSelected && (
                <div className="absolute inset-0 rounded-2xl border border-indigo-500/40 pointer-events-none" />
            )}
        </motion.div>
    );
}
