# r/wbjee Companion

**rwbjee.com** - Your comprehensive WBJEE 2026 companion website  
Find your potential colleges based on WBJEE rank, access cutoff data, important dates, and join the community.

🌐 **Live Site**: [www.rwbjee.com](https://www.rwbjee.com)  
💬 **Community**: [r/wbjee on Reddit](https://www.reddit.com/r/wbjee/)  
🚀 **Discord**: [Join our Discord](https://discord.gg/pTTKPYryDp)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rizzz6/rwbjee-companion)

---

## ✨ Features

### 🎯 College Predictor
- **Instant Predictions**: Enter your WBJEE rank and get real-time college predictions
- **Smart Filtering**: Filter by branch, category, location, and more
- **Favorites System**: Save and compare your preferred colleges
- **17,000+ Data Points**: Comprehensive cutoff data from 2022-2025

### 📊 Cutoff Finder
- **Adaptive Loading**: Optimized for both desktop and mobile
  - **Desktop**: Instant client-side search with 106 KB compressed data (88% reduction)
  - **Mobile**: Lazy loading with progressive API calls
- **Advanced Filters**: Search by college, program, year, category, round, and seat type
- **Zero Latency**: Desktop searches complete in 0ms (no API calls)

### 🏛️ College Database
- **138 Engineering Colleges**: Detailed information on all WBJEE participating colleges
- **168 Programs**: Complete program listings with cutoffs
- **College Pages**: Individual pages with fees, placements, and facilities

### 📅 Timeline
- **Important Dates**: WBJEE 2026 exam dates, counseling schedule
- **Notifications**: Never miss a deadline

### 📰 Blog & Resources
- **Latest Updates**: WBJEE news and announcements
- **Guides**: Preparation tips and counseling strategies
- **Sanity CMS**: Easy content management

---

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion (LazyMotion)
- **State Management**: React Hooks, SWR

### Backend & Data
- **Database**: Supabase (PostgreSQL)
- **CMS**: Sanity.io
- **Caching**: Redis (Upstash)
- **Data Compression**: Flat Columnar JSON (custom implementation)

### Deployment & Analytics
- **Hosting**: Vercel (Edge Network)
- **Analytics**: Vercel Analytics, Google Tag Manager
- **SEO**: Next.js Metadata API, OpenGraph, Twitter Cards

### Performance Optimizations
- **Adaptive Loading**: Device-based data loading strategy
- **Flat Columnar Compression**: 88% file size reduction (911 KB → 106 KB)
- **Brotli Compression**: Automatic server-side compression
- **Code Splitting**: Dynamic imports for optimal bundle size
- **Image Optimization**: Next.js Image component

---

## 📊 Performance Metrics

### Desktop Cutoff Finder
- **File Size**: 106 KB (Brotli compressed)
- **Search Speed**: 0ms (instant client-side)
- **API Calls**: 0 (all data loaded upfront)
- **Data Points**: 17,179 cutoff combinations

### Mobile Cutoff Finder
- **Initial Load**: 5 KB (colleges index)
- **Progressive Loading**: On-demand program data
- **Optimized for**: 2G/3G networks

### Overall
- **Lighthouse Score**: 95+ (Performance)
- **First Contentful Paint**: <1s
- **Time to Interactive**: <2s

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Supabase account
- Sanity.io account (optional, for blog)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/wbjee_college_predictor.git
cd wbjee_college_predictor

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

### Environment Variables

Create `.env.local` with the following:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SECRET_KEY="your-secret-key"

# Sanity CMS (optional)
NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_TOKEN="your-token"

# Upstash Redis (optional, for caching)
UPSTASH_REDIS_REST_URL="https://your-db.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Analytics (optional)
NEXT_PUBLIC_GTM_ID="GTM-XXXXXXXX"
```

### Database Setup

```bash
# Run Supabase migrations (if using Supabase locally)
# Or import the schema from supabase/schema.sql

# Seed the database with cutoff data
npm run migrate:supabase
```

### Build Data Files

```bash
# Generate compressed cutoff data
npm run build:metadata

# Generate colleges-programs index
npm run build:colleges
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 📁 Project Structure

```
wbjee_college_predictor/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (legal)/              # Legal pages (privacy, disclaimer, FAQ)
│   │   ├── (resources)/          # Resources (blog, colleges, timeline)
│   │   ├── (tools)/              # Tools (predictor, cutoffs, rank-finder)
│   │   ├── api/                  # API routes
│   │   └── layout.tsx
│   ├── components/               # Feature-based Components
│   │   ├── content/              # Tables, FAQ, Socials
│   │   ├── eastereggs/           # Interactive elements
│   │   ├── features/             # Business logic (Search, Filters)
│   │   ├── layout/               # Navbar, Footer, PageHero
│   │   └── ui/                   # Reusable UI (Buttons, Inputs)
│   ├── hooks/                    # Custom React hooks
│   │   ├── cutoffs/              # Cutoff tool specific hooks
│   │   ├── predictor/            # Predictor tool specific hooks
│   │   └── useFavorites.ts       # Shared hooks
│   ├── utils/                    # Utilities
│   │   ├── api/                  # API helpers & proxy
│   │   ├── compression/          # Flat columnar compression
│   │   └── database/             # Supabase client
│   ├── sanity/                   # Sanity CMS config
│   └── middleware.ts             # Device detection
├── scripts/                      # Build & Maintenance Scripts
│   ├── build/                    # Data generation (metadata, mobile)
│   ├── database/                 # Migrations & seeding
│   ├── validation/               # Testing & verification
│   └── seo/                      # IndexNow & sitemaps
├── public/
│   ├── data/                     # Generated mobile slices
│   ├── assets/                   # Static images & files
│   ├── cutoffs-data.json         # Desktop compressed data
│   └── colleges-programs.json    # Programs index
├── supabase/
│   └── schema.sql                # Database schema
└── [config files]
```

---

## 🔧 Available Scripts

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm start                      # Start production server
npm run lint                   # Run ESLint

# Data Management
npm run build:metadata         # Generate cutoffs-data.json
npm run build:colleges         # Generate colleges-programs.json
npm run migrate:supabase       # Migrate data to Supabase
npm run fix:duplicates         # Normalize institute/program names

# Utilities
npm run indexnow              # Submit URLs to IndexNow
npm run seed:upstash          # Seed Redis cache
```

---

## 🏗️ Architecture

### Adaptive Loading Strategy

The application uses device-based data loading:

**Desktop (Fast Networks)**:
- Loads entire dataset upfront (106 KB compressed)
- Instant client-side filtering and search
- Zero API calls for search operations
- Optimized for data exploration

**Mobile (Slow Networks)**:
- Lazy loading with progressive API calls
- Initial load: 5 KB colleges index
- On-demand program data fetching
- Optimized for targeted lookup

### Data Compression

**Flat Columnar Format**:
```json
{
  "lookup": {
    "C": ["College 1", "College 2", ...],
    "P": ["Program 1", "Program 2", ...],
    "Y": [2022, 2023, 2024, 2025]
  },
  "data": {
    "c": [0, 0, 1, 1, ...],  // College indices
    "p": [0, 1, 0, 1, ...],  // Program indices
    "o": [5, 45, 200, ...],  // Opening ranks
    "k": [13, 67, 250, ...]  // Closing ranks
  }
}
```

**Benefits**:
- 88% file size reduction (911 KB → 106 KB)
- Instant client-side decoding
- Still JSON (debuggable, no binary format)
- Automatic Brotli compression on Vercel

---

## 🎨 Design System

- **Colors**: Custom HSL palette with dark mode support
- **Typography**: Inter font family
- **Components**: Reusable UI components with Tailwind
- **Animations**: Subtle micro-interactions with Framer Motion
- **Responsive**: Mobile-first design

---

## 🧪 Testing

The application has been comprehensively tested:

- ✅ Desktop cutoff finder (multiple colleges tested)
- ✅ Mobile cutoff finder (lazy loading verified)
- ✅ Cascading filters (program updates on college change)
- ✅ Reset functionality
- ✅ Zero API calls for desktop search (confirmed via Network tab)
- ✅ File size verification (106 KB Brotli)

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy

Vercel automatically:
- Enables Brotli compression
- Serves static files via CDN
- Handles serverless functions

### Manual Deployment

```bash
npm run build
npm start
```

---

## 📈 SEO

- **Meta Tags**: Dynamic title, description, keywords
- **OpenGraph**: Social media preview cards
- **Twitter Cards**: Twitter-specific metadata
- **Canonical URLs**: Proper URL canonicalization
- **Sitemap**: Auto-generated sitemap
- **Robots.txt**: Search engine directives

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is private and not licensed for public use.

---

## 🙏 Acknowledgments

- **Data Source**: WBJEE official cutoff data
- **Community**: r/wbjee Reddit community
- **Built with**: Next.js, Supabase, Sanity, Vercel
- **Inspired by**: WBJEE 2026 aspirants

---

## 📞 Contact

- **Website**: [www.rwbjee.com](https://www.rwbjee.com)
- **Reddit**: [r/wbjee](https://www.reddit.com/r/wbjee/)
- **Discord**: [Join our Discord](https://discord.gg/pTTKPYryDp)

---

**Made with ❤️ for WBJEE 2026 aspirants**