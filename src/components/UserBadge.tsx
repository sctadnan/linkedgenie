"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Star, LogOut, Sparkles, ChevronDown, User, Settings, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function UserBadge() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isPro, setIsPro] = useState(false);
    const [creditsUsed, setCreditsUsed] = useState(0);
    const router = useRouter();
    const menuRef = useRef<HTMLDivElement>(null);

    const getCheckoutUrl = () => {
        const baseUrl = process.env.NEXT_PUBLIC_LEMON_CHECKOUT_URL;
        if (!baseUrl) return "/#pricing";
        if (!session?.user?.id) return baseUrl;

        const separator = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${separator}checkout[custom][user_id]=${session.user.id}`;
    };

    const maxCredits = 5;
    const creditsRemaining = Math.max(maxCredits - creditsUsed, 0);

    useEffect(() => {
        const fetchProfile = async (session: any) => {
            if (!session) return;
            const { data } = await supabase.from('profiles').select('is_pro, credits_used').eq('id', session.user.id).single();
            if (data) {
                setIsPro(data.is_pro);
                setCreditsUsed(data.credits_used);
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            fetchProfile(session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            fetchProfile(session);
            setLoading(false);
        });

        // Click outside to close the dropdown
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            subscription.unsubscribe();
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setIsOpen(false);
        router.refresh();
    };

    if (loading) return <div className="w-10 h-10 animate-pulse bg-white/10 rounded-full"></div>;

    if (!session) {
        return (
            <a href="/auth" className="text-sm font-semibold text-zinc-200 bg-white/5 border border-white/10 px-4 py-2 flex items-center gap-2 rounded-full hover:bg-white/10 transition-colors">
                <User className="w-4 h-4" />
                Sign In
            </a>
        );
    }

    const userMeta = session.user?.user_metadata || {};
    const avatarUrl = userMeta.avatar_url || userMeta.picture;
    const fullName = userMeta.full_name || userMeta.name;
    const jobTitle = userMeta.job_title;
    const email = session.user?.email || "";
    const firstName = fullName ? fullName.split(' ')[0] : "User";

    return (
        <div className="relative" ref={menuRef}>
            {/* Minimalist Avatar Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 p-1 rounded-full border transition-all ${isOpen ? 'bg-white/10 border-white/20 shadow-lg' : 'border-transparent hover:bg-white/5'}`}
            >
                {avatarUrl ? (
                    <img src={avatarUrl} alt={firstName} className="w-9 h-9 rounded-full border border-white/10" />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {firstName.charAt(0).toUpperCase()}
                    </div>
                )}
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Framer Motion Unified Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-72 bg-zinc-950/95 glass border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
                    >
                        {/* 1. Header: User Info & RPG Level */}
                        <div className="p-4 border-b border-white/5 bg-black/20 flex items-center gap-3">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={firstName} className="w-12 h-12 rounded-full border-2 border-purple-500/30" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                                    {firstName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-bold text-zinc-100 truncate">{fullName || firstName}</span>
                                {jobTitle && (
                                    <span className="text-xs text-zinc-400 truncate mt-0.5">{jobTitle}</span>
                                )}
                                <span className="text-xs text-zinc-500 truncate mb-1">{email}</span>
                                <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span className="text-[10px] font-bold text-yellow-500">Lvl 1 Creator</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-2 flex flex-col gap-1">
                            {/* 2. Generation Credits Progress */}
                            {!isPro ? (
                                <div className="px-3 py-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                            Free Generations
                                        </span>
                                        <span className="text-xs font-bold text-zinc-100">{creditsRemaining} / {maxCredits}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                                            style={{ width: `${(creditsRemaining / maxCredits) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="px-3 py-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-orange-500/20 text-center">
                                    <span className="text-sm font-bold text-orange-400">Pro Member ✨</span>
                                </div>
                            )}

                            {/* 3. Pro Upgrade CTA */}
                            {!isPro && (
                                <a
                                    href={getCheckoutUrl()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2.5 mt-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 border border-orange-500/40 rounded-xl transition-colors flex items-center justify-between group"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <span className="text-sm font-bold text-orange-400">Upgrade to Pro ✨</span>
                                    <span className="text-xs font-bold text-orange-200 bg-orange-500/30 px-2 py-0.5 rounded-full group-hover:bg-orange-500/40 transition-colors shadow-sm">Unlimited</span>
                                </a>
                            )}
                        </div>

                        {/* 4. Quick Links */}
                        <div className="p-2 border-t border-white/5 flex flex-col gap-1">
                            <button
                                onClick={() => { router.push('/dashboard'); setIsOpen(false); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                            >
                                <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                                Dashboard
                            </button>
                            <button
                                onClick={() => { router.push('/dashboard/settings'); setIsOpen(false); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                            >
                                <Settings className="w-4 h-4 text-zinc-400" />
                                Account Settings
                            </button>
                        </div>

                        {/* 5. Logout */}
                        <div className="p-2 border-t border-white/5">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
