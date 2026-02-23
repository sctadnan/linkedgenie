# 🧞 LinkedGenie — AI LinkedIn Content Suite

**LinkedGenie** is a high-performance, minimalist AI toolkit designed to help professionals dominate LinkedIn. It automates content creation, profile optimization, and networking engagement using GPT-4o-mini, all while maintaining a lightweight, no-framework architecture for maximum speed and SEO.

## ✨ Features

- **✍️ Smart Post Generator**: 8+ specialized templates (Storytelling, Educational, Motivational, etc.) + Rewrite & Hook modes.
- **👤 Profile Optimizer**: Craft compelling headlines, "About" sections, and achievement-focused experience descriptions.
- **📩 Message Architect**: Generate personalized connection requests, follow-ups, and thank-you notes.
- **💬 Engagement Suite**: Intelligent comment replies to build relationships and boost visibility.
- **🌍 Multi-language Support**: Fully localized in English, Spanish, Portuguese, French, German, and Arabic (RTL).
- **🛡️ Production Ready**: Includes rate limiting, circuit breakers for AI calls, and a built-in admin dashboard.

## 🛠 Tech Stack

- **Frontend**: Vanilla HTML5, CSS3 (Modern Variables), and Vanilla JavaScript (No frameworks, no build step).
- **Backend**: Node.js Vercel Serverless Functions.
- **Database**: Upstash Redis (Vercel KV) for usage tracking and auth.
- **Auth**: Google Identity Services (GSI).
- **AI**: OpenAI API (GPT-4o-mini).
- **Infrastructure**: Vercel (Hosting, Cron Jobs, Serverless).

## 🚀 Performance & SEO

LinkedGenie is built with a "Performance First" philosophy:
- **Core Web Vitals**: Zero framework overhead ensures near-instant LCP and FID.
- **Semantic HTML**: Optimized for Google Crawlers with proper heading hierarchies and Schema.org markup.
- **Responsive**: Mobile-first design that scales perfectly across all devices.

## 📦 Deployment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/linkedgenie-v2.git
   ```
2. **Set Environment Variables**:
   Create a `.env` file or set them in Vercel:
   - `OPENAI_API_KEY`: Your OpenAI key.
   - `UPSTASH_REDIS_REST_KV_REST_API_URL`: Your Upstash URL.
   - `UPSTASH_REDIS_REST_KV_REST_API_TOKEN`: Your Upstash token.
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID.
   - `ADMIN_SECRET`: Secret key for the admin dashboard.

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with ❤️ by [sctadnan](https://github.com/sctadnan)*
