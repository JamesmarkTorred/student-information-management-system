const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - CORS for all origins in production
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(bodyParser.json());
app.use(express.json());

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Data file path
const dataPath = path.join(__dirname, 'data/students.json');

// Helper functions for file operations
const readStudentsData = async () => {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data file:', error);
        // Return empty array if file doesn't exist
        return [];
    }
};

const writeStudentsData = async (students) => {
    try {
        await fs.writeFile(dataPath, JSON.stringify(students, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing students data:', error);
        return false;
    }
};

// API Routes

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        res.json({ 
            status: 'OK', 
            message: 'Server is running',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(500).json({ error: 'Health check failed' });
    }
});

// GET all students
app.get('/api/students', async (req, res) => {
    try {
        console.log('Fetching students data...');
        const students = await readStudentsData();
        console.log(`Found ${students.length} students`);
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// GET student by ID
app.get('/api/students/:id', async (req, res) => {
    try {
        const students = await readStudentsData();
        const student = students.find(s => s.id === req.params.id);
        
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        res.json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'Failed to fetch student' });
    }
});

// POST new student
app.post('/api/students', async (req, res) => {
    try {
        const { id, fullName, gender, email, program, yearLevel, university } = req.body;
        
        // Validation
        if (!id || !fullName || !gender || !email || !program || !yearLevel || !university) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const students = await readStudentsData();
        
        // Check if student ID already exists
        if (students.find(s => s.id === id)) {
            return res.status(400).json({ error: 'Student ID already exists' });
        }

        // Check if email already exists
        if (students.find(s => s.email === email)) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const newStudent = {
            id,
            fullName,
            gender,
            email,
            program,
            yearLevel,
            university
        };

        students.push(newStudent);
        const success = await writeStudentsData(students);
        
        if (!success) {
            return res.status(500).json({ error: 'Failed to save student' });
        }

        res.status(201).json(newStudent);
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ error: 'Failed to create student' });
    }
});

// DELETE student
app.delete('/api/students/:id', async (req, res) => {
    try {
        const students = await readStudentsData();
        const studentIndex = students.findIndex(s => s.id === req.params.id);
        
        if (studentIndex === -1) {
            return res.status(404).json({ error: 'Student not found' });
        }

        students.splice(studentIndex, 1);
        const success = await writeStudentsData(students);
        
        if (!success) {
            return res.status(500).json({ error: 'Failed to delete student' });
        }

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

// GET stats
app.get('/api/students/stats/summary', async (req, res) => {
    try {
        const students = await readStudentsData();
        
        const stats = {
            total: students.length,
            male: students.filter(s => s.gender === 'Male').length,
            female: students.filter(s => s.gender === 'Female').length,
            programs: [...new Set(students.map(s => s.program))].length
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Serve frontend for all other routes
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
    console.log(`📁 Data path: ${dataPath}`);
});