'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, ArrowRight, Star } from 'lucide-react';

const FREE_FEATURES = [
    '5 AI post generations / day',
    '1 Hook AI generation / day',
    '3 Post AI generations / day for guests',
    'LinkedIn post scoring & analysis',
    'Hook Viral Score Predictor',
    'Digital Footprint (Clone Style)',
    'Profile Optimizer',
    'Trend Hub access',
];

const PRO_FEATURES = [
    'Unlimited AI post generations',
    'Unlimited Hook AI generations',
    'Priority GPT-4o access',
    'Advanced LinkedIn scoring',
    'Viral Angle Predictor (5 hooks per run)',
    'Digital Footprint style cloning',
    'Saved drafts & history',
    'Pro badge in Account Settings',
];

const TESTIMONIALS = [
    {
        name: 'Sarah K.',
        role: 'Marketing Director',
        avatar: 'S',
        color: 'from-pink-500 to-rose-600',
        text: 'LinkedGenie helped me go from 200 to 4,000 followers in 3 months. The viral hook predictor is insane.',
    },
    {
        name: 'Ahmed R.',
        role: 'Startup Founder',
        avatar: 'A',
        color: 'from-blue-500 to-indigo-600',
        text: 'كل منشور أكتبه الآن يحصل على ضعف التفاعل المعتاد. أداة لا غنى عنها لأي شخص جاد على LinkedIn.',
    },
    {
        name: 'James T.',
        role: 'Tech Lead at Stripe',
        avatar: 'J',
        color: 'from-emerald-500 to-teal-600',
        text: 'The AI persona cloning feature is scary good. It genuinely sounds like me, not a robot.',
    },
];

