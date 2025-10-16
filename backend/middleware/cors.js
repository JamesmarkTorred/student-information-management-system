const cors = require('cors');

const corsOptions = {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'file://'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

module.exports = cors(corsOptions);