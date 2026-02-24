"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Star, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserBadge() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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
        <div className="flex items-center gap-2 md:gap-3">
            {/* User Profile Pill */}
            <div className="flex items-center gap-2 glass pr-3 pl-1.5 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-default">
                {avatarUrl ? (
                    <img src={avatarUrl} alt={firstName} className="w-6 h-6 rounded-full border border-white/20" />
                ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {firstName.charAt(0).toUpperCase()}
                    </div>
                )}
                <span className="text-sm font-medium text-zinc-100 hidden md:block">{firstName}</span>
            </div>

            {/* Level Badge - Hidden on very small screens */}
            <div className="hidden sm:flex items-center gap-1.5 glass px-3 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-yellow-400">Lvl 1</span>
                <span className="text-xs font-medium text-yellow-400/80 hidden lg:inline ml-1">0/100 XP</span>
            </div>

            {/* Sign Out Button */}
            <button
                onClick={handleSignOut}
                className="text-xs font-medium text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1.5 p-1.5 lg:px-2 lg:py-1.5 rounded-lg hover:bg-red-500/10"
                title="Sign Out"
            >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Sign out</span>
            </button>
        </div>
    );
}