export default function PricingPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string>('');
    const [isPro, setIsPro] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUserId(session.user.id);
                setUserEmail(session.user.email || '');
                const { data } = await supabase
                    .from('profiles')
                    .select('is_pro')
                    .eq('id', session.user.id)
                    .single();
                if (data?.is_pro) setIsPro(true);
            }
            setIsLoadingUser(false);
        };
        init();
    }, []);

    const getCheckoutUrl = () => {
        const baseUrl = process.env.NEXT_PUBLIC_LEMON_CHECKOUT_URL;
        if (!baseUrl) return '/auth';
        if (!userId) return '/auth';
        const email = encodeURIComponent(userEmail);
        const separator = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${separator}checkout[custom][user_id]=${userId}&checkout[email]=${email}`;
    };

    // Prices from env vars — update in Vercel dashboard to change price without code deploy
    const proPrice = process.env.NEXT_PUBLIC_LEMON_PRICE ?? '5';
    const originalPrice = process.env.NEXT_PUBLIC_LEMON_ORIGINAL_PRICE ?? '7';
    const hasDiscount = proPrice !== originalPrice;

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] left-[10%] w-[50%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px]" />
                <div className="absolute top-[40%] right-[5%] w-[40%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
                <div className="absolute bottom-0 left-[30%] w-[40%] h-[40%] rounded-full bg-pink-600/8 blur-[120px]" />
            </div>

            <div className="max-w-5xl mx-auto px-6 pt-28 pb-24">

                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 glass border-indigo-500/20 px-4 py-2 rounded-full text-indigo-400 text-sm font-medium mb-6">
                        <Sparkles className="w-4 h-4" />
                        Simple, transparent pricing
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-tight">
                        Invest in your{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
                            LinkedIn growth
                        </span>
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-xl mx-auto">
                        Start free. Upgrade when you're ready to go unlimited.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20 max-w-3xl mx-auto">

                    {/* Free Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass rounded-3xl p-8 flex flex-col"
                    >
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Zap className="w-5 h-5 text-zinc-400" />
                                <h2 className="text-lg font-bold text-zinc-200">Free</h2>
                            </div>
                            <div className="flex items-end gap-1 mb-2">
                                <span className="text-5xl font-black text-white">$0</span>
                                <span className="text-zinc-500 mb-2">/month</span>
                            </div>
                            <p className="text-sm text-zinc-500">Perfect for getting started</p>
                        </div>

                        <ul className="space-y-3 mb-8 flex-1">
                            {FREE_FEATURES.map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-sm text-zinc-400">
                                    <Check className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/auth"
                            className="w-full py-3 rounded-xl font-semibold text-center border border-white/10 text-zinc-300 hover:bg-white/5 transition-colors"
                        >
                            Get started free
                        </Link>
                    </motion.div>

                    {/* Pro Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative rounded-3xl p-8 flex flex-col bg-gradient-to-b from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 shadow-2xl shadow-indigo-900/20 overflow-hidden"
                    >
                        {/* Glow */}
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

                        {/* Popular badge */}
                        <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full">
                            <Star className="w-3 h-3 fill-current" />
                            Most Popular
                        </div>

                        <div className="mb-6 relative">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-5 h-5 text-indigo-400" />
                                <h2 className="text-lg font-bold text-white">Pro</h2>
                            </div>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-5xl font-black text-white">${proPrice}</span>
                                {hasDiscount && (
                                    <span className="text-zinc-500 line-through text-xl mb-2">${originalPrice}</span>
                                )}
                                <span className="text-zinc-400 mb-2">/month</span>
                            </div>
                            {hasDiscount ? (
                                <p className="text-sm text-indigo-400 font-semibold">🔥 Launch discount — save ${Number(originalPrice) - Number(proPrice)}/mo</p>
                            ) : (
                                <p className="text-sm text-zinc-400">Unlimited AI power for creators</p>
                            )}
                        </div>

                        <ul className="space-y-3 mb-8 flex-1 relative">
                            {PRO_FEATURES.map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-sm text-zinc-200">
                                    <div className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="w-3 h-3 text-indigo-400" />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {/* CTA — changes based on user status */}
                        {isLoadingUser ? null : isPro ? (
                            <div className="w-full py-3 rounded-xl font-semibold text-center bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                ✓ You're on Pro
                            </div>
                        ) : (
                            <a
                                href={getCheckoutUrl()}
                                target={userId ? '_blank' : '_self'}
                                rel="noreferrer"
                                className="relative w-full py-3.5 rounded-xl font-bold text-center flex items-center justify-center gap-2 group overflow-hidden text-white"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:from-indigo-500 group-hover:to-purple-500 transition-all" />
                                <span className="relative flex items-center gap-2">
                                    {userId ? 'Upgrade to Pro' : 'Sign in to Upgrade'}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </a>
                        )}

                        <p className="text-[11px] text-zinc-600 text-center mt-3 relative">
                            Secure checkout via Lemon Squeezy · Cancel anytime
                        </p>
                    </motion.div>
                </div>

                {/* Feature comparison shield */}


                {/* Testimonials */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-center text-2xl font-bold mb-8 text-zinc-200">
                        Loved by LinkedIn creators
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45 + i * 0.08 }}
                                className="glass rounded-2xl p-6"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-zinc-200 text-sm">{t.name}</p>
                                        <p className="text-xs text-zinc-500">{t.role}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-zinc-400 leading-relaxed" dir="auto">"{t.text}"</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* FAQ */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-20"
                >
                    <h2 className="text-center text-2xl font-bold mb-8 text-zinc-200">FAQ</h2>
                    <div className="max-w-2xl mx-auto space-y-4">
                        {[
                            {
                                q: 'What counts as a generation?',
                                a: 'Each time the AI generates a post or a set of hooks for you, that counts as one generation.',
                            },
                            {
                                q: 'Can I cancel anytime?',
                                a: 'Yes. You can cancel your Pro subscription at any time from your billing portal. You keep access until the end of the billing period.',
                            },
                            {
                                q: 'Which payment methods are accepted?',
                                a: 'All major credit and debit cards are accepted via Lemon Squeezy, our trusted payment processor.',
                            },
                            {
                                q: 'Is there a free trial?',
                                a: 'The Free tier IS your trial — get 5 generations after sign-up, no credit card required.',
                            },
                        ].map((item, i) => (
                            <div key={i} className="glass rounded-2xl p-6">
                                <h3 className="font-semibold text-zinc-200 mb-2">{item.q}</h3>
                                <p className="text-sm text-zinc-500">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Bottom CTA */}
                {!isPro && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="mt-20 text-center"
                    >
                        <div className="inline-block glass rounded-3xl p-10 max-w-lg w-full">
                            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Ready to go unlimited?</h2>
                            <p className="text-zinc-400 text-sm mb-6">Join thousands of creators who publish smarter with AI.</p>
                            <a
                                href={getCheckoutUrl()}
                                target={userId ? '_blank' : '_self'}
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-900/30 group"
                            >
                                {userId ? 'Upgrade to Pro — $9/mo' : 'Start for Free'}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
