'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Loader2, User, Sparkles, CreditCard, LogOut, Wand2, Save } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [userMeta, setUserMeta] = useState<any>(null);
    const [profileData, setProfileData] = useState<any>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Smart Personalization State
    const [jobTitle, setJobTitle] = useState("");
    const [toneOfVoice, setToneOfVoice] = useState("Professional");
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ text: "", type: "" });

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

            if (session.user.user_metadata?.job_title) {
                setJobTitle(session.user.user_metadata.job_title);
            }
            if (session.user.user_metadata?.tone_of_voice) {
                setToneOfVoice(session.user.user_metadata.tone_of_voice);
            }

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

    const handleSavePersonalization = async () => {
        setIsSaving(true);
        setSaveMessage({ text: "", type: "" });
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    job_title: jobTitle,
                    tone_of_voice: toneOfVoice
                }
            });
            if (error) throw error;
            setSaveMessage({ text: "Settings saved successfully!", type: "success" });
            setTimeout(() => setSaveMessage({ text: "", type: "" }), 3000);
        } catch (err) {
            console.error("Failed to save personalization settings:", err);
            setSaveMessage({ text: "Failed to save settings.", type: "error" });
        } finally {
            setIsSaving(false);
        }
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
                transition={{ delay: 0.05 }}
                className="glass rounded-3xl p-6 md:p-8"
            >
                <div className="flex items-center gap-3 mb-6">
                    <Wand2 className="w-5 h-5 text-indigo-400" />
                    <div>
                        <h2 className="text-xl font-semibold">Smart Personalization (التخصيص الذكي)</h2>
                        <p className="text-sm text-zinc-400 mt-1">
                            Help the AI understand your persona to generate better, more authentic content.
                        </p>
                    </div>
                </div>

                <div className="space-y-6 max-w-2xl">
                    <div>
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                            Job Title / Headline (اختياري)
                        </label>
                        <input
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="e.g. Senior Software Engineer, Marketing Director"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-sans"
                        />
                        <p className="text-xs text-zinc-500 mt-2">
                            This will appear on your generated posts and guide the AI&apos;s terminology.
                        </p>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                            Tone of Voice (نبرة الصوت)
                        </label>
                        <select
                            value={toneOfVoice}
                            onChange={(e) => setToneOfVoice(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none font-sans"
                        >
                            <option value="Professional" className="bg-zinc-900">Professional (احترافي ورسمي)</option>
                            <option value="Casual" className="bg-zinc-900">Casual (عفوي ومباشر)</option>
                            <option value="Motivational" className="bg-zinc-900">Motivational (ملهم وتحفيزي)</option>
                            <option value="Educational" className="bg-zinc-900">Educational (تعليمي وتقني)</option>
                        </select>
                    </div>

                    <div className="pt-2 flex items-center gap-4">
                        <button
                            onClick={handleSavePersonalization}
                            disabled={isSaving}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSaving ? "Saving..." : "Save Preferences"}
                        </button>
                        {saveMessage.text && (
                            <span className={`text-sm ${saveMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                {saveMessage.text}
                            </span>
                        )}
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
