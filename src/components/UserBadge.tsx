"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Star } from "lucide-react";

export default function UserBadge() {
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (!session) return null;

    return (
        <div className="hidden sm:flex items-center gap-2 glass px-3 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-yellow-400">Lvl 1</span>
            <span className="text-xs font-medium text-yellow-400/80">0/100 XP</span>
        </div>
    );
}
