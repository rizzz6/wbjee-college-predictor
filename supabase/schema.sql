-- ============================================
-- WBJEE COLLEGE PREDICTOR - DATABASE SCHEMA
-- Supabase PostgreSQL Schema
-- ============================================

-- ============================================
-- MAIN CUTOFF TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cutoffs (
    id BIGSERIAL PRIMARY KEY,
    
    -- Institution Info
    institute TEXT NOT NULL,
    program TEXT NOT NULL,
    stream TEXT NOT NULL,
    
    -- Admission Details
    quota TEXT NOT NULL,
    category TEXT NOT NULL,
    seat_type TEXT NOT NULL,
    round TEXT NOT NULL,
    year INTEGER NOT NULL,
    
    -- Rank Data
    opening_rank INTEGER NOT NULL,
    closing_rank INTEGER NOT NULL,
    
    -- Metadata
    sr_no INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Composite index for common queries (college + year + category)
CREATE INDEX IF NOT EXISTS idx_cutoffs_search 
ON cutoffs(institute, year, category, program);

-- Index for rank-based filtering
CREATE INDEX IF NOT EXISTS idx_cutoffs_ranks 
ON cutoffs(closing_rank, opening_rank);

-- Index for year filters (descending for latest first)
CREATE INDEX IF NOT EXISTS idx_cutoffs_year 
ON cutoffs(year DESC);

-- Full-text search index for institute names
CREATE INDEX IF NOT EXISTS idx_cutoffs_institute_fts 
ON cutoffs USING GIN(to_tsvector('english', institute));

-- Index for program filtering
CREATE INDEX IF NOT EXISTS idx_cutoffs_program
ON cutoffs(program);

-- ============================================
-- USER WISHLISTS / SAVED COLLEGES
-- ============================================
CREATE TABLE IF NOT EXISTS user_wishlists (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cutoff_id BIGINT NOT NULL REFERENCES cutoffs(id) ON DELETE CASCADE,
    
    -- Optional: User notes
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate entries
    UNIQUE(user_id, cutoff_id)
);

-- Index for fetching user's wishlists
CREATE INDEX IF NOT EXISTS idx_wishlists_user 
ON user_wishlists(user_id, created_at DESC);

-- ============================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on wishlists table
ALTER TABLE user_wishlists ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own wishlists
CREATE POLICY "Users can view own wishlists"
ON user_wishlists FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own wishlists
CREATE POLICY "Users can insert own wishlists"
ON user_wishlists FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own wishlists
CREATE POLICY "Users can delete own wishlists"
ON user_wishlists FOR DELETE
USING (auth.uid() = user_id);

-- Cutoffs table: Public read access (no auth required)
ALTER TABLE cutoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public cutoffs read access"
ON cutoffs FOR SELECT
USING (true); -- Everyone can read

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cutoffs_updated_at
BEFORE UPDATE ON cutoffs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- After running this schema, verify with:
-- SELECT COUNT(*) FROM cutoffs;
-- SELECT * FROM cutoffs LIMIT 5;
-- \d cutoffs  -- Show table structure
