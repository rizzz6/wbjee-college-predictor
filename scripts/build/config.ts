/**
 * Configuration constants for build scripts
 */

// Database fetch configuration
export const FETCH_BATCH_SIZE = 1000;

// Table names
export const TABLES = {
    CUTOFFS: 'cutoffs',
    METADATA: 'metadata',
} as const;

// File paths
export const PATHS = {
    PUBLIC_DATA: 'public/data',
    CUTOFFS_DATA: 'public/cutoffs-data.json',
    MOBILE_INDEX: 'public/data/mobile-index.json',
    COLLEGES_DIR: 'public/data/colleges',
} as const;
