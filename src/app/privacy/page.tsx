export const metadata = {
    title: "Privacy Policy | LinkedGenie",
    description: "Privacy Policy for LinkedGenie.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-background text-foreground pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">Privacy Policy</h1>
                <p className="text-sm text-zinc-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-invert text-zinc-400 space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us when you create an account, such as your name, email address (via Google OAuth), and any content you save as drafts within the platform.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
                        <p>We use the information we collect to provide, maintain, and improve our services, to process your authentication securely, and to personalize your experience (such as remembering your Digital Footprint).</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">3. AI Data Processing</h2>
                        <p>When you use our AI tools (Post Generator, Profile Optimizer, etc.), the text you submit is sent securely to our third-party LLM providers (e.g., OpenAI) for the sole purpose of generating your requested content. We do not use your personal private data to train our own foundation models.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">4. Cookies and Tracking</h2>
                        <p>We use essential cookies to maintain your login session via Supabase. We do not use intrusive third-party tracking pixels.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">5. Data Security</h2>
                        <p>Your authentication and saved drafts are stored securely using industry-standard encryption provided by our database partner, Supabase.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">6. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@linkedgenie.com" className="text-purple-400 hover:text-purple-300">support@linkedgenie.com</a>.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
