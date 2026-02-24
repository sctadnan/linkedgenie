import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground flex flex-col items-center">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      <main className="flex-1 w-full max-w-6xl px-6 flex flex-col items-center justify-center text-center pt-32 pb-20">

        {/* Badge */}
        <div className="glass rounded-full px-4 py-2 mb-8 inline-flex items-center gap-2 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          <span className="text-sm font-medium tracking-wide text-zinc-300">New: AI Powered Workflow</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-4xl text-transparent bg-clip-text text-gradient">
          Optimize Your LinkedIn Presence with AI
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl leading-relaxed">
          The ultimate platform for generating viral posts, optimizing your profile, and boosting your professional brand visibility.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link href="/post-generator" className="relative group overflow-hidden rounded-xl bg-white text-black font-semibold px-8 py-4 transition-all hover:scale-105 active:scale-95">
            <span className="relative z-10 flex items-center gap-2">
              Start Generating Free
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-purple-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>

          <Link href="#features" className="glass rounded-xl text-white font-medium px-8 py-4 transition-all hover:bg-white/10 active:scale-95">
            View Features
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-32 text-left" id="features">
          <div className="glass p-8 rounded-2xl group hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Post Generator</h3>
            <p className="text-zinc-400">Craft engaging posts in seconds. Select tone, topic, and let our AI do the hard work.</p>
          </div>

          <Link href="/profile-optimizer" className="glass p-8 rounded-2xl group hover:border-purple-500/50 transition-colors block">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><line x1="21.17" x2="12" y1="8" y2="8" /><line x1="3.95" x2="8.54" y1="6.06" y2="14" /><line x1="10.88" x2="15.46" y1="21.94" y2="14" /></svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Profile Optimizer</h3>
            <p className="text-zinc-400">Scan your profile against industry standards and receive actionable improvement tips.</p>
          </Link>

          <Link href="/trend-hub" className="glass p-8 rounded-2xl group hover:border-pink-500/50 transition-colors block">
            <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-6 text-pink-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Trend Hub</h3>
            <p className="text-zinc-400">Stay ahead of the curve. Discover trending topics and hashtags in your niche.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
