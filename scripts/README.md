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
1. `build:metadata` - Builds filter metadata from Redis
2. `build:mobile` - Generates mobile slices from Supabase
3. `build:desktop` - Builds desktop data from Supabase
4. `next build` - Builds Next.js app

---

## Prerequisites

### Required Environment Variables

Create a `.env.local` file with:

```env
# Supabase (PRIMARY DATA SOURCE)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SECRET_KEY=your_service_role_key  # For scripts only

# Upstash Redis (for caching)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Google Sheets Import (OPTIONAL - for automated import)
GOOGLE_SHEETS_EXPORT_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv
```

### Required Tools
- Node.js 20+
- npm or pnpm
- tsx (installed as dev dependency)

---

## Data Update Workflow

### 🔄 Annual Cutoff Data Update

You have **two options** for importing data to Supabase:

---

### **Option A: Automated (Google Sheets URL)** ⭐ Recommended

**Setup (One-Time):**

1. **Publish your Google Sheet:**
   - File → Share → Publish to web
   - Format: "Comma-separated values (.csv)"
   - Click "Publish" and copy the URL

2. **Add to `.env.local`:**
   ```env
   GOOGLE_SHEETS_EXPORT_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv
   ```

**Import Steps:**

```bash
# Clear old data
npm run clear:supabase

# Import directly from Google Sheets (no manual export!)
npm run import:sheets

# Rebuild everything
npm run build
npm run seed:upstash

# Deploy
git push
```

**Benefits:**
- ✅ No manual CSV export
- ✅ One command to update
- ✅ Always imports latest data
- ✅ Fastest workflow

---

### **Option B: Manual (CSV Export)**

**Import Steps:**

1. **Export from Google Sheets:**
   - File → Download → Comma-separated values (.csv)
   - Save as: `public/cutoffs-import.csv`

2. **Clear old data:**
   ```bash
   npm run clear:supabase
   ```

3. **Import from CSV file:**
   ```bash
   npm run import:csv
   ```

4. **Rebuild everything:**
   ```bash
   npm run build
   npm run seed:upstash
   ```

5. **Deploy:**
   ```bash
   git push
   ```

**Benefits:**
- ✅ More control over import timing
- ✅ Can review CSV before import
- ✅ Works offline

---

**📚 Full Documentation:** 
- [Data Update Workflow](../docs/DATA_UPDATE_WORKFLOW.md)
- [Import Options Comparison](../docs/IMPORT_OPTIONS.md)

---

## Build Scripts

Located in `scripts/build/`

**Data Source:** All build scripts now read from **Supabase** (single source of truth)

### 1. `build-metadata.ts`

**Purpose:** Builds and caches metadata (unique filter values) in Redis for fast access.

**Usage:**
```bash
npm run build:metadata
```

**Data Flow:**
```
Supabase (via Redis) → Extract unique values → Cache in Redis
```

**What it does:**
1. Fetches master cutoff data from Redis (seeded from Supabase)
2. Decompresses gzip data
3. Extracts unique values for:
   - Colleges (138)
   - Programs (168)
   - Years (5)
   - Categories (11)
   - Rounds (3)
   - Seat Types (2)
4. Stores metadata in Redis with key: `wbjee:metadata`

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

**Data Flow:**
```
Supabase → Group by college → Compress → Write per-college JSON files
```

**What it does:**
1. Fetches all cutoff data from Supabase (paginated)
2. Groups data by college (138 colleges)
3. Creates compressed JSON files:
   - `public/data/colleges/{slug}.json` (one per college, ~3-8KB each)
   - `public/data/mobile-index.json` (college list, ~2KB)
4. Uses **atomic writes** to prevent partial deployments

**Output:**
- `public/data/colleges/*.json` (~138 files, 3-33KB each)
- `public/data/mobile-index.json` (~15KB)

**Features:**
- ✅ Atomic writes (temp directory → rename)
- ✅ Cleanup on interruption (SIGINT/SIGTERM)
- ✅ Validation (no empty/undefined files)
- ✅ Flat columnar compression

**Prerequisites:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

---

### 3. `build-cutoffs-data.ts`

**Purpose:** Builds the monolithic cutoff data file for desktop mode.

**Usage:**
```bash
npm run build:desktop
```

**Data Flow:**
```
Supabase → Build lookup tables → Columnar compression → Write single JSON
```

