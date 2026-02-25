"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";

interface ViralGaugeProps {
    score: number;
    metrics: {
        stoppingPower: number;
        readability: number;
        dwellTime: number;
        ctaEfficiency: number;
    };
}

export function ViralGauge({ score, metrics }: ViralGaugeProps) {
    const getColor = (s: number) => {
        if (s >= 90) return "text-emerald-500";
        if (s >= 75) return "text-yellow-500";
        return "text-red-500";
    };

    const getBgColor = (s: number) => {
        if (s >= 90) return "bg-emerald-500";
        if (s >= 75) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-6 glass p-4 rounded-xl w-full">
            {/* Main Score Gauge */}
            <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-zinc-800"
                    />
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="251.2"
                        initial={{ strokeDashoffset: 251.2 }}
                        animate={{ strokeDashoffset: 251.2 - (251.2 * score) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={getColor(score)}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-bold ${getColor(score)}`}>{score}</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Score</span>
                </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="flex-1 w-full grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Stopping Power", value: metrics.stoppingPower },
                    { label: "Readability", value: metrics.readability },
                    { label: "Dwell Time", value: metrics.dwellTime },
                    { label: "CTA Efficiency", value: metrics.ctaEfficiency },
                ].map((m, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                            <span className="flex items-center gap-1">
                                {m.label}
                                <Info className="w-3 h-3 cursor-help opacity-50" />
                            </span>
                            <span className="font-semibold">{m.value}/100</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${m.value}%` }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                className={`h-full rounded-full ${getBgColor(m.value)}`}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
}
