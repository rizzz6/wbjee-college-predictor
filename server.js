const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Enable CORS for your domain
app.use(cors({
    origin: ['http://localhost:3000', 'https://yourdomain.com'], // Add your domain
    credentials: true
}));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Serve static files
app.use(express.static('public'));

// API endpoint to get data (protected)
app.get('/api/data', (req, res) => {
    try {
        // Log requests for monitoring
        console.log(`Data request from IP: ${req.ip} at ${new Date().toISOString()}`);
        
        const data = fs.readFileSync(path.join(__dirname, 'wbjee_orcr_data.json'), 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error serving data:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
}); 