**What it does:**
1. Fetches all cutoff data from Supabase (17,179 records)
2. Builds lookup tables for compression
3. Creates columnar compressed format (88% size reduction)
4. Writes to `public/cutoffs-data.json`

**Output:**
- `public/cutoffs-data.json` (~454KB raw, ~106KB Brotli compressed)

**Compression Format:**
```json
{
  "lookup": {
    "C": ["College 1", "College 2", ...],
    "P": ["Program 1", "Program 2", ...],
    "Y": [2022, 2023, 2024, 2025],
    "T": ["GENERAL", "OBC-A", ...],
    "R": ["Round 1", "Round 2", "Round 3"],
    "S": ["GC", "TFW"]
  },
  "data": {
    "c": [0, 1, 0, ...],  // College indices
    "p": [0, 1, 2, ...],  // Program indices
    "y": [0, 1, 2, ...],  // Year indices
    "t": [0, 1, 0, ...],  // Category indices
    "r": [0, 1, 2, ...],  // Round indices
    "s": [0, 0, 1, ...],  // Seat type indices
    "o": [22, 100, ...],  // Opening ranks
    "k": [89, 250, ...]   // Closing ranks
  }
}
```

**Prerequisites:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

---

### 4. `config.ts`

**Purpose:** Shared configuration constants for build scripts.

**Exports:**
```typescript
export const FETCH_BATCH_SIZE = 1000;
export const TABLES = {
    CUTOFFS: 'cutoffs',
} as const;
```

**Usage:**
```typescript
import { FETCH_BATCH_SIZE, TABLES } from './config';
```

---

## Database Scripts

Located in `scripts/database/`

### 1. `import-from-sheets-url.ts` ✨ NEW (Recommended)

**Purpose:** Direct Google Sheets → Supabase import (no manual export!)

**Usage:**
```bash
npm run import:sheets
```

**Data Flow:**
```
Google Sheets (Published URL) → Fetch CSV → Parse → Import to Supabase
```

**Setup (One-Time):**

1. **Publish your Google Sheet:**
   - File → Share → Publish to web
   - Choose: "Comma-separated values (.csv)" format
   - Click "Publish" and copy the URL

2. **Add to `.env.local`:**
   ```env
   GOOGLE_SHEETS_EXPORT_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv
   ```

**What it does:**
1. Fetches CSV directly from published Google Sheets URL
2. Parses and validates CSV data
3. Transforms to Supabase schema
4. Batch inserts (1000 rows per batch)
5. Verifies import success

**Prerequisites:**
- Published Google Sheets URL in `.env.local`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

**Safety:**
- Checks for existing data
- Aborts if duplicates would be created
- Prompts to run `clear:supabase` first

**Benefits:**
- ✅ No manual CSV export
- ✅ Always imports latest data
- ✅ One-command workflow
- ✅ Can automate with cron/GitHub Actions

---

### 2. `import-from-csv.ts` (Manual Alternative)

**Purpose:** Manual CSV → Supabase import

**Usage:**
```bash
npm run import:csv
```

**Data Flow:**
```
Google Sheets → Manual Export CSV → Save as cutoffs-import.csv → Import to Supabase
```

**What it does:**
1. Reads `public/cutoffs-import.csv`
2. Parses and validates CSV data
3. Transforms to Supabase schema
4. Batch inserts (1000 rows per batch)
5. Verifies import success

**Expected CSV Format:**
```csv
Sr.No,Round,Institute,Program,Stream,Quota,Category,Opening Rank,Closing Rank,Year,Seat Type
1,Round 1,Jadavpur University,Computer Science and Engineering,Engineering,AI,GENERAL,22,89,2025,GC
```

**Prerequisites:**
- CSV file at: `public/cutoffs-import.csv`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

**Safety:**
- Checks for existing data
- Aborts if duplicates would be created
- Prompts to run `clear:supabase` first

**Benefits:**
- ✅ More control over import timing
- ✅ Can review data before import
- ✅ Works offline

---

### 3. `clear-supabase.ts` ✨ NEW

**Purpose:** Safely delete all cutoff data from Supabase.

**Usage:**
```bash
npm run clear:supabase
```

**What it does:**
1. Checks current record count
2. Shows warning message
3. **Requires typing "DELETE" to confirm**
4. Deletes all rows from `cutoffs` table
5. Verifies deletion

