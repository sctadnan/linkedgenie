import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Fingerprint, Loader2, Save, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DigitalFootprintModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFootprintExtracted: (footprint: string) => void;
    currentFootprint: string;
    sessionToken: string;
}

export function DigitalFootprintModal({ isOpen, onClose, onFootprintExtracted, currentFootprint, sessionToken }: DigitalFootprintModalProps) {
    const [activeTab, setActiveTab] = useState<'paste' | 'drafts'>('paste');
    const [posts, setPosts] = useState("");
    const [drafts, setDrafts] = useState<any[]>([]);
    const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
    const [selectedDraftIds, setSelectedDraftIds] = useState<Set<string>>(new Set());

    const [roleModel, setRoleModel] = useState("");
    const [isExtracting, setIsExtracting] = useState(false);
    const [error, setError] = useState("");

    // Fetch drafts when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchDrafts();
        }
    }, [isOpen]);

    const fetchDrafts = async () => {
        setIsLoadingDrafts(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from('saved_posts')
                .select('id, content, prompt')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDrafts(data || []);
        } catch (err) {
            console.error("Failed to fetch drafts:", err);
        } finally {
            setIsLoadingDrafts(false);
        }
    };

    const toggleDraftSelection = (id: string) => {
        const next = new Set(selectedDraftIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedDraftIds(next);
    };

    const handleExtract = async () => {
        let contentToExtract = posts.trim();

        if (activeTab === 'drafts') {
            contentToExtract = drafts
                .filter(d => selectedDraftIds.has(d.id))
                .map(d => d.content)
                .join('\n\n---\n\n');
        }

        if (!contentToExtract) {
            setError(activeTab === 'drafts' ? "Please select at least one draft." : "Please paste at least one recent post.");
            return;
        }

        setIsExtracting(true);
        setError("");

        try {
            const res = await fetch('/api/extract-footprint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                body: JSON.stringify({ posts: contentToExtract, roleModel })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to extract footprint.");
            }

            const data = await res.json();
            onFootprintExtracted(data.footprint);
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsExtracting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <Fingerprint className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Digital Footprint AI</h2>
                                <p className="text-zinc-400 text-sm">Clone your unique writing style</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {currentFootprint && (
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-100 text-sm">
                                    <div className="flex items-center gap-2 font-semibold text-emerald-400 mb-2">
                                        <Save className="w-4 h-4" /> Active Footprint Loaded!
                                    </div>
                                    <p className="line-clamp-3 text-emerald-200/70">{currentFootprint}</p>
                                </div>
                            )}

                            {/* Tab Navigation */}
                            <div className="flex bg-black/40 p-1 rounded-xl">
                                <button
                                    onClick={() => { setActiveTab('paste'); setError(""); }}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'paste' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Paste Text
                                </button>
                                <button
                                    onClick={() => { setActiveTab('drafts'); setError(""); }}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'drafts' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Select from Drafts
                                </button>
                            </div>

                            {/* Tab Content: Paste */}
                            {activeTab === 'paste' && (
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Paste 1-3 of your most successful LinkedIn posts
                                    </label>
                                    <textarea
                                        className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-zinc-200 focus:ring-2 focus:ring-purple-500/50 outline-none resize-none transition-all placeholder:text-zinc-600"
                                        placeholder="Post 1:\n...\n\nPost 2:\n..."
                                        value={posts}
                                        onChange={(e) => setPosts(e.target.value)}
                                        dir="auto"
                                    />
                                </div>
                            )}

                            {/* Tab Content: Drafts */}
                            {activeTab === 'drafts' && (
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {isLoadingDrafts ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                                        </div>
                                    ) : drafts.length === 0 ? (
                                        <div className="text-center py-8 text-zinc-500 text-sm">
                                            No saved drafts found.
                                        </div>
                                    ) : (
                                        drafts.map(draft => (
                                            <div
                                                key={draft.id}
                                                onClick={() => toggleDraftSelection(draft.id)}
                                                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${selectedDraftIds.has(draft.id) ? 'bg-purple-500/10 border-purple-500/50 ring-1 ring-purple-500/30' : 'bg-black/40 border-white/5 hover:bg-zinc-800/80 hover:border-white/10'}`}
                                            >
                                                <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${selectedDraftIds.has(draft.id) ? 'bg-purple-500 border-purple-400 text-white' : 'border-zinc-600 bg-zinc-800/50 text-transparent'}`}>
                                                    <Check className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="flex-1 min-w-0 pointer-events-none" dir="auto">
                                                    <p className="text-sm font-semibold text-zinc-200 line-clamp-1">{draft.prompt || "Untitled Draft"}</p>
                                                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1 whitespace-pre-wrap leading-relaxed">{draft.content}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Role Model (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-zinc-200 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-zinc-600"
                                    placeholder="e.g. Justin Welsh, Sahil Bloom, Alex Hormozi"
                                    value={roleModel}
                                    onChange={(e) => setRoleModel(e.target.value)}
                                />
                                <p className="text-xs text-zinc-500 mt-1">
                                    Blend your style with the pacing and psychology of a top creator.
                                </p>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleExtract}
                                disabled={isExtracting || (activeTab === 'paste' ? !posts.trim() : selectedDraftIds.size === 0)}
                                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {isExtracting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Extracting Digital DNA...
                                    </>
                                ) : (
                                    <>
                                        <Fingerprint className="w-5 h-5" />
                                        Clone My Style
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

