'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Settings } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const tabs = [
        { name: 'My Drafts', href: '/dashboard', icon: <FileText className="w-4 h-4" /> },
        { name: 'Account Settings', href: '/dashboard/settings', icon: <Settings className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground pt-32 pb-20 px-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">

                {/* Dashboard Sidebar Navigation */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="glass p-4 rounded-2xl md:sticky top-24">
                        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 px-3">
                            Dashboard
                        </h2>
                        <nav className="flex flex-col gap-1">
                            {tabs.map((tab) => {
                                const isActive = pathname === tab.href;
                                return (
                                    <Link
                                        key={tab.name}
                                        href={tab.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        {tab.icon}
                                        {tab.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Dashboard Content Area */}
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