**Safety Features:**
- ⚠️ Interactive confirmation required
- ⚠️ Shows record count before deletion
- ⚠️ Cannot be undone

**When to use:**
- Before importing fresh annual data
- When testing data migration
- When cleaning up duplicate data

---

### 4. `seed-upstash.ts` (Updated)

**Purpose:** Seeds Redis cache from Supabase for predictor API.

**Usage:**
```bash
npm run seed:upstash
```

**Data Flow:**
```
Supabase → Fetch all records → Transform → Compress (Gzip) → Upload to Redis
```

**What it does:**
1. Fetches all cutoff data from **Supabase** (paginated)
2. Transforms to predictor API format
3. Compresses with Gzip (6.86 MB → 0.55 MB)
4. **Cleans up old Redis keys** (prevents duplicates!)
5. Uploads to Redis key: `wbjee:master_data`

**Cleanup Process:**
```typescript
pipeline.del('predictor:data');      // Delete old key
pipeline.del('colleges:by-rank');    // Delete old key  
pipeline.set('wbjee:master_data', base64Data);  // Set new data
```

**Prerequisites:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

---

### 5. `migrate-to-supabase.ts` (Legacy)

**Purpose:** One-time migration from `data.json` to Supabase (if needed).

**Usage:**
```bash
npm run migrate:supabase
```

**⚠️ Note:** Only needed if you have old `data.json` file. 
**Prefer:** Use `import:csv` for new data imports.

**What it does:**
1. Reads `public/data.json` (if exists)
2. Transforms to Supabase schema
3. Batch inserts into Supabase
4. Prevents duplicates

---

### 6. `seed-sanity-colleges.ts` ✨ NEW

**Purpose:** Syncs unique colleges from Supabase to Sanity CMS.

**Usage:**
```bash
npm run seed:sanity:colleges
```

**What it does:**
1. Fetches unique institutes from Supabase
2. Checks if they exist in Sanity
3. Creates new `college` documents for missing institutes
4. Does NOT overwrite existing data (idempotent)

---

### 7. `seed-sanity-cutoffs.ts` ✨ NEW

**Purpose:** Syncs grouped availability data to Sanity for individual college pages.

**Usage:**
```bash
npm run seed:sanity:cutoffs
```

**What it does:**
1. Fetches ALL cutoff data from Supabase
2. Groups cutoffs by Institute in memory
3. Creates or Updates `collegeCutoff` documents in Sanity
4. Replaces the `cutoffs` array with fresh data from Supabase

---

### 8. College Details Migration Scripts ✨ NEW

**Purpose:** Manages bidirectional sync between `collegeDetail` (source of truth) and `college` documents in Sanity.

#### Architecture
- `collegeDetail`: Hidden schema containing raw JSON data
- `college`: Public schema with reference to collegeDetail
- Bidirectional sync via custom component with Pull/Push buttons

#### Available Commands

**Full Migration (Recommended):**
```bash
npm run migrate:college-details
```
Runs: `clear` → `seed` → `link` in sequence

**Individual Steps:**

1. **Clear Pre-filled Data**
   ```bash
   npm run clear:college-details
   ```
   - Clears `highlights`, `placements`, `body` from all colleges
   - Safe to re-run (idempotent)

2. **Seed College Details**
   ```bash
   npm run seed:college-details
   ```
   - Imports `individual-college-details.json` → `collegeDetail` documents
   - Creates 137 structured records
   - Uses `createOrReplace` (safe to re-run)

3. **Link Colleges**
   ```bash
   npm run link:college-details
   ```
   - Sets `detailsIdentifier` reference for each college
   - Uses `college-name-map.ts` for matching
   - Does NOT pre-fill data (component handles auto-pull)

#### Data Fields Synced
- `highlights` (Array)
- `location` (String)
- `type` (Government/Private)
- `website` (URL)
- `description` (SEO text)
- `estYear` (Extracted from highlights)
- `body` (About paragraphs → Portable Text)
- `placements` (Stats → Table)
- `feeStructure` (Stats → Table)

#### How It Works

**In Sanity Studio:**
1. Open a College document
2. See "College Details Source" dropdown
3. Select a detail record
4. **Auto-Pull**: Data automatically populates
5. Edit fields as needed
6. **Push**: Click button to save changes back to source

