# Upstash Redis Setup Instructions

## Quick Start (5 minutes)

### Step 1: Create Upstash Account

1. Go to https://upstash.com
2. Sign up with GitHub (fastest)
3. Create new Redis database:
   - **Name**: `wbjee-predictor`
   - **Region**: Asia Pacific (Singapore or Mumbai - closest to India)
   - **Type**: Regional (free tier)
   
### Step 2: Get Credentials

From your Upstash dashboard, copy the REST API credentials:

```
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxA
```

### Step 3: Add to Environment Variables

Create or update `.env.local` in your project root:

```bash
# Upstash Redis
UPSTASH_REDIS_REST_URL="https://your-database-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"
```

⚠️ **Important**: Make sure `.env.local` is in your `.gitignore`

### Step 4: Install Dependencies (Already Done!)

```bash
npm install @upstash/redis
npm install -D tsx  # For running TypeScript scripts
```

### Step 5: Seed Your Data

Run the seed script to upload your college data to Upstash:

```bash
npm run seed:upstash
```

You should see:
```
🌱 Seeding Upstash Redis...
📊 Total records: 10523
✅ Seeding complete!
📦 Data stored in key: predictor:data
✓ Verification: 10523 records stored
```

### Step 6: Test the API

Start your dev server and test:

```bash
npm run dev
```

Visit: http://localhost:3000/api/predictor/filter?rank=5000

You should get JSON with colleges filtered between rank 2000-8000.

---

## Troubleshooting

### Error: "Data not found"
- Run the seed script: `npm run seed:upstash`
- Check your environment variables are set correctly
- Verify credentials in Upstash dashboard

### Error: "Failed to connect"
- Check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Make sure you copied the REST API credentials (not the regular Redis URL)
- Verify your Upstash database is active

### Slow first request
- This is normal - cold start on first API call
- Subsequent requests should be 3-5ms

---

## What's Next?

1. ✅ Upstash set up and seeded
2. ⏭️ Update client to use the API (next step)
3. ⏭️ Test filtering and predictions
4. ⏭️ Deploy to production

---

## For Deployment (Vercel)

When deploying to Vercel, add these environment variables in your project settings:

```
UPSTASH_REDIS_REST_URL=https://your-database-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

Then run the seed script once in production (via terminal or local with production env vars).
