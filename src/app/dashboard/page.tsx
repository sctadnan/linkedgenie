'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Loader2, FileText, Calendar, Copy, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SavedPost {
    id: string;
    content: string;
    prompt: string;
    tone: string;
    format: string;
    created_at: string;
}

export default function DashboardPage() {
    const [posts, setPosts] = useState<SavedPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                window.location.href = '/auth';
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('saved_posts')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setPosts(data || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('saved_posts')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setPosts(posts.filter(p => p.id !== id));
        } catch (err: any) {
            alert("Failed to delete post: " + err.message);
        }
    };

    const handleCopy = (id: string, content: string) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pt-32 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Your Drafts</h1>
                        <p className="text-zinc-400">Manage and reuse your AI-generated LinkedIn content.</p>
                    </div>
                    <Link
                        href="/post-generator"
                        className="inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-zinc-200 transition-colors"
                    >
                        New Post <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8">
                        {error}
                    </div>
                )}

                {posts.length === 0 && !error ? (
                    <div className="text-center py-32 bg-zinc-900/50 border border-white/5 rounded-3xl">
                        <div className="w-16 h-16 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No drafts yet</h3>
                        <p className="text-zinc-400 mb-8">Start generating posts to see them saved here.</p>
                        <Link
                            href="/post-generator"
                            className="text-purple-400 font-medium hover:text-purple-300 transition-colors"
                        >
                            Go to Post Generator &rarr;
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                        {posts.map((post, index) => {
                            // Bento Grid Logic: Make the first item span 2 columns on large screens if there are enough posts
                            const isFeatured = index === 0 && posts.length > 3;

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    key={post.id}
                                    className={`relative group bg-zinc-900/40 border border-white/10 rounded-3xl p-6 hover:bg-zinc-900/80 transition-all flex flex-col ${isFeatured ? 'lg:col-span-2' : ''}`}
                                >
                                    <div className="flex items-start justify-between mb-4 gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-zinc-200 line-clamp-1 truncate block max-w-full">
                                                {post.prompt || "Untitled Draft"}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(post.created_at).toLocaleDateString()}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                                                    {post.tone}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                                                    {post.format}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 mb-6">
                                        <p className={`text-sm text-zinc-400 whitespace-pre-wrap ${isFeatured ? 'line-clamp-6' : 'line-clamp-4'}`}>
                                            {post.content}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5">
                                        <button
                                            onClick={() => handleCopy(post.id, post.content)}
                                            className="flex-1 py-2 px-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                        >
                                            {copiedId === post.id ? (
                                                "Copied!"
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" /> Copy
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                            title="Delete draft"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
