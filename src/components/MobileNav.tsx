"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const links = [
        { name: "Post AI", href: "/post-generator" },
        { name: "Profile AI", href: "/profile-optimizer" },
        { name: "Hook AI", href: "/hook-generator" },
        { name: "Trends", href: "/trend-hub" },
        { name: "Dashboard", href: "/dashboard" },
    ];

    // Close menu when route changes
    useState(() => {
        setIsOpen(false);
    });

    return (
        <div className="lg:hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
                aria-label="Toggle Menu"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-16 left-0 w-full bg-zinc-950/95 backdrop-blur-md border-b border-white/10 shadow-2xl py-4 flex flex-col z-40"
                    >
                        {links.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`px-6 py-3 text-lg font-medium transition-colors ${isActive
                                            ? "text-white bg-white/5 border-l-2 border-purple-500"
                                            : "text-zinc-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
