"use client";

import { useState, useEffect } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Loader2, Sparkles, Send, Copy, ThumbsUp, MessageSquare, Repeat2, BookmarkPlus, Fingerprint, Activity, Check, X, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { DigitalFootprintModal } from "@/components/DigitalFootprintModal";
import { triggerConfetti, triggerSmallConfetti } from "@/lib/confetti";
import { siteConfig } from "@/config/site";

export default function PostGenerator() {
    const [tone, setTone] = useState("Professional");
    const [format, setFormat] = useState("Listicle");
    const [digitalFootprint, setDigitalFootprint] = useState("");
    const [isFootprintModalOpen, setIsFootprintModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedMessage, setSavedMessage] = useState("");
    const [sessionToken, setSessionToken] = useState("");
    const [session, setSession] = useState<any>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // Inline Job Title Editing State
    const [localJobTitle, setLocalJobTitle] = useState("");
    const [isEditingJob, setIsEditingJob] = useState(false);
    const [tempJobTitle, setTempJobTitle] = useState("");
    const [isSavingJob, setIsSavingJob] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSessionToken(session.access_token);
                setSession(session);

                const meta = session.user.user_metadata || {};
                if (meta.job_title) setLocalJobTitle(meta.job_title);
                if (meta.tone_of_voice) setTone(meta.tone_of_voice);
            }
        });
    }, []);

    const userMeta = session?.user?.user_metadata || {};
    const avatarUrl = userMeta?.avatar_url || userMeta?.picture;
    const fullName = userMeta?.full_name || userMeta?.name || siteConfig.mockData.fallbackUser.name;
    const bio = userMeta?.job_title || userMeta?.description || siteConfig.mockData.fallbackUser.bio;


    const calculateScore = (text: string) => {
        if (!text) return 0;
        let score = 50; // Base score
        if (text.length > 200 && text.length < 1300) score += 20; // Optimal length
        if (text.split('\n\n').length > 3) score += 15; // Good whitespace
        if (text.includes('?')) score += 15; // CTA or question included
        return Math.min(100, score);
    };

    const handleSaveJobTitle = async () => {
        setIsSavingJob(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { job_title: tempJobTitle }
            });
            if (error) throw error;
            setLocalJobTitle(tempJobTitle);
            setIsEditingJob(false);
        } catch (err) {
            console.error("Failed to save inline job title:", err);
            // Optionally, show a toast here if you have a toast system
        } finally {
            setIsSavingJob(false);
        }
    };

    const handleToneChange = async (newTone: string) => {
        setTone(newTone);
        try {
            await supabase.auth.updateUser({
                data: { tone_of_voice: newTone }
            });
        } catch (err) {
            console.error("Failed to save tone preference:", err);
        }
    };

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
                .from('saved_posts')
                .insert([
                    { user_id: session.user.id, content: completion, tone, format, prompt: input, topic: input }
                ]);

            if (error) {
                console.error("Error saving post:", error);
                setSavedMessage(`Failed to save: ${error.message}`);
            } else {
                setSavedMessage("Saved to Drafts!");
                triggerSmallConfetti(); // Gamification reward
            }
        } catch (err: any) {
            setSavedMessage(`Failed to save: ${err.message || "Unknown error"}`);
        } finally {
            setIsSaving(false);
            setTimeout(() => setSavedMessage(""), 3000);
        }
    };

    const { completion, input, handleInputChange, handleSubmit, isLoading, error } = useCompletion({
        api: "/api/generate",
        streamProtocol: "text",
        headers: {
            "Content-Type": "application/json",
            ...(sessionToken ? { "Authorization": `Bearer ${sessionToken}` } : {})
        },
        body: {
            tone,
            format,
            digitalFootprint,
        },
        onError: (err) => {
            console.error("useCompletion failed:", err);
        },
        onFinish: (prompt, result) => {
            console.log("Generation finished successfully. Result length:", result.length);
            const score = calculateScore(result);
            if (score >= 80) {
                // Gamification: Reward high scoring posts with a confetti burst!
                triggerConfetti();
            }
        }
    });

    const isGenerating = isLoading;
    const hasResult = completion.length > 0;
    const isRtl = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(completion || input);

    // Auto-scroll on mobile when result starts generating
    useEffect(() => {
        if (isGenerating || hasResult) {
            const previewSection = document.getElementById("preview-section");
            if (previewSection && window.innerWidth < 768) {
                previewSection.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [isGenerating, hasResult]);

    const handleCopy = () => {
        if (completion) {
            navigator.clipboard.writeText(completion);
            // Mini reward for taking action
            triggerSmallConfetti();
            setSavedMessage("Copied to clipboard!");
            setTimeout(() => setSavedMessage(""), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row relative">

            {/* Left Panel - Controls */}
            <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-white/10 glass p-6 md:p-8 flex flex-col h-auto md:h-screen md:sticky top-0 overflow-y-auto z-20">
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
                            dir="auto"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-zinc-300">Tone</label>
                            <select
                                value={tone}
                                onChange={(e) => handleToneChange(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-zinc-200 appearance-none outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                                <option>Professional</option>
                                <option>Conversational</option>
                                <option>Bold & Direct</option>
                                <option>Humorous</option>
                                <option>Inspirational</option>
                                <option>Educational</option>
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

                    <div className="flex items-center gap-4 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                                <Fingerprint className="w-4 h-4" /> Digital Footprint
                            </h3>
                            <p className="text-xs text-zinc-400 mt-1">
                                {digitalFootprint ? "Footprint loaded! Post will mimic your style." : "Teach AI to write exactly like you."}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsFootprintModalOpen(true)}
                            className="text-xs font-semibold bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 px-3 py-2 rounded-lg transition-colors"
                        >
                            {digitalFootprint ? "Edit Style" : "Clone Style"}
                        </button>
                    </div>

                    <div className="pt-4">
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
            <div id="preview-section" className="w-full md:w-7/12 flex flex-col relative items-center justify-start pt-12 md:pt-16 pb-32 md:min-h-screen overflow-hidden">
                {/* Background mesh */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    dir={isRtl ? "rtl" : "ltr"}
                    className="w-full max-w-[552px] bg-white dark:bg-[#1D2226] border border-zinc-300/50 dark:border-white/10 rounded-lg shadow-md z-10 overflow-hidden text-slate-900 dark:text-zinc-100"
                >
                    {/* LinkedIn Header Mockup (Desktop Scale) */}
                    <div className="p-4 flex items-start gap-3">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={fullName} className="w-12 h-12 rounded-full border border-white/10 flex-shrink-0 object-cover" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 flex items-center justify-center text-white text-lg font-bold">
                                {fullName ? fullName.charAt(0).toUpperCase() : "A"}
                            </div>
                        )}
                        <div className="flex-1 mt-0.5">
                            <div className="flex items-center gap-1.5 hover:underline cursor-pointer">
                                <h3 className="font-semibold text-[15px] leading-none text-slate-900 dark:text-zinc-100">{fullName}</h3>
                                <span className="text-zinc-500 text-[13px] leading-none">• 1st</span>
                            </div>

                            {isEditingJob ? (
                                <div className="mt-1 mb-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            autoFocus
                                            value={tempJobTitle}
                                            onChange={(e) => setTempJobTitle(e.target.value)}
                                            placeholder="e.g. Software Engineer"
                                            className="bg-black/40 border border-white/20 rounded-md px-2 py-1 text-[12px] text-zinc-200 outline-none focus:ring-1 focus:ring-blue-500/50 flex-1 max-w-[200px]"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveJobTitle();
                                                if (e.key === 'Escape') setIsEditingJob(false);
                                            }}
                                        />
                                        <button
                                            onClick={handleSaveJobTitle}
                                            disabled={isSavingJob}
                                            className="p-1 hover:bg-white/10 rounded text-emerald-400 disabled:opacity-50 transition-colors"
                                        >
                                            {isSavingJob ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => setIsEditingJob(false)}
                                            disabled={isSavingJob}
                                            className="p-1 hover:bg-white/10 rounded text-red-400 disabled:opacity-50 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1 text-[9px] text-zinc-500">
                                        <Lock className="w-3 h-3 text-zinc-500" />
                                        <span>Title securely saved for AI persona training.</span>
                                    </div>
                                </div>
                            ) : !localJobTitle ? (
                                <button
                                    onClick={() => {
                                        setTempJobTitle("");
                                        setIsEditingJob(true);
                                    }}
                                    className="inline-block mt-1.5 mb-1 px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/20 rounded-full text-[11px] font-semibold text-blue-400 transition-all shadow-sm"
                                >
                                    🪄 Add Headline +
                                </button>
                            ) : (
                                <p
                                    className="text-zinc-500 text-[12px] mt-1 pr-4 truncate cursor-pointer hover:text-zinc-400 group flex items-center gap-1"
                                    onClick={() => {
                                        setTempJobTitle(localJobTitle);
                                        setIsEditingJob(true);
                                    }}
                                    title="Click to edit"
                                >
                                    {localJobTitle}
                                    <span className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-400 tracking-wider transition-opacity font-semibold ml-1">EDIT</span>
                                </p>
                            )}

                            <div className="flex items-center gap-1 mt-0.5 text-zinc-500 text-[12px]">
                                <span>Just now</span> •
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                            </div>
                        </div>
                        <button className="text-[#0a66c2] dark:text-[#70b5f9] font-semibold text-[15px] flex items-center gap-1 px-2 py-1.5 rounded hover:bg-[#0a66c2]/10 dark:hover:bg-[#70b5f9]/10 transition-colors mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                            Follow
                        </button>
                    </div>

                    {/* LinkedIn Body Mockup (Desktop Text Specs) */}
                    <div className="px-4 pb-2 text-[14px] leading-[1.5] relative min-h-[150px] text-slate-900 dark:text-zinc-100">
                        {!hasResult && !isGenerating && (
                            <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-[14px] p-4 text-center">
                                Your viral post will appear here...
                            </div>
                        )}

                        <div className="whitespace-pre-wrap font-sans break-words mb-2" dir="auto">
                            {isExpanded ? completion : (completion.length > 200 ? completion.substring(0, 200) + "..." : completion)}
                            {isGenerating && (
                                <span className="inline-block w-2 h-4 ml-1 bg-[#0a66c2] dark:bg-[#70b5f9] animate-pulse"></span>
                            )}
                        </div>

                        {hasResult && !isGenerating && completion.length > 200 && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-semibold cursor-pointer"
                            >
                                {isExpanded ? "see less" : "...see more"}
                            </button>
                        )}
                    </div>

                    {/* LinkedIn Desktop Action Bar */}
                    <div className="px-4 py-1.5 border-t border-zinc-200 dark:border-white/10 flex justify-between mx-2 mb-1">
                        <button className="flex-1 flex items-center justify-center gap-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 py-3 rounded-md transition-colors font-semibold text-[14px]">
                            <ThumbsUp className="w-5 h-5 -scale-x-100" />
                            <span className="hidden sm:inline">Like</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 py-3 rounded-md transition-colors font-semibold text-[14px]">
                            <MessageSquare className="w-5 h-5" />
                            <span className="hidden sm:inline">Comment</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 py-3 rounded-md transition-colors font-semibold text-[14px]">
                            <Repeat2 className="w-5 h-5" />
                            <span className="hidden sm:inline">Repost</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 py-3 rounded-md transition-colors font-semibold text-[14px]">
                            <Send className="w-5 h-5" />
                            <span className="hidden sm:inline">Send</span>
                        </button>
                    </div>
                </motion.div>

                {/* Predictive Scoring and Floating Actions */}
                <AnimatePresence>
                    {hasResult && !isGenerating && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mt-6 w-full max-w-lg mb-4 bg-zinc-900 border border-white/10 rounded-xl p-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <Activity className="w-5 h-5 text-blue-400" />
                                <div>
                                    <p className="text-sm font-semibold text-zinc-200">Viral Potential Score</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-1.5 w-32 bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${calculateScore(completion)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-emerald-400">{calculateScore(completion)}/100</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs text-zinc-500 text-right">
                                {completion.length > 1300 ? <span className="text-red-400 flex items-center justify-end">Too long</span> : <span className="text-emerald-400 flex items-center justify-end">Optimal length</span>}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                                    onClick={handleCopy}
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

            <DigitalFootprintModal
                isOpen={isFootprintModalOpen}
                onClose={() => setIsFootprintModalOpen(false)}
                onFootprintExtracted={setDigitalFootprint}
                currentFootprint={digitalFootprint}
            />
        </div>
    );
}
