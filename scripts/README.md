# Scripts Documentation

This directory contains all build, test, validation, and utility scripts for the WBJEE College Predictor application.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Build Scripts](#build-scripts)
- [Test Scripts](#test-scripts)
- [Validation Scripts](#validation-scripts)
- [Database Scripts](#database-scripts)
- [SEO Scripts](#seo-scripts)
- [Data Quality Scripts](#data-quality-scripts)
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
1. `build:metadata` - Builds filter metadata
2. `build:mobile` - Generates mobile slices
3. `build:desktop` - Builds desktop data
4. `next build` - Builds Next.js app

---

## Prerequisites

### Required Environment Variables

Create a `.env.local` file with:

```env
# Supabase (for build scripts)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SECRET_KEY=your_service_role_key

# Upstash Redis (for metadata caching)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### Required Tools
- Node.js 20+
- npm or pnpm
- tsx (installed as dev dependency)

---

## Build Scripts

Located in `scripts/build/`

### 1. `build-metadata.ts`

**Purpose:** Builds and caches metadata (unique filter values) in Redis for fast access.

**Usage:**
```bash
npm run build:metadata
```

**What it does:**
1. Fetches master cutoff data from Redis
2. Decompresses gzip data
3. Extracts unique values for:
   - Colleges
   - Programs
   - Years
   - Categories
   - Rounds
   - Seat Types
4. Stores metadata in Redis with 1-year expiry

**Output:**
- Redis key: `metadata` (gzipped JSON)
- Console: Verification message

**Prerequisites:**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

---

### 2. `generate-static-slices.ts`

**Purpose:** Generates static JSON slices for mobile devices (one file per college).

**Usage:**
```bash
npm run build:mobile
```

**What it does:**
1. Fetches all cutoff data from Supabase
2. Groups data by college
3. Creates compressed JSON files:
   - `public/data/colleges/{slug}.json` (one per college)
   - `public/data/mobile-index.json` (college list)
4. Uses **atomic writes** to prevent partial deployments

**Output:**
- `public/data/colleges/*.json` (~3-8KB each)
- `public/data/mobile-index.json` (~2KB)

**Features:**
- ✅ Atomic writes (temp directory → rename)
- ✅ Cleanup on interruption (SIGINT/SIGTERM)
- ✅ Validation (no empty/undefined files)

**Prerequisites:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### 3. `build-cutoffs-data.ts`

**Purpose:** Builds the monolithic cutoff data file for desktop mode.

**Usage:**
```bash
npm run build:desktop
```

**What it does:**
1. Fetches all cutoff data from Supabase
2. Builds lookup tables for compression
3. Creates columnar compressed format
4. Writes to `public/cutoffs-data.json`

**Output:**
- `public/cutoffs-data.json` (~300KB compressed)

**Format:**
```json
{
  "lookup": {
    "C": ["College 1", "College 2", ...],
    "P": ["Program 1", "Program 2", ...],
    ...
  },
  "data": {
    "c": [0, 1, 0, ...],  // College indices
    "p": [0, 1, 2, ...],  // Program indices
    ...
  }
}
```

**Prerequisites:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### 4. `config.ts`

**Purpose:** Shared configuration constants for build scripts.

**Exports:**
```typescript
export const FETCH_BATCH_SIZE = 1000;
export const TABLES = {
    CUTOFFS: 'cutoffs',
    METADATA: 'metadata',
} as const;
```

**Usage:**
```typescript
import { FETCH_BATCH_SIZE, TABLES } from './config';
```

---

## Test Scripts

Located in `scripts/test/`

### `fuzz-test.ts`

**Purpose:** Automated tests for data corruption resilience.

**Usage:**
```bash
npx tsx scripts/test/fuzz-test.ts
```

**What it tests:**
1. ✅ Out of bounds array indices
2. ✅ Column length mismatches
3. ✅ Negative indices
4. ✅ Empty data arrays
5. ✅ Valid data (baseline)

**Expected Output:**
```
🧪 Running Fuzz Tests for Data Corruption Handling

✅ PASS: Out of Bounds Index
✅ PASS: Column Length Mismatch
✅ PASS: Valid Data
✅ PASS: Empty Data
✅ PASS: Negative Index

==================================================
✅ Passed: 5
❌ Failed: 0
==================================================
```

**Exit Codes:**
- `0` - All tests passed
- `1` - Some tests failed

---

## Validation Scripts

Located in `scripts/validation/`

### 1. `test-static-slicing.ts`

**Purpose:** Validates mobile slice generation.

**Usage:**
```bash
npm run test:mobile
```

**What it validates:**
- All colleges have corresponding JSON files
- No empty files
- No undefined slugs
- JSON structure is valid

---

### 2. `test-upstash.ts`

**Purpose:** Tests Redis connection and data retrieval.

**Usage:**
```bash
npx tsx scripts/validation/test-upstash.ts
```

**Prerequisites:**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

---

### 3. `check-duplicates.js`

**Purpose:** Checks for duplicate cutoff entries.

**Usage:**
```bash
node scripts/validation/check-duplicates.js
```

---

### 4. `compare-colleges.js`

**Purpose:** Compares college data across different sources.

**Usage:**
```bash
node scripts/validation/compare-colleges.js
```

---

### 5. `analyze-distribution.js`

**Purpose:** Analyzes the distribution of cutoff data.

**Usage:**
```bash
node scripts/validation/analyze-distribution.js
```

---

### 6. `verify-normalization.js`

**Purpose:** Verifies college name normalization.

**Usage:**
```bash
node scripts/validation/verify-normalization.js
```

---

## Database Scripts

Located in `scripts/database/`

### 1. `migrate-to-supabase.ts`

**Purpose:** Migrates data from Upstash to Supabase.

**Usage:**
```bash
npm run migrate:supabase
```

**Prerequisites:**
- Source: Upstash Redis credentials
- Target: Supabase credentials

---

### 2. `seed-upstash.ts`

**Purpose:** Seeds initial data to Upstash Redis.

**Usage:**
```bash
npm run seed:upstash
```

**Prerequisites:**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

---

### 3. `import-cutoffs.mjs`

**Purpose:** Imports cutoff data from CSV/JSON files.

**Usage:**
```bash
node scripts/database/import-cutoffs.mjs
```

---

### 4. `import-grouped-cutoffs.mjs`

**Purpose:** Imports pre-grouped cutoff data.

**Usage:**
```bash
node scripts/database/import-grouped-cutoffs.mjs
```

---

### 5. `seed-colleges.mjs`

**Purpose:** Seeds college master data.

**Usage:**
```bash
node scripts/database/seed-colleges.mjs
```

---

### 6. `delete-old-cutoffs.mjs`

**Purpose:** Deletes outdated cutoff entries.

**Usage:**
```bash
node scripts/database/delete-old-cutoffs.mjs
```

**⚠️ Warning:** This is destructive. Backup data first.

---

## SEO Scripts

Located in `scripts/seo/`

### `submit-indexnow.mjs`

**Purpose:** Submits URLs to search engines via IndexNow protocol.

**Usage:**
```bash
npm run indexnow
```

**What it does:**
1. Generates list of URLs to index
2. Submits to Bing/Yandex via IndexNow API
3. Logs submission results

**Prerequisites:**
- IndexNow API key (optional, can use domain as key)

---

## Data Quality Scripts

Located in `scripts/data-quality/`

### `normalize-cutoff-names.ts`

**Purpose:** Normalizes college and program names for consistency.

**Usage:**
```bash
npm run fix:duplicates
```

**What it does:**
1. Identifies name variations (e.g., "JU" vs "Jadavpur University")
2. Normalizes to canonical names
3. Updates database entries

**Example:**
```
Before: "JU", "Jadavpur Univ", "Jadavpur University"
After:  "Jadavpur University" (all entries)
```

---

## Troubleshooting

### Build Scripts Fail

**Error:** `Cannot find module 'dotenv'`
```bash
npm install
```

**Error:** `SUPABASE_SECRET_KEY is not defined`
```bash
# Add to .env.local
SUPABASE_SECRET_KEY=your_service_role_key
```

**Error:** `Redis connection failed`
```bash
# Verify Redis credentials in .env.local
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

---

### Build Interrupted Mid-Way

**Problem:** Partial files in `public/data/colleges/`

**Solution:** The atomic write pattern automatically cleans up:
```bash
# Temp files are in .tmp-colleges/
# If build fails, temp directory is deleted
# Production files are only updated on successful completion
```

---

### Memory Issues During Build

**Error:** `JavaScript heap out of memory`

**Solution:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

---

### TypeScript Errors in Scripts

**Error:** `Cannot find module '@/...'`

**Solution:** Scripts use relative imports, not path aliases:
```typescript
// ❌ Don't use
import { foo } from '@/utils/bar';

// ✅ Use
import { foo } from '../../src/utils/bar';
```

---

## Common Workflows

### Full Production Build
```bash
# 1. Clean old builds
rm -rf .next public/data public/cutoffs-data.json

# 2. Run full build
npm run build

# 3. Verify output
ls -lh public/data/colleges/  # Should have ~50 files
ls -lh public/cutoffs-data.json  # Should be ~300KB
```

### Development with Fresh Data
```bash
# 1. Rebuild data
npm run build:metadata
npm run build:mobile
npm run build:desktop

# 2. Start dev server
npm run dev
```

### Testing Data Integrity
```bash
# Run all validation scripts
npm run test:mobile
npx tsx scripts/test/fuzz-test.ts
node scripts/validation/check-duplicates.js
```

---

## Performance Tips

### Build Speed
- **Parallel builds:** Build scripts run sequentially by design to avoid conflicts
- **Incremental builds:** Only rebuild changed data (not implemented yet)
- **Caching:** Redis caches metadata to speed up subsequent builds

### Bundle Size
- **Mobile:** ~45KB (no data bundled)
- **Desktop:** ~85KB (includes 300KB data)
- **Shared:** ~120KB (React, Next.js, SWR)

---

## Contributing

When adding new scripts:

1. **Add to package.json:**
   ```json
   "scripts": {
     "your-script": "tsx scripts/category/your-script.ts"
   }
   ```

2. **Document here:**
   - Purpose
   - Usage
   - Prerequisites
   - Example output

3. **Add error handling:**
   ```typescript
   try {
     // Your logic
   } catch (error) {
     console.error('[ScriptName] Error:', error);
     process.exit(1);
   }
   ```

4. **Use shared config:**
   ```typescript
   import { FETCH_BATCH_SIZE, TABLES } from '../build/config';
   ```

---

## License

MIT - See LICENSE file for details
