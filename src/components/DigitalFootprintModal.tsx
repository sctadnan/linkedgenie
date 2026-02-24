import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Fingerprint, Loader2, Save } from 'lucide-react';

interface DigitalFootprintModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFootprintExtracted: (footprint: string) => void;
    currentFootprint: string;
}

export function DigitalFootprintModal({ isOpen, onClose, onFootprintExtracted, currentFootprint }: DigitalFootprintModalProps) {
    const [posts, setPosts] = useState("");
    const [roleModel, setRoleModel] = useState("");
    const [isExtracting, setIsExtracting] = useState(false);
    const [error, setError] = useState("");

    const handleExtract = async () => {
        if (!posts.trim()) {
            setError("Please paste at least one recent post.");
            return;
        }

        setIsExtracting(true);
        setError("");

        try {
            const res = await fetch('/api/extract-footprint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ posts, roleModel })
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

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Paste 1-3 of your most successful LinkedIn posts
                                </label>
                                <textarea
                                    className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-zinc-200 focus:ring-2 focus:ring-purple-500/50 outline-none resize-none transition-all placeholder:text-zinc-600"
                                    placeholder="Post 1:\n...\n\nPost 2:\n..."
                                    value={posts}
                                    onChange={(e) => setPosts(e.target.value)}
                                />
                            </div>

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
                                disabled={isExtracting || !posts.trim()}
                                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

