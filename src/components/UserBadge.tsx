"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Star, LogOut, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserBadge() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Mock credits for MVP
    const maxCredits = 5;
    const creditsRemaining = 3;

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    if (loading) return <div className="hidden sm:block w-16 h-6 animate-pulse bg-white/5 rounded-full"></div>;

    if (!session) {
        return (
            <a href="/auth" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors hidden sm:block">
                Sign In
            </a>
        );
    }

    const userMeta = session.user?.user_metadata || {};
    const avatarUrl = userMeta.avatar_url || userMeta.picture;
    const fullName = userMeta.full_name || userMeta.name || session.user?.email || "User";
    const firstName = fullName.split(' ')[0];

    return (
        <div className="flex items-center gap-1.5 md:gap-2">

            {/* The Ultimate Compact Widget: Avatar + Level + Credits */}
            <div className="flex items-center gap-2 glass pl-1.5 pr-3 py-1.5 rounded-full border border-white/10 bg-black/40 hover:bg-black/60 transition-colors shadow-xl">

                {/* Avatar */}
                {avatarUrl ? (
                    <img src={avatarUrl} alt={firstName} className="w-7 h-7 rounded-full border border-white/20" />
                ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {firstName.charAt(0).toUpperCase()}
                    </div>
                )}

                <div className="flex flex-col">
                    {/* Name and Level */}
                    <div className="flex items-center gap-1.5 leading-none mb-1">
                        <span className="text-xs font-semibold text-zinc-100">{firstName}</span>
                        <div className="flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                            <span className="text-[10px] font-bold text-yellow-500">Lvl 1</span>
                        </div>
                    </div>

                    {/* Compact Credits Bar */}
                    <div className="flex items-center gap-1.5">
                        <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                        <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                style={{ width: `${(creditsRemaining / maxCredits) * 100}%` }}
                            />
                        </div>
                        <span className="text-[9px] font-medium text-purple-400 leading-none">{creditsRemaining} left</span>
                    </div>
                </div>
            </div>

            {/* Sign Out Button (Icon Only to save space) */}
            <button
                onClick={handleSignOut}
                className="text-zinc-500 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-500/10"
                title="Sign Out"
            >
                <LogOut className="w-4 h-4" />
            </button>
        </div>
    );
}
