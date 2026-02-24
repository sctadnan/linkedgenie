"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Loader2, Sparkles, Send, Copy, ThumbsUp, MessageSquare, Repeat2, BookmarkPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function PostGenerator() {
    const [tone, setTone] = useState("Professional");
    const [format, setFormat] = useState("Listicle");
    const [isSaving, setIsSaving] = useState(false);
    const [savedMessage, setSavedMessage] = useState("");

    const handleSave = async () => {
        if (!completion) return;
        setIsSaving(true);
        setSavedMessage("");

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setSavedMessage("Please sign in first!");
                return;
            }

            const { error } = await supabase
                .from('drafts')
                .insert([
                    { user_id: session.user.id, content: completion, tone, format, prompt: input }
                ]);

            if (error) throw error;
            setSavedMessage("Saved to Drafts!");
        } catch (err: any) {
            setSavedMessage(err.message || "Failed to save");
        } finally {
            setIsSaving(false);
            setTimeout(() => setSavedMessage(""), 3000);
        }
    };

    const { completion, input, handleInputChange, handleSubmit, isLoading, error } = useCompletion({
        api: "/api/generate",
        headers: {
            "Content-Type": "application/json"
        },
        body: {
            tone,
            format,
        },
        onError: (err) => {
            console.error("useCompletion failed:", err);
        },
        onFinish: (prompt, completion) => {
            console.log("Generation finished successfully.");
        }
    });

    const isGenerating = isLoading;
    const hasResult = completion.length > 0;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden absolute inset-0">

            {/* Left Panel - Controls */}
            <div className="w-full md:w-5/12 border-r border-white/10 glass p-6 md:p-8 flex flex-col h-full overflow-y-auto">
                <div className="mb-8 flex items-center gap-3 animate-fade-in-up">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Post Generator</h1>
                        <p className="text-zinc-400 text-sm">Craft viral content in seconds</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6 relative">

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-zinc-300">What do you want to write about?</label>
                        <textarea
                            className="w-full h-32 md:h-48 bg-black/40 border border-white/10 rounded-xl p-4 text-zinc-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none resize-none transition-all placeholder:text-zinc-600"
                            placeholder="E.g., 5 lessons I learned from failing my first startup..."
                            value={input}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-zinc-300">Tone</label>
                            <select
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-zinc-200 appearance-none outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                                <option>Professional</option>
                                <option>Conversational</option>
                                <option>Bold & Direct</option>
                                <option>Humorous</option>
                                <option>Inspirational</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-zinc-300">Format</label>
                            <select
                                value={format}
                                onChange={(e) => setFormat(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-zinc-200 appearance-none outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                                <option>Storytelling</option>
                                <option>Listicle</option>
                                <option>PAS (Problem, Agitate, Solve)</option>
                                <option>Unpopular Opinion</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                            <p className="font-bold">Error Generation Failed:</p>
                            <p>{error.message}</p>
                            <p className="text-xs mt-1 text-red-400/70">Console log has more details. The backend might have rejected the format.</p>
                        </div>
                    )}

                    <div className="mt-auto pt-6 pb-20 md:pb-0">
                        <button
                            type="submit"
                            disabled={isGenerating || !input}
                            className="w-full py-4 px-6 rounded-xl font-semibold text-white relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating Magic...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Generate Post
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Right Panel - Live Preview */}
            <div className="w-full md:w-7/12 flex flex-col h-[50vh] md:h-full overflow-y-auto relative hidden md:flex items-center justify-start pt-16 pb-32">
                {/* Background mesh */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-lg glass rounded-xl shadow-2xl z-10 overflow-hidden text-zinc-100"
                >
                    {/* LinkedIn Header Mockup */}
                    <div className="p-4 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 border-2 border-white dark:border-[#18181B]" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-[15px]">Alex Anderson</h3>
                                <span className="text-zinc-500 text-xs mt-0.5">• 1st</span>
                            </div>
                            <p className="text-zinc-500 text-xs truncate max-w-[280px]">Building the future of AI tools | Helping 10k+ creators</p>
                            <div className="flex items-center gap-1 mt-0.5 text-zinc-500 text-xs">
                                <span>Just now</span> •
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-500"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                            </div>
                        </div>
                        <button className="text-blue-600 dark:text-blue-400 font-semibold text-sm flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                            Follow
                        </button>
                    </div>

                    {/* LinkedIn Body Mockup */}
                    <div className="px-4 pb-2 text-[14px] leading-relaxed relative min-h-[150px]">
                        {!hasResult && !isGenerating && (
                            <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm p-4 text-center">
                                Your viral post will appear here...
                            </div>
                        )}

                        <div className="whitespace-pre-wrap font-sans break-words mb-2">
                            {completion}
                            {isGenerating && (
                                <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse"></span>
                            )}
                        </div>

                        {hasResult && !isGenerating && completion.length > 200 && (
                            <button className="text-zinc-500 hover:text-zinc-400 font-semibold cursor-pointer">
                                ...see more
                            </button>
                        )}
                    </div>

                    {/* LinkedIn Footer Mockup */}
                    <div className="px-4 py-2 border-t border-zinc-200 dark:border-white/10 flex justify-between">
                        <button className="flex items-center gap-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 px-3 py-2 rounded-lg transition-colors font-medium text-[14px]">
                            <ThumbsUp className="w-5 h-5 -scale-x-100" />
                            Like
                        </button>
                        <button className="flex items-center gap-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 px-3 py-2 rounded-lg transition-colors font-medium text-[14px]">
                            <MessageSquare className="w-5 h-5" />
                            Comment
                        </button>
                        <button className="flex items-center gap-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 px-3 py-2 rounded-lg transition-colors font-medium text-[14px]">
                            <Repeat2 className="w-5 h-5" />
                            Repost
                        </button>
                        <button className="flex items-center gap-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 px-3 py-2 rounded-lg transition-colors font-medium text-[14px]">
                            <Send className="w-5 h-5" />
                            Send
                        </button>
                    </div>
                </motion.div>

                {/* Floating Actions */}
                <AnimatePresence>
                    {hasResult && !isGenerating && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="mt-8 flex flex-col items-center gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigator.clipboard.writeText(completion)}
                                    className="glass hover:bg-white/10 transition-colors rounded-full px-6 py-3 flex items-center gap-2 font-medium text-sm text-zinc-200"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy to Clipboard
                                </button>

                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors rounded-full px-6 py-3 flex items-center gap-2 font-medium text-sm disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkPlus className="w-4 h-4" />}
                                    Save Draft
                                </button>
                            </div>
                            {savedMessage && (
                                <p className="text-zinc-400 text-sm">{savedMessage}</p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
}
