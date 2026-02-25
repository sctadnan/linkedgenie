export const siteConfig = {
    siteMetadata: {
        title: "LinkedGenie | AI LinkedIn Content Creator & Optimizer",
        description: "Generate viral LinkedIn posts, optimize your profile, and discover trending hooks in seconds with AI powered writing.",
        keywords: ["LinkedIn post generator", "Profile optimization tool", "AI LinkedIn writer", "LinkedIn hook generator"],
    },
    navigationLinks: [
        { name: "Post AI", href: "/post-generator" },
        { name: "Profile AI", href: "/profile-optimizer" },
        { name: "Hook AI", href: "/hook-generator" },
        { name: "Trends", href: "/trend-hub" },
        { name: "Dashboard", href: "/dashboard" },
    ],
    aiConfig: {
        defaultModel: "gpt-4o",
    },
    mockData: {
        fallbackUser: {
            name: "Alex Anderson",
            bio: "Building the future of AI tools | Helping 10k+ creators",
        }
    }
}
