# r/wbjee companion

**rwbjee** - Your comprehensive WBJEE 2026 companion website  
Find your potential colleges based on WBJEE rank, access cutoff data, important dates, and join the community.

🌐 **Live Site**: [www.rwbjee.com](https://www.rwbjee.com)  
💬 **Community**: [r/wbjee on Reddit](https://www.reddit.com/r/wbjee/)  
🚀 **Discord**: [Join our Discord](https://discord.gg/pTTKPYryDp)

---

## Features

- **🎯 College Predictor**: Enter your WBJEE rank and get instant predictions for engineering colleges
- **📊 Cutoff Analysis**: Historical cutoff data (2023-2024) with trend charts
- **🏛️ College Database**: Comprehensive information on engineering and pharmacy colleges  
- **📅 Timeline**: Important WBJEE dates and deadlines
- **📰 Blog**: Latest updates and resources
- **🔍 Rank Finder**: Reverse lookup to find ranks for specific colleges/branches

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **CMS**: Sanity.io
- **Database**: Upstash Redis
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics, Google Tag Manager

---

## Getting Started

### Prerequisites
- Node.js 20+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# Copy .env.local.example to .env.local and fill in your values
# See UPSTASH_SETUP.md for Upstash Redis setup

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

---

## Environment Variables

Required environment variables (create `.env.local`):

```bash
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_TOKEN="your-token"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://your-db.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Analytics (optional)
NEXT_PUBLIC_GTM_ID="GTM-XXXXXXXX"
```

See `UPSTASH_SETUP.md` for detailed setup instructions.

---

## Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (legal)/         # Legal pages (privacy, disclaimer, FAQ)
│   │   ├── (resources)/     # Resource pages (blog, colleges, timeline)
│   │   ├── (tools)/         # Tools (predictor, rank finder)
│   │   ├── api/             # API routes
│   │   ├── components/      # Shared components
│   │   └── layout.tsx       # Root layout
│   ├── hooks/               # Custom React hooks
│   └── sanity/              # Sanity CMS configuration
├── public/                  # Static assets
├── scripts/                 # Utility scripts
└── [config files]           # Next.js, TypeScript, Tailwind configs
```

---

## Contributing

This is primarily a personal project, but suggestions and bug reports are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is private and not licensed for public use.

---

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Content managed with [Sanity](https://www.sanity.io/)
- Deployed on [Vercel](https://vercel.com/)
- Community at [r/wbjee](https://www.reddit.com/r/wbjee/)

---

**Made with ❤️ for WBJEE 2026 aspirants**