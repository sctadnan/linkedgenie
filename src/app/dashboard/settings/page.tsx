'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Loader2, User, Sparkles, CreditCard, LogOut } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [userMeta, setUserMeta] = useState<any>(null);
    const [profileData, setProfileData] = useState<any>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const maxCredits = 5;

    useEffect(() => {
        const loadSettingsData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                window.location.href = '/auth';
                return;
            }

            setUserId(session.user.id);
            setUserMeta(session.user.user_metadata);

            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('is_pro, credits_used')
                    .eq('id', session.user.id)
                    .single();
                setProfileData(data);
            } catch (err) {
                console.error("Failed to fetch profile settings", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadSettingsData();
    }, []);

    const getCheckoutUrl = () => {
        const baseUrl = process.env.NEXT_PUBLIC_LEMON_CHECKOUT_URL;
        if (!baseUrl) return "/#pricing";
        if (!userId) return baseUrl;

        const separator = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${separator}checkout[custom][user_id]=${userId}`;
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    const creditsRemaining = Math.max(maxCredits - (profileData?.credits_used || 0), 0);
    const avatarUrl = userMeta?.avatar_url || userMeta?.picture;
    const fullName = userMeta?.full_name || userMeta?.name || "User";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Account Settings</h1>
                <p className="text-zinc-400">Manage your profile details and subscription plan.</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-6 md:p-8"
            >
                <div className="flex items-center gap-3 mb-6">
                    <User className="w-5 h-5 text-purple-400" />
                    <h2 className="text-xl font-semibold">Profile Details</h2>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={fullName} className="w-24 h-24 rounded-full border-4 border-white/5 object-cover" />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {fullName.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <div className="flex-1 w-full space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Full Name</label>
                            <input
                                type="text"
                                disabled
                                value={fullName}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 opacity-80 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Email Address (Managed by Google)</label>
                            <input
                                type="email"
                                disabled
                                value={userMeta?.email || ""}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 opacity-80 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-3xl p-6 md:p-8"
            >
                <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-5 h-5 text-orange-400" />
                    <h2 className="text-xl font-semibold">Subscription & Billing</h2>
                </div>

                {profileData?.is_pro ? (
                    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-orange-500/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-5 h-5 text-orange-400" />
                                <h3 className="text-lg font-bold text-orange-400">Pro Member</h3>
                            </div>
                            <p className="text-orange-200/80 text-sm">You have unlimited access to all AI generation tools and premium features.</p>
                        </div>
                        <a
                            href={process.env.NEXT_PUBLIC_LEMON_CUSTOMER_PORTAL_URL || "#"}
                            target="_blank"
                            className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-center whitespace-nowrap"
                        >
                            Manage Billing
                        </a>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-zinc-200">Free Tier Usage</h3>
                                <span className="text-sm font-bold text-zinc-400">{creditsRemaining} / {maxCredits} Tokens Remaining</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                    style={{ width: `${(creditsRemaining / maxCredits) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-zinc-500 mt-3">You consume 1 token per AI generation. Upgrade for unlimited access.</p>
                        </div>

                        <div className="flex justify-end">
                            <a
                                href={getCheckoutUrl()}
                                target="_blank"
                                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Upgrade to Pro
                            </a>
                        </div>
                    </div>
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="pt-4"
            >
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 font-medium px-4 py-2 rounded-xl hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out Securely
                </button>
            </motion.div>
        </div>
    );
}
