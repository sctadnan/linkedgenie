export const metadata = {
    title: "About Us | LinkedGenie",
    description: "Learn more about LinkedGenie, the elite AI platform for LinkedIn creators.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">About LinkedGenie</h1>

                <div className="prose prose-invert prose-lg text-zinc-400">
                    <p>
                        Welcome to LinkedGenie, the ultimate AI-powered ecosystem designed exclusively for professionals, founders, and creators who want to dominate LinkedIn without spending hours staring at a blank page.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Our Mission</h2>
                    <p>
                        Our mission is to democratize thought leadership. We believe that everyone has valuable insights to share, but formatting those insights for the LinkedIn algorithm is a barrier to entry. LinkedGenie bridges that gap, turning your raw ideas into highly engaging, viral-ready content.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Why We Built This</h2>
                    <p>
                        The digital landscape is noisy. Generic AI tools produce robotic, easily identifiable content that hurts your personal brand. That's why we engineered the <strong>Digital Footprint Extraction</strong> system. LinkedGenie doesn't just write for you; it learns to write <em>like</em> you.
                    </p>

                    <p className="mt-6">
                        Whether you are looking to generate scroll-stopping hooks, optimize your profile to attract high-ticket clients, or hijack the latest tech trends, LinkedGenie is your unfair advantage.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Get in Touch</h2>
                    <p>
                        Have questions, feedback, or just want to say hi? Reach out to us anytime at <a href="mailto:support@linkedgenie.com" className="text-purple-400 hover:text-purple-300">support@linkedgenie.com</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
