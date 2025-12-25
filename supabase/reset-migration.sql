-- ============================================
-- RESET MIGRATION (Clear Partial Data)
-- ============================================
-- Run this ONLY if migration fails partway through
-- This deletes all records so you can retry

-- Delete all records from cutoffs table
TRUNCATE TABLE cutoffs CASCADE;

-- Verify it's empty
SELECT COUNT(*) FROM cutoffs;
-- Should return: 0

-- Optional: Reset the auto-increment ID counter
ALTER SEQUENCE cutoffs_id_seq RESTART WITH 1;

-- You're ready to run migration again!
-- Run: npm run migrate:supabase
