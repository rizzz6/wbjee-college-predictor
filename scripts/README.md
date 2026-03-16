# Scripts Documentation

This directory contains all build, test, validation, and utility scripts for the WBJEE College Predictor application.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Data Update Workflow](#data-update-workflow)
- [Build Scripts](#build-scripts)
- [Database Scripts](#database-scripts)
- [Validation Scripts](#validation-scripts)
- [SEO Scripts](#seo-scripts)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

This runs in sequence:
1. `build:metadata` - Builds filter metadata from Redis
2. `build:mobile` - Generates mobile slices from Payload
3. `build:desktop` - Builds desktop data from Payload
4. `next build` - Builds Next.js app

---

## Prerequisites

### Required Environment Variables

Create a `.env.local` file with:

```env
# Database (PRIMARY DATA SOURCE - Payload Schema)
DATABASE_URI=postgresql://user:pass@host:port/db?schema=payload

# Upstash Redis (for caching)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

---

## Build Scripts

Located in `scripts/build/`

**Data Source:** All build scripts read from **Payload CMS** (Postgres `payload` schema)

### 1. `build-metadata.ts`
Builds and caches metadata (unique filter values) in Redis for fast access.

### 2. `generate-static-slices.ts`
Generates static JSON slices for mobile devices (one file per college).

### 3. `build-cutoffs-data.ts`
Builds the monolithic cutoff data file for desktop mode.

---

## Database Scripts

Located in `scripts/database/`

### 1. `seed-upstash.ts` ✨ (Primary)
Seeds Redis cache from Payload CMS for the predictor API. Uses Gzip compression.

### 2. `import-from-sheets-url.ts`
Direct Google Sheets → Supabase import.

### 3. `import-from-csv.ts`
Manual CSV → Supabase import.

### 4. `dynamic-sync.ts`
Synchronizes main collection data with Payload's version tables in Postgres.

---

## Validation Scripts

Located in `scripts/validation/`

### 1. `analyze-distribution.ts`
Analyzes college size distribution and record counts.

### 2. `check-duplicates.ts`
Finds duplicate/variant college names for normalization.

### 3. `verify-all-data.ts`
Comprehensive verification of all data in the system.

---

## SEO Scripts

Located in `scripts/seo/`

### `submit-indexnow.mjs`
Submits URLs to search engines via IndexNow protocol (Bing/Yandex).

---

## Troubleshooting

### Scripts Fail to Connect
**Fix:** Ensure `DATABASE_URI` in `.env.local` is correct and includes the `pgbouncer=true` flag if using Supabase pooling.

### Out of Memory
**Fix:** Increase Node.js memory limit:
`NODE_OPTIONS=--max-old-space-size=4096 npm run build`
