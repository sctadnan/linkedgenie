export interface NicheData {
    slug: string;
    title: string;
    description: string;
    painPoint: string;
    solution: string;
    keywords: string[];
}

export const niches: NicheData[] = [
    {
        slug: "software-engineers",
        title: "Software Engineers",
        description: "Generate viral technical content, share your coding journey, and attract top recruiters without spending hours writing.",
        painPoint: "struggling to explain complex technical concepts in an engaging way that recruiters and non-technical founders understand",
        solution: "Translate your code into compelling stories.",
        keywords: ["tech", "coding", "developer", "software engineering", "programming"]
    },
    {
        slug: "marketing-professionals",
        title: "Marketing Professionals",
        description: "Craft scroll-stopping LinkedIn posts, share campaign breakdowns, and build your personal brand as a top marketer.",
        painPoint: "spending too much time writing for yourself after writing for your clients all day",
        solution: "Generate thought-leadership content in seconds.",
        keywords: ["marketing", "growth", "seo", "branding", "b2b"]
    },
    {
        slug: "founders",
        title: "Startup Founders",
        description: "Build in public, attract investors, and hire top talent by sharing your startup journey with authenticity.",
        painPoint: "having a great product but lacking the time to consistently build an audience and share updates",
        solution: "Turn your daily wins and failures into viral LinkedIn stories.",
        keywords: ["startup", "entrepreneurship", "vc", "founder", "build in public"]
    },
    {
        slug: "sales",
        title: "Sales Leaders",
        description: "Generate inbound leads, share social selling tips, and establish authority in your industry.",
        painPoint: "sending cold pitches that get ignored instead of attracting inbound prospects",
        solution: "Create educational content that naturally draws in high-value leads.",
        keywords: ["sales", "b2b sales", "closing", "social selling", "lead generation"]
    },
    {
        slug: "real-estate",
        title: "Real Estate Agents",
        description: "Showcase properties, share market insights, and become the go-to real estate expert in your city.",
        painPoint: "relying purely on traditional referrals and struggling to stand out in a saturated digital market",
        solution: "Share market trends and property stories that build trust at scale.",
        keywords: ["real estate", "realtor", "property", "investment", "housing"]
    },
    {
        slug: "designers",
        title: "UI/UX Designers",
        description: "Explain your design process, critique interfaces, and land freelance gigs with high-converting posts.",
        painPoint: "having a great portfolio but struggling to articulate your design decisions in writing",
        solution: "Generate engaging post descriptions to accompany your visual shots.",
        keywords: ["design", "ui", "ux", "figma", "product design"]
    },
    {
        slug: "copywriters",
        title: "Copywriters",
        description: "Beat writer's block, test new hooks, and find fresh angles for your daily LinkedIn content.",
        painPoint: "running out of fresh ideas for your own personal brand while writing for others",
        solution: "Use AI to brainstorm hooks and structure your thoughts instantly.",
        keywords: ["copywriting", "writing", "content creation", "freelance", "wordsmith"]
    },
    {
        slug: "hr-recruiters",
        title: "HR & Recruiters",
        description: "Share hiring tips, company culture, and attract top talent organically instead of sending cold InMails.",
        painPoint: "relying on expensive job boards and ignored InMails to find talent",
        solution: "Build an employer brand that makes talent want to apply to you.",
        keywords: ["hr", "recruiting", "hiring", "culture", "talent acquisition"]
    }
];

export function getNicheBySlug(slug: string): NicheData | undefined {
    return niches.find(n => n.slug === slug);
}
