-- Create database functions to get distinct values efficiently
-- Run this in Supabase SQL Editor

-- Function to get distinct colleges
CREATE OR REPLACE FUNCTION get_distinct_colleges()
RETURNS TABLE (institute TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT c.institute
  FROM cutoffs c
  ORDER BY c.institute;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Function to get distinct categories
CREATE OR REPLACE FUNCTION get_distinct_categories()
RETURNS TABLE (category TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT c.category
  FROM cutoffs c
  ORDER BY c.category;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Function to get distinct years
CREATE OR REPLACE FUNCTION get_distinct_years()
RETURNS TABLE (year INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT c.year
  FROM cutoffs c
  ORDER BY c.year DESC;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Function to get distinct rounds
CREATE OR REPLACE FUNCTION get_distinct_rounds()
RETURNS TABLE (round TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT c.round
  FROM cutoffs c
  ORDER BY c.round;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Function to get distinct seat types
CREATE OR REPLACE FUNCTION get_distinct_seat_types()
RETURNS TABLE (seat_type TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT c.seat_type
  FROM cutoffs c
  ORDER BY c.seat_type;
END;
$$ LANGUAGE plpgsql
SET search_path = public;
