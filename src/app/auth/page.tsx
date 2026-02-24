"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Mail, Lock, LogIn, UserPlus, Chrome } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push("/");
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage("Check your email for the confirmation link.");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during authentication.");
            // Check if it's the placeholder key error
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
                setError("Supabase is not configured yet. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.");
            }
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/`,
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || "An error occurred with Google Auth.");
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative overflow-hidden px-6 pt-16">
            {/* Background gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
                <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass p-8 rounded-2xl relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 text-white">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2">
                        {isLogin ? "Welcome Back" : "Create an Account"}
                    </h1>
                    <p className="text-zinc-400 text-sm">
                        {isLogin ? "Log in to access your saved posts and templates." : "Sign up to save your best content forever."}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="w-full mb-6 py-3 px-4 bg-white hover:bg-zinc-100 text-black rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                    <Chrome className="w-5 h-5" />
                    Continue with Google
                </button>

                <div className="relative flex items-center py-2 mb-6 text-zinc-500 text-sm">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink-0 mx-4">or with email</span>
                    <div className="flex-grow border-t border-white/10"></div>
                </div>

                <form onSubmit={handleAuth} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2 relative">
                        <label className="text-sm font-medium text-zinc-300">Email Address</label>
                        <div className="relative flex items-center">
                            <Mail className="absolute left-4 w-4 h-4 text-zinc-500" />
                            <input
                                type="email"
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-zinc-200 outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 relative">
                        <label className="text-sm font-medium text-zinc-300">Password</label>
                        <div className="relative flex items-center">
                            <Lock className="absolute left-4 w-4 h-4 text-zinc-500" />
                            <input
                                type="password"
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-zinc-200 outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center"
                            >
                                {error}
                            </motion.div>
                        )}
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-3 rounded-lg text-center"
                            >
                                {message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={loading || !email || !password}
                        className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-white relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isLogin ? (
                                <><LogIn className="w-4 h-4" /> Sign In</>
                            ) : (
                                <><UserPlus className="w-4 h-4" /> Create Account</>
                            )}
                        </span>
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-zinc-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                            setMessage(null);
                        }}
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer outline-none"
                    >
                        {isLogin ? "Sign up" : "Sign in"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
