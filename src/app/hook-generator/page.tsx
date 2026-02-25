"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Loader2, Wand2, Copy, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function HookGenerator() {
    const [sessionToken, setSessionToken] = useState("");

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setSessionToken(session.access_token);
        });
    }, []);

    const { completion, input, handleInputChange, handleSubmit, isLoading, error } = useCompletion({
        api: "/api/generate-hook",
        streamProtocol: "text",
        headers: {
            "Content-Type": "application/json",
            ...(sessionToken ? { "Authorization": `Bearer ${sessionToken}` } : {})
        },
    });

    const generatedHooks = completion.split('\n').filter(h => h.trim().length > 0);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center pt-32 pb-20 px-6 relative overflow-hidden">

            {/* Background gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-[30%] h-[40%] rounded-full bg-pink-600/10 blur-[120px]" />
                <div className="absolute top-[30%] right-[20%] w-[30%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
            </div>

            <div className="max-w-3xl w-full text-center mb-12 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-pink-400 text-sm font-medium mb-6">
                    <Wand2 className="w-4 h-4" />
                    Free Lead Magnet Tool
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                    Viral <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">Hook Generator</span>
                </h1>
                <p className="text-lg text-zinc-400 max-w-xl mx-auto">
                    The first line of your LinkedIn post decides if they stop scrolling or keep swiping. Generate 5 irresistible hooks in seconds.
                </p>
            </div>

            <div className="w-full max-w-2xl">
                <form onSubmit={handleSubmit} className="glass rounded-2xl p-2 flex flex-col sm:flex-row gap-2 relative z-10">
                    <input
                        type="text"
                        className="flex-1 bg-transparent border-none px-6 py-4 text-zinc-200 outline-none placeholder:text-zinc-500"
                        placeholder="What is your post about? (e.g. Remote work vs Office)"
                        value={input}
                        onChange={handleInputChange}
                        required
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-semibold rounded-xl px-8 py-4 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate Hooks"}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error.message || "Failed to generate hooks."}</p>
                    </div>
                )}

                <AnimatePresence>
                    {generatedHooks.length > 0 && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-12 flex flex-col gap-4"
                        >
                            <h3 className="text-xl font-semibold mb-2">Your Scroll-Stopping Hooks:</h3>
                            {generatedHooks.map((hook, idx) => (
                                <div key={idx} className="glass p-5 rounded-xl group flex items-start justify-between gap-4 hover:border-pink-500/30 transition-colors">
                                    <p className="text-zinc-200 leading-relaxed font-medium">{hook.replace('►', '').trim()}</p>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(hook.replace('►', '').trim())}
                                        className="text-zinc-500 hover:text-white transition-colors p-2 glass rounded-lg opacity-0 group-hover:opacity-100 flex-shrink-0"
                                        title="Copy to clipboard"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {isLoading && (
                    <div className="mt-12 flex flex-col gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="glass p-5 rounded-xl animate-pulse flex flex-col gap-2">
                                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                                <div className="h-4 bg-white/5 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
