"use client";

import { motion } from "framer-motion";
import { ThumbsUp, MessageSquare, Repeat2, Send } from "lucide-react";
import Image from "next/image";

interface LinkedInPreviewProps {
    hookText: string;
    userName: string;
    userTagline: string;
    avatarUrl?: string;
    isRtl?: boolean;
}

export function LinkedInPreview({ hookText, userName, userTagline, avatarUrl, isRtl }: LinkedInPreviewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md mx-auto bg-white dark:bg-[#1b1f23] rounded-xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 ${isRtl ? 'dir-rtl' : 'dir-ltr'}`}
            dir={isRtl ? "rtl" : "ltr"}
        >
            {/* Header */}
            <div className="p-4 flex items-start gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex-shrink-0">
                    {avatarUrl ? (
                        <Image src={avatarUrl} alt={userName} width={48} height={48} className="object-cover w-full h-full" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold text-lg">
                            {userName.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-[15px] truncate">{userName}</h4>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs truncate">{userTagline}</p>
                    <div className="flex items-center text-zinc-500 dark:text-zinc-500 text-xs mt-0.5">
                        <span>1d</span>
                        <span className="mx-1">•</span>
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" className="opacity-70">
                            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 13a6 6 0 110-12 6 6 0 010 12z"></path>
                            <path d="M8 3v5.27l4.16 2.4.76-1.28-3.42-1.95V3z"></path>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="px-4 pb-2 text-[14px] leading-relaxed text-zinc-900 dark:text-zinc-200 whitespace-pre-wrap">
                {/* The Cutoff Logic Simulation. We show ~150 chars, then "...see more" */}
                {hookText.length > 150 ? (
                    <>
                        {hookText.substring(0, 150)}...
                        <span className="text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer block mt-1 hover:underline">
                            see more
                        </span>
                    </>
                ) : (
                    hookText
                )}
            </div>

            {/* Social Proof Stats */}
            <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                        <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center ring-1 ring-white dark:ring-black z-20"><ThumbsUp className="w-2.5 h-2.5 text-white" /></span>
                        <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center ring-1 ring-white dark:ring-black z-10"><span className="text-[10px] text-white">❤️</span></span>
                    </div>
                    <span className="ml-1">8,492</span>
                </div>
                <div>
                    1,204 comments • 342 reposts
                </div>
            </div>

            {/* Action Bar */}
            <div className="px-2 py-1 flex items-center justify-between">
                {[
                    { icon: ThumbsUp, label: "Like" },
                    { icon: MessageSquare, label: "Comment" },
                    { icon: Repeat2, label: "Repost" },
                    { icon: Send, label: "Send" }
                ].map((action, i) => (
                    <button key={i} className="flex flex-col sm:flex-row items-center justify-center gap-1 flex-1 py-3 px-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400 font-medium text-xs sm:text-sm">
                        <action.icon className="w-5 h-5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">{action.label}</span>
                    </button>
                ))}
            </div>
        </motion.div>
    );
}
