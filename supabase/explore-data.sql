-- Quick Data Exploration Queries
-- Run these in Supabase SQL Editor to understand your data

-- 1. What colleges do we have?
SELECT DISTINCT institute 
FROM cutoffs 
ORDER BY institute 
LIMIT 20;

-- 2. What programs exist for a specific college?
-- Replace the college name with one from your metadata
SELECT DISTINCT program 
FROM cutoffs 
WHERE institute = 'Asansol Engineering College, Asansol, Burdwan'
ORDER BY program;

-- 3. Find a complete record example
SELECT institute, program, year, round, category, seat_type, opening_rank, closing_rank
FROM cutoffs
WHERE year = 2025
LIMIT 5;

-- 4. Check what data exists for a specific combo
SELECT *
FROM cutoffs
WHERE institute = 'Asansol Engineering College, Asansol, Burdwan'
  AND year = 2025
  AND category = 'EWS'
  AND round = 'Round 1'
  AND seat_type = 'JEE(Main) Seats'
LIMIT 5;

-- 5. Count by year
SELECT year, COUNT(*) as record_count
FROM cutoffs
GROUP BY year
ORDER BY year DESC;
