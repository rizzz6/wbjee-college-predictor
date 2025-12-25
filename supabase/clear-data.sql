-- Clear all data for fresh migration
TRUNCATE TABLE cutoffs CASCADE;

-- Reset sequence
ALTER SEQUENCE cutoffs_id_seq RESTART WITH 1;

-- Verify empty
SELECT COUNT(*) FROM cutoffs;
-- Should return 0
