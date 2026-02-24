import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { niches, getNicheBySlug } from '@/data/niches';
import Link from 'next/link';
import { ArrowRight, Sparkles, Target, Zap } from 'lucide-react';

// 1. Generate Static Params for SSG/ISR
export async function generateStaticParams() {
    return niches.map((niche) => ({
        niche: niche.slug,
    }));
}

// 2. Dynamic SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ niche: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const data = getNicheBySlug(resolvedParams.niche);

    if (!data) return {};

    return {
        title: `LinkedIn Post Generator for ${data.title} | LinkedGenie`,
        description: data.description,
        keywords: data.keywords,
        openGraph: {
            title: `LinkedIn Post Generator for ${data.title}`,
            description: data.description,
        }
    };
}

// 3. Page Component
export default async function NicheGeneratorPage({ params }: { params: Promise<{ niche: string }> }) {
    const resolvedParams = await params;
    const data = getNicheBySlug(resolvedParams.niche);

    if (!data) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-[50vh] overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[60%] h-[100%] rounded-full bg-purple-600/10 blur-[120px]" />
            </div>

            <main className="max-w-4xl mx-auto px-6 pt-32 pb-24 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-8">
                    <Sparkles className="w-4 h-4" />
                    <span>Tailored for {data.title}</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                    The Ultimate LinkedIn Tool for <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                        {data.title}
                    </span>
                </h1>

                <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                    {data.description} Stop {data.painPoint}. {data.solution}
                </p>

                <div className="grid sm:grid-cols-3 gap-6 mb-16 max-w-3xl mx-auto text-left">
                    <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl">
                        <Target className="w-8 h-8 text-blue-400 mb-4" />
                        <h3 className="font-semibold mb-2">Beat Writer's Block</h3>
                        <p className="text-sm text-zinc-400">Never stare at a blank screen again. Generate highly relevant ideas instantly.</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl">
                        <Zap className="w-8 h-8 text-yellow-400 mb-4" />
                        <h3 className="font-semibold mb-2">Viral Formats</h3>
                        <p className="text-sm text-zinc-400">Access templates proven to drive engagement specifically for {data.title.toLowerCase()}.</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl">
                        <Sparkles className="w-8 h-8 text-purple-400 mb-4" />
                        <h3 className="font-semibold mb-2">Mimic Your Voice</h3>
                        <p className="text-sm text-zinc-400">Train the AI on your past posts so it sounds exactly like you, not a robot.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/post-generator"
                        className="group relative inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all w-full sm:w-auto"
                    >
                        Start Generating Free
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </main>
        </div>
    );
}
