# Data Update Workflow

## 📋 How Supabase is Seeded & Updated

### Complete Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│ 1. WBJEE Official Site                                       │
│    - Official cutoff data published annually                 │
└──────────────────────────────────────────────────────────────┘
                         ↓
                         ↓ (Manual Scraping)
                         ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. Google Sheets                                             │
│    - Manual data entry/validation                            │
│    - Data cleaning & formatting                              │
└──────────────────────────────────────────────────────────────┘
                         ↓
                         ↓ (Export as CSV)
                         ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. CSV File (public/cutoffs-import.csv)                      │
│    - Downloaded from Google Sheets                           │
│    - Gitignored (not committed)                              │
└──────────────────────────────────────────────────────────────┘
                         ↓
                         ↓ npm run import:csv
                         ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. SUPABASE (PostgreSQL) - SOURCE OF TRUTH ✨                │
│    - All cutoff data stored here                             │
│    - ~17,179 records                                         │
└──────────────────────────────────────────────────────────────┘
                         ↓
                         ↓ (Automatic reads)
                         ↓
        ┌────────────────┴────────────────┐
        │                                  │
        ↓                                  ↓
┌─────────────────┐              ┌──────────────────┐
│ Build Scripts   │              │ Upstash Redis    │
│ - Desktop data  │              │ - API cache      │
│ - Mobile slices │              │                  │
│ - Metadata      │              │                  │
└─────────────────┘              └──────────────────┘
```

---

## 🔄 Step-by-Step: Updating Cutoff Data

### Initial Setup (One Time)
```bash
# 1. Seed Supabase with your existing data
npm run migrate:supabase    # Uses data.json if you have it
# OR
npm run import:csv          # Uses CSV from Google Sheets
```

### Annual Data Update (When WBJEEB Publishes New Data)

#### Step 1: Scrape & Export
1. Scrape data from WBJEE official site
2. Enter/update in Google Sheets
3. **File → Download → Comma-separated values (.csv)**
4. Save as: `public/cutoffs-import.csv`

#### Step 2: Clear Old Data
```bash
npm run clear:supabase
```
- Prompts for confirmation (type "DELETE")
- Deletes all existing cutoff data from Supabase

#### Step 3: Import Fresh Data
```bash
npm run import:csv
```
- Reads `public/cutoffs-import.csv`
- Transforms & validates data
- Batch inserts into Supabase
- Verifies record count

#### Step 4: Rebuild Everything
```bash
npm run build               # Generates all data files
npm run seed:upstash        # Updates Redis cache
```

#### Step 5: Deploy
```bash
git add .
git commit -m "Update cutoffs for [YEAR]"
git push
```

---

## 📊 Available Commands

### Database Management
| Command | Description | Use When |
|---------|-------------|----------|
| `npm run import:csv` | Import CSV → Supabase | You have fresh data from Google Sheets |
| `npm run clear:supabase` | Delete all Supabase data | Before importing fresh data |
| `npm run migrate:supabase` | Import JSON → Supabase | Legacy: if you have data.json |
| `npm run seed:upstash` | Supabase → Redis cache | After Supabase update |

### Build Scripts
| Command | Description | Reads From |
|---------|-------------|------------|
| `npm run build:desktop` | Generate desktop data | Supabase |
| `npm run build:mobile` | Generate mobile slices | Supabase |
| `npm run build:metadata` | Build metadata lookup | Redis |
| `npm run build` | Full build (all 3 above) | Supabase + Redis |

### Validation
| Command | Description |
|---------|-------------|
| `npm run validate:distribution` | Analyze college size distribution |
| `npm run validate:duplicates` | Find duplicate college names |
| `npm run validate:colleges` | Compare Supabase vs metadata |

---

## 🔍 Troubleshooting

### "CSV file not found"
**Fix:** Make sure you saved the CSV to `public/cutoffs-import.csv`

### "Records already exist"
**Fix:** Run `npm run clear:supabase` first

### "Missing Supabase credentials"
**Fix:** Check your `.env.local` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-service-role-key
```

### CSV Parse Errors
**Fix:** Check your CSV format matches:
```
Sr.No,Round,Institute,Program,Stream,Quota,Category,Opening Rank,Closing Rank,Year,Seat Type
1,Round 1,College Name,Program Name,Engineering,AI,GENERAL,100,500,2025,GC
```

---

## 📝 CSV Format Requirements

Your Google Sheets must have these **exact column headers**:
- `Sr.No`
- `Round`
- `Institute`
- `Program`
- `Stream`
- `Quota`
- `Category`
- `Opening Rank`
- `Closing Rank`
- `Year`
- `Seat Type`

---

## 🎯 Quick Reference

**Update data annually:**
```bash
# Export CSV from Google Sheets → save as public/cutoffs-import.csv
npm run clear:supabase    # Delete old data
npm run import:csv        # Import fresh data
npm run build             # Rebuild everything
npm run seed:upstash      # Update cache
```

**Validate data:**
```bash
npm run validate:distribution
npm run validate:duplicates
npm run validate:colleges
```

**Local development:**
```bash
npm run dev               # Start dev server
```

---

## ✨ Benefits of This Workflow

**Before:**
- ❌ Manual JSON conversion via online tool
- ❌ Multiple format conversions (CSV → JSON → Supabase)
- ❌ `data.json` cluttering repository

**After:**
- ✅ Direct CSV → Supabase import
- ✅ One command to update everything
- ✅ Clean, gitignored source files
- ✅ Supabase as single source of truth
