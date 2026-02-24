import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import UserBadge from "@/components/UserBadge";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinkedGenie V2 | AI LinkedIn Content Creator & Optimizer",
  description: "Generate viral LinkedIn posts, optimize your profile, and discover trending hooks in seconds with AI powered writing.",
  keywords: ["LinkedIn post generator", "Profile optimization tool", "AI LinkedIn writer", "LinkedIn hook generator"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} >
        <header className="fixed top-0 left-0 w-full glass z-50 border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <a href="/" className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs">LG</span>
              LinkedGenie <span className="text-zinc-500 text-sm font-normal">v2</span>
            </a>
            <nav className="hidden md:flex items-center gap-5 text-[13px] font-medium text-zinc-400">
              <a href="/post-generator" className="hover:text-white transition-colors">Post AI</a>
              <a href="/profile-optimizer" className="hover:text-white transition-colors">Profile AI</a>
              <a href="/hook-generator" className="hover:text-white transition-colors">Hook AI</a>
              <a href="/trend-hub" className="hover:text-white transition-colors">Trends</a>
            </nav>
            <div className="flex items-center gap-3">
              {process.env.CHECKOUT_URL && (
                <a href={process.env.CHECKOUT_URL} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity drop-shadow-sm shadow-orange-500/20 hidden md:block">
                  Upgrade Pro
                </a>
              )}
              <UserBadge />
            </div>
          </div>
        </header>
        <main className="pt-16 min-h-screen relative">
          {!process.env.OPENAI_API_KEY && (
            <div className="bg-amber-500 text-black px-6 py-3 text-center text-sm font-medium z-40 relative shadow-md">
              <span className="font-bold flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                Action Required:
              </span>
              Please create a <code>.env.local</code> file in your project root and add your <code>OPENAI_API_KEY=sk-...</code> to use the AI generation features in local development. In production, add this to your Vercel Environment Variables.
            </div>
          )}
          {children}
        </main>
      </body>
    </html>
  );
}
