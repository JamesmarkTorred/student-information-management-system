const express = require('express');
const cors = require('./middleware/cors');
const bodyParser = require('body-parser');
const studentRoutes = require('./routes/students');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors);
app.use(bodyParser.json());
app.use(express.static('public'));

// Routes
app.use('/api/students', studentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Serve frontend from the parent directory
app.use(express.static(path.join(__dirname, '../frontend')));

// For any other route, serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📊 Student Management System API available at http://localhost:${PORT}/api/students`);
    console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});