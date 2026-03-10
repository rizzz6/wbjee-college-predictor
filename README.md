# r/wbjee Companion

**rwbjee.com** - Your comprehensive WBJEE 2026 companion website  
Find your potential colleges based on WBJEE rank, access cutoff data, important dates, and join the community.

🌐 **Live Site**: [www.rwbjee.com](https://www.rwbjee.com)  
💬 **Community**: [r/wbjee on Reddit](https://www.reddit.com/r/wbjee/)  
🚀 **Discord**: [Join our Discord](https://discord.gg/pTTKPYryDp)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rizzz6/rwbjee-companion)

![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.1-blue?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat&logo=tailwindcss)

---

## 📚 Quick Navigation

**[How It Works](#️-how-it-works)** · **[Features](#-features)** · **[Tech Stack](#-tech-stack)** · **[Performance](#-performance-metrics)** · **[Getting Started](#️-getting-started)** · **[Architecture](#️-architecture)** · **[Contributing](#-contributing)**

---

## 🎯 Key Highlights

- 🚀 **88% Smaller**: Custom flat columnar compression (911 KB → 106 KB)
- ⚡ **0ms Search**: Instant client-side filtering on desktop
- 📱 **Mobile Optimized**: Progressive loading with 5 KB initial payload
- 🎨 **Modern UI**: Glassmorphism with dark mode support
- 📊 **17,000+ Data Points**: Comprehensive WBJEE cutoff data (2022-2025)
- 🔄 **Adaptive Loading**: Smart device-based data strategy
- 🎓 **138+ Colleges**: Information on WBJEE engineering colleges

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

- **138+ Engineering Colleges**: Information on WBJEE participating colleges
- **Multiple Programs**: Program listings with cutoffs across branches
- **College Pages**: Individual pages with fees, placements, and facilities

### 📅 Timeline

- **Important Dates**: WBJEE 2026 exam dates, counseling schedule
- **Notifications**: Never miss a deadline

### 📰 Blog & Resources

- **Latest Updates**: WBJEE news and announcements
- **Guides**: Preparation tips and counseling strategies
- **Payload CMS**: Enterprise-grade content management with custom collections
- **Lexical Editor**: Rich text editing with custom blocks

### 🎉 Easter Eggs & Extras

- **Interactive Elements**: Hidden surprises for engaged users
- **Printing Hack**: Special print-friendly views
- **Dynamic Loading**: Lazy-loaded easter egg manager

### 🌐 Community Integration

- **Reddit Integration**: Fetches latest posts from r/wbjee
- **Discord Community**: Active discussion platform
- **Social Links**: Quick access to community resources

---

## 🏗️ How It Works

The application uses a **hybrid data strategy** that adapts to your device:

```mermaid
graph TD
    User[User Visits Cutoff Finder] --> Check{Device Type?}

    Check -->|Desktop| D_Fetch
    Check -->|Mobile| M_Index

    subgraph Desktop[" "]
        D_Fetch[Download Full Dataset<br/>106 KB compressed]
        D_Fetch --> D_Load[Load 17,179 Records<br/>into Memory]
        D_Load --> D_Search[0ms Search<br/>No API Calls]
    end

    subgraph Mobile[" "]
        M_Index[Download College List<br/>5 KB]
        M_Index --> M_Select[User Selects College]
        M_Select --> M_Fetch[Fetch College Data<br/>~5-33 KB per college]
    end

    style Desktop stroke:#1976d2,stroke-width:3px
    style Mobile stroke:#f57c00,stroke-width:3px
    style D_Search stroke:#4caf50,stroke-width:3px
```

**How it works:**

- **Blue box (Desktop)**: Download everything once (106 KB) → 0ms instant search
- **Orange box (Mobile)**: Download only what you need (5-33 KB per college)
- Both paths provide the same data, optimized for different contexts

---

## 📸 Screenshots

### Desktop Predictor - Data Table View

Real-time college predictions with instant filtering (Rank: 5000 shown as example)

![Desktop Predictor](./public/screenshots/desktop-predictor.png)

### Mobile Predictor - Card Layout

Responsive mobile interface with card-based results

<img src="./public/screenshots/mobile-predictor.png" alt="Mobile Cards" width="400"/>

### Cutoff Finder Tool

Advanced filtering with real data (Jadavpur University CSE - Opening: 22, Closing: 89)

![Cutoff Finder](./public/screenshots/cutoff-finder.png)

---

## 🚀 Tech Stack

### Frontend

- **Framework**: Next.js 16.0.7 (App Router)
- **Language**: TypeScript 5
- **React**: 19.2.1
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion 12
- **Icons**: Lucide React, Heroicons, React Icons
- **State Management**: React Hooks, SWR 2.3.8

### Backend & Data

- **Database**: Supabase (PostgreSQL) 2.89.0
- **CMS**: Payload CMS 3.79.0
- **Media Storage**: AWS S3 (via @payloadcms/storage-s3)
- **Caching**: Upstash Redis 1.35.7
- **Data Compression**: Flat Columnar JSON (custom implementation)
- **Charts**: Chart.js 4.5.0 with react-chartjs-2
- **Date Utilities**: date-fns 4.1.0

### Deployment & Analytics

- **Hosting**: Vercel (Edge Network)
- **Analytics**: Vercel Analytics 1.5.0, Vercel Speed Insights 1.2.0
- **Tag Manager**: Google Tag Manager (@next/third-parties)
- **SEO**: Next.js Metadata API, OpenGraph, Twitter Cards
- **Theme**: next-themes 0.4.6 (Dark mode support)

### Performance Optimizations

- **Adaptive Loading**: Device-based data loading strategy
- **Flat Columnar Compression**: 88% file size reduction (911 KB → 106 KB)
- **Brotli Compression**: Automatic server-side compression
- **Code Splitting**: Dynamic imports for optimal bundle size
- **Image Optimization**: Next.js Image component

---

## 📊 Performance Metrics

### 🏆 Lighthouse Scores (Varies by Environment)

> Scores depend on network conditions, device, and deployment environment. Production on Vercel typically performs better than local development.

### ⚡ Core Web Vitals (Development)

- **First Contentful Paint (FCP)**: ~1.1s
- **Largest Contentful Paint (LCP)**: ~2.7s
- **Total Blocking Time (TBT)**: ~410ms
- **Cumulative Layout Shift (CLS)**: 0 (Perfect!)
- **Speed Index**: ~1.4s

> **Note**: Production performance on Vercel's edge network is typically better due to CDN caching, Brotli compression, and edge optimization. These metrics are from local development testing.

### Desktop Cutoff Finder

- **File Size**: 106 KB (Brotli compressed) - _88% reduction from 911 KB_
- **Search Speed**: **0ms** (instant client-side)
- **API Calls**: **0** (all data loaded upfront)
- **Data Points**: 17,179 cutoff combinations
- **Loading Strategy**: Monolith JSON with flat columnar compression

### Mobile Cutoff Finder

- **Initial Load**: 5 KB (colleges index)
- **Progressive Loading**: On-demand program data via static slices
- **Optimized for**: 2G/3G networks
- **Loading Strategy**: Atomic static slicing

### Recent Optimizations ✨

- ✅ **Flat Columnar Compression**: Custom JSON format (88% size reduction)
- ✅ **Atomic Static Slicing**: Per-college JSON files for mobile
- ✅ **Brotli Compression**: Automatic server-side compression on Vercel
- ✅ **Code Splitting**: Dynamic imports for optimal bundle size
- ✅ **LazyMotion**: Reduced Framer Motion bundle size
- ✅ **Adaptive Loading**: Device-based data strategy

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account (PostgreSQL)
- AWS S3 compatible storage (for media)

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

Create `.env.local` with the following variables:

| Variable                        | Description                  | Required for Dev? | Notes                              |
| ------------------------------- | ---------------------------- | ----------------- | ---------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase API endpoint        | ✅ Yes            | Get from Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public client key   | ✅ Yes            | Safe for client-side use           |
| `DATABASE_URI`                  | PostgreSQL connection string | ✅ Yes            | Used by Payload CMS                |
| `PAYLOAD_SECRET`                | Payload secret key           | ✅ Yes            | Random string for security         |
| `S3_BUCKET`                     | S3 bucket name               | 🖼️ For media      | Optional in dev                    |
| `S3_ACCESS_KEY_ID`              | S3 access key                | 🖼️ For media      | Optional in dev                    |
| `S3_SECRET_ACCESS_KEY`          | S3 secret key                | 🖼️ For media      | Optional in dev                    |
| `S3_REGION`                     | S3 region                    | 🖼️ For media      | Default: `ap-south-1`              |
| `S3_ENDPOINT`                   | S3 endpoint                  | 🖼️ For media      | For R2/Wasabi/Localstack           |
| `UPSTASH_REDIS_REST_URL`        | Upstash Redis endpoint       | ⚡ For caching    | Optional, improves API performance |
| `UPSTASH_REDIS_REST_TOKEN`      | Upstash Redis token          | ⚡ For caching    | Pairs with the URL above           |
| `NEXT_PUBLIC_GTM_ID`            | Google Tag Manager ID        | 📊 Analytics      | Optional, for tracking             |

**Example `.env.local`:**

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
DATABASE_URI="postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"
PAYLOAD_SECRET="your-payload-secret"

# Optional
S3_BUCKET="your-bucket"
UPSTASH_REDIS_REST_URL="https://your-db.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
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
│   │   ├── (app)/                # Main application routes
│   │   │   ├── (legal)/          # Legal pages
│   │   │   ├── (resources)/      # Resources (blog, colleges, timeline)
│   │   │   │   ├── blog/         # Blog powered by Payload
│   │   │   │   ├── colleges/     # College profiles
│   │   │   │   └── timeline/     # WBJEE schedule
│   │   │   └── (tools)/          # Predictor & Cutoff tools
│   │   ├── (payload)/            # Payload CMS Admin Panel
│   │   ├── api/                  # Backend API routes
│   │   ├── layout.tsx            # Global layout
│   │   └── page.tsx              # Homepage
│   ├── collections/              # Payload CMS Collections
│   │   ├── Colleges.ts
│   │   ├── CollegeCutoffs.ts
│   │   ├── Posts.ts (Blog)
│   │   └── Timeline.ts
│   ├── components/               # UI & Feature Components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Shared libraries (Payload client)
│   ├── utils/                    # Utility functions
│   └── middleware.ts             # Device detection
├── scripts/                      # Build & Maintenance Scripts
│   ├── build/                    # Data generation
│   │   ├── build-metadata.ts     # Generate metadata lookup
│   │   ├── build-cutoffs-data.ts # Generate desktop data
│   │   ├── generate-static-slices.ts # Generate mobile slices
│   │   └── config.ts             # Build configuration
│   ├── database/                 # Migrations & seeding
│   │   ├── migrate-to-supabase.ts
│   │   └── seed-upstash.ts
│   ├── data-quality/             # Data normalization
│   │   └── normalize-cutoff-names.ts
│   ├── validation/               # Testing & verification
│   │   ├── test-static-slicing.ts
│   │   ├── test-upstash.ts
│   │   ├── analyze-distribution.js
│   │   ├── check-duplicates.js
│   │   ├── compare-colleges.js
│   │   └── verify-normalization.js
│   └── seo/                      # SEO utilities
│       └── submit-indexnow.mjs   # IndexNow submission
├── public/
│   ├── data/                     # Generated mobile slices
│   ├── assets/                   # Static images & files
│   ├── cutoffs-data.json         # Desktop compressed data (465KB)
│   ├── data.json                 # Full data (6.8MB, for reference)
│   └── robots.txt                # SEO robots file
├── supabase/
│   └── schema.sql                # Database schema
├── docs/                         # Documentation
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── payload.config.ts             # Payload CMS configuration
└── [other config files]
```

---

## 🔧 Available Scripts

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm start                      # Start production server
npm run lint                   # Run ESLint & Oxlint

# Payload CMS
npm run generate:importmap     # Update Payload admin import map

# Data Management
npm run seed:payload:colleges  # Seed colleges to Payload
npm run seed:payload:cutoffs   # Seed cutoffs to Payload
npm run build:metadata         # Generate metadata lookup
npm run build:mobile           # Generate static slices for mobile
npm run build:desktop          # Generate cutoffs-data.json for desktop

# Testing & Validation
npm run test:mobile            # Test static slicing implementation

# Utilities
npm run indexnow               # Submit URLs to IndexNow
npm run seed:upstash           # Seed Redis cache
```

---

## 🏗️ Architecture

### Hybrid Adaptive Loading Strategy

The application uses a **device-based data loading strategy** that optimizes for both desktop and mobile experiences:

```mermaid
graph TD
    User[User Visits Cutoff Finder] --> Check{Device Type?}

    Check -->|Desktop| D_Fetch
    Check -->|Mobile| M_Fetch

    subgraph Desktop[" "]
        D_Fetch[Fetch Monolith JSON<br/>106 KB Brotli]
        D_Fetch --> D_Decompress[Decompress Flat Columnar Data]
        D_Decompress --> RAM[Load 17,179 Rows into RAM]
        RAM --> D_Filter[Instant Client-Side Filtering<br/>0ms Search]
        D_Filter --> D_UI[Render Data Table]
    end

    subgraph Mobile[" "]
        M_Fetch[Fetch Index JSON<br/>5 KB]
        M_Fetch --> M_UI[Render College Dropdown]
        M_UI --> M_Slice[Fetch Static Slice<br/>e.g., jadavpur.json]
        M_Slice --> M_Render[Render Program Cards]
        M_Render -->|Change College| M_Slice
    end

    style Desktop stroke:#1976d2,stroke-width:3px
    style Mobile stroke:#f57c00,stroke-width:3px
    style D_Filter fill:#4caf50,color:#fff
    style M_Slice fill:#ff9800,color:#fff
```

### Desktop (Fast Networks)

- **Strategy**: Load entire dataset upfront
- **File**: `cutoffs-data.json` (106 KB compressed, 465 KB raw)
- **Format**: Flat Columnar JSON (custom compression)
- **Benefit**: Zero-latency filtering, perfect for data exploration
- **Trade-off**: Larger initial payload, but instant UX afterward

### Mobile (Slow Networks)

- **Strategy**: Lazy loading with static slices
- **Initial**: `data/index.json` (5 KB) - Just college names
- **On-Demand**: `data/{college-slug}.json` (~5-33 KB per college)
- **Benefit**: Minimal initial load, targeted data fetching
- **Trade-off**: Slight delay when switching colleges

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

- **88% file size reduction** (911 KB → 106 KB)
- Instant client-side decoding
- Still JSON (debuggable, no binary format)
- Automatic Brotli compression on Vercel
- Deduplicates repeated strings (college/program names)

### API Architecture

```mermaid
graph LR
    Client[Client] --> API[API Routes]
    API --> Cache{Redis Cache?}
    Cache -->|Hit| Return[Return Cached]
    Cache -->|Miss| DB[Payload CMS / Postgres]
    DB --> Store[Store in Redis]
    Store --> Return

    style Cache fill:#ff6b6b
    style DB fill:#4ecdc4
```

- **Caching Layer**: Upstash Redis for frequently accessed data
- **Database**: PostgreSQL (Supabase) via Payload CMS
- **CMS**: Payload CMS for blog and dynamic content
- **Static Generation**: Pre-built JSON files for cutoff data

---

## 🎨 Design System

### Colors

- **Custom HSL Palette**: Carefully curated color scheme with dark mode support
- **Theme Switching**: Powered by next-themes 0.4.6
- **Glassmorphism**: Modern glass-effect UI components
- **Accessibility**: WCAG AA compliant color contrast ratios

### Typography

- **Primary Font**: Inter (Google Fonts)
- **Font Weights**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- **Responsive Sizing**: Fluid typography scales with viewport

### Components

- **Reusable UI Library**: Buttons, inputs, dropdowns, cards
- **Feature Components**: Searchable dropdowns, animated counters, smart breadcrumbs
- **Layout Components**: Responsive navbar with mobile animations, footer, page hero

### Animations

- **Library**: Framer Motion 12 with LazyMotion for reduced bundle size
- **Micro-interactions**: Subtle hover effects, smooth transitions
- **Mobile Menu**: Slide-down and fade-in animations
- **Performance**: GPU-accelerated transforms

### Responsive Design

- **Mobile-First**: Designed for small screens, enhanced for large
- **Breakpoints**: Tailwind CSS 4 default breakpoints
- **Adaptive Components**: Different layouts for mobile vs desktop
- **Touch-Friendly**: Large tap targets, smooth scrolling

---

## 🧪 Testing & Validation

The application has been comprehensively tested across multiple dimensions:

### ✅ Functional Testing

- **Desktop Cutoff Finder**: Multiple colleges tested, instant filtering verified
- **Mobile Cutoff Finder**: Lazy loading and static slicing verified
- **Predictor Tool**: Rank-based predictions across all categories
- **Cascading Filters**: Program dropdown updates on college selection
- **Reset Functionality**: All filters clear properly
- **Favorites System**: Add/remove colleges, persistent across sessions

### ⚡ Performance Testing

- **Zero API Calls**: Desktop search confirmed via Network tab (0 requests)
- **File Size Verification**: 106 KB Brotli compression confirmed
- **Load Time Testing**: Varies by network and deployment environment
- **Static Slice Generation**: Verified colleges have individual JSON files

### ♿ Accessibility Testing

- **ARIA Labels**: All interactive elements properly labeled
- **Color Contrast**: WCAG AA compliance verified
- **Keyboard Navigation**: Full keyboard support for all features
- **Screen Reader**: Compatible with NVDA and JAWS
- **Heading Hierarchy**: Logical H1-H6 structure maintained

### 📱 Device Testing

- **Desktop Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Devices**: iOS Safari, Chrome Android
- **Responsive Breakpoints**: 320px - 2560px tested
- **Touch Interactions**: Verified on actual mobile devices

### 🔍 SEO Validation

- **Meta Tags**: All pages have proper title, description, OG tags
- **Sitemap**: Auto-generated sitemap with dynamic content
- **Robots.txt**: Properly configured crawl directives
- **Structured Data**: Schema.org markup for colleges
- **IndexNow**: Automatic URL submission on content updates

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

## 📈 SEO & Discoverability

### Meta Tags & Social Sharing

- **Dynamic Metadata**: Unique title, description for each page via Next.js Metadata API
- **OpenGraph Tags**: Rich preview cards for Facebook, LinkedIn
- **Twitter Cards**: Optimized for Twitter/X sharing with large images
- **Canonical URLs**: Proper URL canonicalization to avoid duplicate content
- **Robots Meta**: Page-level control over indexing and following

### Structured Data

- **Schema.org Markup**: Organization, WebSite, Article, FAQ schemas
- **JSON-LD**: Machine-readable structured data in `<head>`
- **Rich Snippets**: Enhanced search results with star ratings, dates

### Technical SEO

- **Sitemap**: Auto-generated XML sitemap (`/sitemap.xml`) with dynamic content
- **Robots.txt**: Search engine crawl directives (`/robots.txt`)
- **IndexNow**: Automatic URL submission to search engines on content updates
- **Page Speed**: Optimized Core Web Vitals for search ranking
- **Mobile-Friendly**: Responsive design passes Google Mobile-Friendly test

### Content SEO

- **Heading Hierarchy**: Proper H1-H6 structure on all pages
- **Alt Text**: All images have descriptive alt attributes
- **Internal Linking**: Smart breadcrumbs and contextual links
- **Content Length**: Comprehensive pages with 500+ words where relevant
- **Fresh Content**: Blog with regular updates via Payload CMS

### Local SEO

- **Target Audience**: WBJEE students in West Bengal, India
- **Regional Keywords**: "WBJEE 2026", "West Bengal engineering colleges"
- **Language**: English (primary) with localized content

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

**Copyright © 2024-2025 rizzz6. All Rights Reserved.**

This project is proprietary software.

- **Source Code**: The source code is available for viewing and educational purposes only. You may **not** use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software.
- **Commercial Use**: Strictly prohibited.
- **Derivatives**: You may not create derivative works based on this code.

For licensing inquiries or permissions, please contact via [Reddit](https://www.reddit.com/user/rizzz6/).

---

## ⚖️ Legal Disclaimer

**1. Data Ownership:**  
All college data, cutoff ranks, and seat information are the intellectual property of the **West Bengal Joint Entrance Examinations Board (WBJEEB)**. This data is used here for educational and informational purposes only. This project is not affiliated with, endorsed by, or connected to WBJEEB.

**2. No Warranty:**  
This tool is a predictor based on historical trends. The developers make no claims regarding the accuracy of predictions for the current year. Users should verify all information with official sources before making counseling decisions.

**3. Use at Your Own Risk:**  
The information provided by this tool is for guidance only. Always consult official WBJEE counseling resources and announcements for authoritative information.

---

## 🙏 Acknowledgments

### Data & Community

- **Data Source**: Official WBJEE cutoff data from West Bengal Joint Entrance Examinations Board
- **Community**: r/wbjee Reddit community and Discord server members
- **Inspiration**: Built for and inspired by WBJEE 2026 aspirants

### Technology

- **Frameworks**: Next.js 16 team, React 19 team, Vercel
- **Infrastructure**: Supabase, Payload CMS (Postgres), AWS S3, Upstash
- **Styling**: Tailwind CSS team
- **Animation**: Framer Motion
- **Icons**: Lucide, Heroicons teams

### Special Thanks

- Contributors to open-source libraries used in this project
- The Next.js, React, and Vercel teams for excellent documentation

---

## Contact

- **Website**: [www.rwbjee.com](https://www.rwbjee.com)
- **Reddit Community**: [r/wbjee](https://www.reddit.com/r/wbjee/)
- **Developer**: [u/rizzz6 on Reddit](https://www.reddit.com/user/rizzz6/)
- **Discord**: [Join our Discord](https://discord.gg/pTTKPYryDp)

---

**Made to simplify the WBJEE journey. Good luck!**
