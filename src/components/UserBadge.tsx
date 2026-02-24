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

    return (
        <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 glass px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-yellow-400">Lvl 1</span>
                <span className="text-xs font-medium text-yellow-400/80 hidden md:inline">0/100 XP</span>
            </div>
            <button
                onClick={handleSignOut}
                className="text-xs font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                title="Sign Out"
            >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
            </button>
        </div>
    );
}
