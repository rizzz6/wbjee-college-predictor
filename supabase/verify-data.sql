-- Check actual data in Supabase
SELECT COUNT(*) as total_records FROM cutoffs;

-- Check unique colleges
SELECT COUNT(DISTINCT institute) as unique_colleges FROM cutoffs;

-- Check unique categories
SELECT COUNT(DISTINCT category) as unique_categories FROM cutoffs;

-- Check years
SELECT DISTINCT year FROM cutoffs ORDER BY year;

--Check sample data
SELECT * FROM cutoffs LIMIT 10;