**Benefits:**
- ✅ Source of truth in Sanity (no JSON dependency)
- ✅ Bidirectional sync (Pull & Push)
- ✅ Auto-extraction of establishment year
- ✅ Hidden from navigation (only accessible via college)
- ✅ Type-safe with TypeScript interfaces

#### Files
- `clear-college-details.ts` - Cleanup script
- `seed-college-details.ts` - Import JSON to Sanity
- `link-college-details.ts` - Create references
- `college-name-map.ts` - Name matching map
- `bulk-resync-colleges.ts` - Bulk resync all at once

#### Bulk Operations

**Resync All Colleges:**
```bash
npm run resync:all-colleges
```
- Re-syncs all colleges that have a `detailsIdentifier` reference
- Useful after updating collegeDetail records
- Updates `lastSyncedAt` timestamp
- Safe to re-run (idempotent)

**Validate Data Quality:**
```bash
npm run validate:college-details
```
- Generates CSV report of data quality issues
- Checks for missing references, data, and orphaned records
- Output: `college-details-validation-report.csv`

#### Component Features

**Auto-Pull:**
- Automatically syncs when reference is selected
- Validates source data (warnings for missing content)
- Extracts establishment year from highlights
- Updates `lastSyncedAt` timestamp

**Manual Push:**
- Confirmation dialog prevents accidental overwrites
- Transforms data back to collegeDetail format
- Updates source of truth

**UI Features:**
- Loading spinners during operations
- Warning when no reference selected
- Real-time validation feedback
- Lucide icons (Download/Upload)

---

### 9. Legacy Scripts (Deleted/Deprecated)

- ❌ `import-cutoffs.mjs` - Replaced by `seed-sanity:cutoffs`
- ❌ `import-grouped-cutoffs.mjs` - Replaced by `seed-sanity:cutoffs`
- ❌ `seed-colleges.mjs` - Replaced by `seed-sanity:colleges`
- ❌ `migrate-to-supabase.ts` - Legacy data.json migration (kept for reference)
- ✅ `delete-old-cutoffs.mjs` - Still available if needed

---

## Validation Scripts

Located in `scripts/validation/`

### 1. `analyze-distribution.ts` ✨ UPDATED

**Purpose:** Analyzes college size distribution (for Redis partitioning strategy).

**Usage:**
```bash
npm run validate:distribution
```

**Data Source:** Supabase (direct query)

**What it shows:**
- Top 20 largest colleges by record count
- File size estimates per college
- Total records and college count
- Size distribution (< 10KB, 10-50KB, 50-100KB, > 100KB)
- Total Redis storage estimate

**Sample Output:**
```
📊 Institute Partition Analysis

Top 20 Largest Institutes:
─────────────────────────────────────────────
 1. Jadavpur University                        1644 records   105.7 KB
 2. Kalyani Government Engineering College      512 records    33.2 KB
...

Total Statistics:
  Total Records: 17179
  Total Institutes: 138
  Average Records per Institute: 124
```

---

### 2. `check-duplicates.ts` ✨ UPDATED

**Purpose:** Finds duplicate/variant college names.

**Usage:**
```bash
npm run validate:duplicates
```

**Data Source:** Supabase (direct query)

**What it finds:**
- Exact duplicate names
- Variant spellings (normalized comparison)
- Name inconsistencies

**Example Output:**
```
Variant group 1:
  - "Jalpaiguri Govt Engineering College"
  - "Jalpaiguri Govt. Engineering College"

Variant groups found: 3
Likely true unique institutes: 135
```

---

### 3. `compare-colleges.ts` ✨ UPDATED

**Purpose:** Compares college data between Supabase and metadata files.

**Usage:**
```bash
npm run validate:colleges
```

**Data Source:** 
- Supabase (cutoffs table)
- `public/metadata-lookup.json` (generated file)

**What it finds:**
- Colleges in metadata but not in Supabase
- Colleges in Supabase but not in metadata
- Data sync issues

---

### 4. `test-static-slicing.ts`

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
- File sizes are reasonable

---

### 5. `test-upstash.ts`

**Purpose:** Tests Redis connection and data retrieval.

**Usage:**
```bash
npx tsx scripts/validation/test-upstash.ts
```

**Prerequisites:**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

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

### `remove-fuzzy-duplicates.js` ✨ NEW

**Purpose:** Detects and removes fuzzy duplicate entries in `public/data/individual-college-details.json`.

