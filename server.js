const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const compression = require('compression');
const zlib = require('zlib');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Memory caching system
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCachedData(key) {
    const item = cache.get(key);
    if (item && Date.now() - item.timestamp < CACHE_TTL) {
        return item.data;
    }
    return null;
}

function setCachedData(key, data) {
    cache.set(key, {
        data: data,
        timestamp: Date.now()
    });
}

function clearExpiredCache() {
    const now = Date.now();
    for (const [key, item] of cache.entries()) {
        if (now - item.timestamp > CACHE_TTL) {
            cache.delete(key);
        }
    }
}

// Clear expired cache every 10 minutes
setInterval(clearExpiredCache, 10 * 60 * 1000);

// Cache statistics
let cacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0
};

function getCacheStats() {
    return {
        ...cacheStats,
        hitRate: cacheStats.totalRequests > 0 ? 
            ((cacheStats.hits / cacheStats.totalRequests) * 100).toFixed(2) + '%' : '0%',
        cacheSize: cache.size,
        memoryUsage: process.memoryUsage()
    };
}

// Rate limiting configuration
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many requests from this IP',
            message: 'Please try again in 15 minutes',
            retryAfter: Math.ceil(15 * 60) // seconds
        });
    }
});

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Request logging for API endpoints
app.use('/api/', (req, res, next) => {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    console.log(`[${timestamp}] API Request - IP: ${ip} - Path: ${req.path} - User-Agent: ${userAgent.substring(0, 100)}`);
    
    // Add request tracking to response headers
    res.setHeader('X-Request-ID', Date.now().toString());
    
    next();
});

// Enable compression for all responses
app.use(compression());



// Enable CORS
app.use(cors());

app.use(express.static('public', {
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        } else if (path.endsWith('.css') || path.endsWith('.js')) {
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.setHeader('Vary', 'Accept-Encoding');
        } else if (path.endsWith('.json')) {
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.setHeader('Vary', 'Accept-Encoding');
        }
    }
}));

app.get('/api/data', (req, res) => {
    try {
        // Additional protection: Check if request comes from our domain
        const referer = req.get('Referer');
        const origin = req.get('Origin');
        
        // Allow requests from our domain or direct API calls (for development)
        const allowedOrigins = [
            'http://localhost:3000',
            'https://wbjee-college-predictor.vercel.app',
            'https://wbjee-college-predictor.vercel.app/'
        ];
        
        if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
            console.log(`[BLOCKED] Unauthorized access attempt from: ${referer} - IP: ${req.ip}`);
            return res.status(403).json({ 
                error: 'Access denied',
                message: 'This API is for authorized use only'
            });
        }
        
        // Check cache first
        const cacheKey = 'wbjee_full_data';
        let data = getCachedData(cacheKey);
        
        if (data) {
            cacheStats.hits++;
            cacheStats.totalRequests++;
            console.log(`[CACHE HIT] Serving data from cache`);
        } else {
            cacheStats.misses++;
            cacheStats.totalRequests++;
            console.log(`[CACHE MISS] Loading data from file`);
            
            // Load from file
            const dataPath = path.join(__dirname, 'wbjee_orcr_data.json');
            data = fs.readFileSync(dataPath, 'utf8');
            
            // Cache the data
            setCachedData(cacheKey, data);
            console.log(`[CACHE STORED] Data cached for 30 minutes`);
        }
        
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('ETag', `"${Buffer.from(data).length}"`);
        res.setHeader('Vary', 'Accept-Encoding');
        
        // Add usage tracking header
        res.setHeader('X-Data-Usage', 'WBJEE College Predictor - Authorized Use Only');
        res.setHeader('X-Cache-Status', data ? 'HIT' : 'MISS');
        
        res.send(data);
    } catch (error) {
        console.error('Error reading data file:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
});

app.get('/api/compression-status', (req, res) => {
    try {
        const dataPath = path.join(__dirname, 'wbjee_orcr_data.json');
        const stats = fs.statSync(dataPath);
        const originalSize = stats.size;
        
        const data = fs.readFileSync(dataPath, 'utf8');
        const compressedBuffer = zlib.gzipSync(data, { level: 6 });
        const compressedSize = compressedBuffer.length;
        
        res.json({
            originalSize: originalSize,
            originalSizeMB: (originalSize / (1024 * 1024)).toFixed(2),
            compressedSize: compressedSize,
            compressedSizeMB: (compressedSize / (1024 * 1024)).toFixed(2),
            compressionRatio: ((1 - compressedSize / originalSize) * 100).toFixed(1),
            compressionEnabled: true,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting compression status:', error);
        res.status(500).json({ error: 'Failed to get compression status' });
    }
});

app.get('/api/test-compression', (req, res) => {
    const largeData = 'x'.repeat(10000);
    res.setHeader('Content-Type', 'text/plain');
    res.send(largeData);
});

app.get('/api/cache-stats', (req, res) => {
    try {
        const stats = getCacheStats();
        res.json({
            ...stats,
            cacheTTL: '30 minutes',
            cacheCleanupInterval: '10 minutes',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting cache stats:', error);
        res.status(500).json({ error: 'Failed to get cache stats' });
    }
});

app.post('/api/cache/clear', (req, res) => {
    try {
        const previousSize = cache.size;
        cache.clear();
        cacheStats = { hits: 0, misses: 0, totalRequests: 0 };
        
        console.log(`[CACHE CLEARED] Cleared ${previousSize} cache entries`);
        
        res.json({
            message: 'Cache cleared successfully',
            clearedEntries: previousSize,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error clearing cache:', error);
        res.status(500).json({ error: 'Failed to clear cache' });
    }
});

app.get('/api/cache/status', (req, res) => {
    try {
        const stats = getCacheStats();
        const cacheEntries = Array.from(cache.keys());
        
        res.json({
            ...stats,
            cacheEntries: cacheEntries,
            cacheSize: cache.size,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting cache status:', error);
        res.status(500).json({ error: 'Failed to get cache status' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/api/data`);
    console.log(`Compression status: http://localhost:${PORT}/api/compression-status`);
    console.log(`Cache stats: http://localhost:${PORT}/api/cache-stats`);
    console.log(`Cache status: http://localhost:${PORT}/api/cache/status`);
    
    try {
        const dataPath = path.join(__dirname, 'wbjee_orcr_data.json');
        const stats = fs.statSync(dataPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`Data file size: ${sizeMB}MB (will be compressed when served)`);
    } catch (error) {
        console.log('Could not read data file size');
    }
    
    console.log(`Compression enabled with gzip`);
    console.log(`Rate limiting: 50 requests per 15 minutes per IP`);
    console.log(`Domain protection: Only authorized domains can access data`);
    console.log(`Request logging: All API requests are logged`);
    console.log(`Memory caching: 30-minute TTL with automatic cleanup`);
    console.log(`Cache monitoring: Real-time statistics and management`);
});