**Usage:**
```bash
# Check for duplicates without making changes (Dry Run)
npm run fix:json-duplicates -- --dry-run

# Automatically remove duplicates and save
npm run fix:json-duplicates
```

**What it does:**
1. Scans `individual-college-details.json`.
2. Normalizes college names (removes spaces, punctuation, common words).
3. Groups potential duplicates.
4. Uses a scoring system to keep the best entry (Title Case > ALL CAPS, longer names, etc.).
5. Removes lower-scoring duplicates.

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

### CSV Import Issues

**Error:** `CSV file not found`
```bash
# Make sure you saved the CSV to the correct location:
# public/cutoffs-import.csv
```

**Error:** `Records already exist`
```bash
# Clear old data first
npm run clear:supabase
```

**Error:** `CSV parse error`
```
Check your CSV format matches the expected headers:
Sr.No,Round,Institute,Program,Stream,Quota,Category,Opening Rank,Closing Rank,Year,Seat Type
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

## Common Workflows

### Full Production Build
```bash
# 1. Clean old builds
rm -rf .next public/data public/cutoffs-data.json

# 2. Run full build
npm run build

# 3. Verify output
ls -lh public/data/colleges/      # Should have ~138 files
ls -lh public/cutoffs-data.json   # Should be ~454KB
```

### Update Cutoff Data (Annual)

**Option A: Automated (Recommended):**
```bash
# Clear old data
npm run clear:supabase

# Import from Google Sheets (no manual export!)
npm run import:sheets

# Rebuild everything
npm run build
npm run seed:upstash
```

**Option B: Manual:**
```bash
# 1. Export Google Sheets as CSV → save to public/cutoffs-import.csv

# 2. Clear old data
npm run clear:supabase

# 3. Import from CSV
npm run import:csv

# 4. Rebuild everything
npm run build
npm run seed:upstash
```

### Development with Fresh Data
```bash
# 1. Rebuild data from Supabase
npm run build:metadata
npm run build:mobile
npm run build:desktop

# 2. Start dev server
npm run dev
```

### Testing Data Integrity
```bash
# Run all validation scripts
npm run validate:distribution
npm run validate:duplicates
npm run validate:colleges
npm run test:mobile
```

---

## Performance Tips

### Build Speed
- **Parallel builds:** Currently sequential by design to avoid conflicts
- **Incremental builds:** Coming soon
- **Caching:** Redis caches metadata to speed up subsequent builds

### Bundle Size
- **Mobile:** ~45KB (no data bundled, lazy-loaded per college)
- **Desktop:** ~106KB compressed (includes full 454KB data, Brotli compressed)
- **Shared:** ~120KB (React, Next.js, SWR)

---

## Architecture

### Data Flow Diagram

```
┌─────────────────────────────────────────┐
│  WBJEE Official Site                    │
│  (Annual Cutoff Data)                   │
└─────────────────────────────────────────┘
              ↓
              ↓ Manual Scraping
              ↓
┌─────────────────────────────────────────┐
│  Google Sheets                          │
│  (Data Entry & Validation)              │
└─────────────────────────────────────────┘
              ↓
              ↓ Export CSV
              ↓
┌─────────────────────────────────────────┐
│  public/cutoffs-import.csv              │
│  (Gitignored)                           │
└─────────────────────────────────────────┘
              ↓
              ↓ npm run import:csv
              ↓
┌─────────────────────────────────────────┐
│  SUPABASE (PostgreSQL)                  │
│  ✨ SINGLE SOURCE OF TRUTH ✨          │
│  - cutoffs table (~17,179 records)      │
└─────────────────────────────────────────┘
              ↓
              ↓ Build Scripts (auto-read)
              ↓
    ┌─────────┴──────────┐
    ↓                    ↓
┌──────────────┐   ┌─────────────────┐
│ Build Files  │   │ Upstash Redis   │
│              │   │ (Cache Layer)   │
│ - Desktop    │   │                 │
│ - Mobile     │   │ - Predictor API │
│ - Metadata   │   │ - Metadata API  │
└──────────────┘   └─────────────────┘
```

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
   - Data source (Supabase/Redis/File)
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

5. **Follow conventions:**
   - TypeScript for new scripts
   - Use Supabase as data source
   - Include progress logging
   - Handle pagination for large datasets

---

## License

MIT - See LICENSE file for details


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
