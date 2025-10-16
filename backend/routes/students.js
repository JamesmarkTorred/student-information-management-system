const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();
const dataPath = path.join(__dirname, '../data/students.json');

// Helper function to read students data
const readStudentsData = async () => {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, create it with empty array
        if (error.code === 'ENOENT') {
            await writeStudentsData([]);
            return [];
        }
        console.error('Error reading students data:', error);
        return [];
    }
};

// Helper function to write students data
const writeStudentsData = async (students) => {
    try {
        await fs.writeFile(dataPath, JSON.stringify(students, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing students data:', error);
        return false;
    }
};

// GET all students
router.get('/', async (req, res) => {
    try {
        const students = await readStudentsData();
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// GET student by ID
router.get('/:id', async (req, res) => {
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
router.post('/', async (req, res) => {
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

// PUT update student
router.put('/:id', async (req, res) => {
    try {
        const students = await readStudentsData();
        const studentIndex = students.findIndex(s => s.id === req.params.id);
        
        if (studentIndex === -1) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const { fullName, gender, email, program, yearLevel, university } = req.body;
        
        // Validation
        if (!fullName || !gender || !email || !program || !yearLevel || !university) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if email already exists (excluding current student)
        if (students.find((s, index) => s.email === email && index !== studentIndex)) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        students[studentIndex] = {
            ...students[studentIndex],
            fullName,
            gender,
            email,
            program,
            yearLevel,
            university
        };

        const success = await writeStudentsData(students);
        
        if (!success) {
            return res.status(500).json({ error: 'Failed to update student' });
        }

        res.json(students[studentIndex]);
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Failed to update student' });
    }
});

// DELETE student
router.delete('/:id', async (req, res) => {
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
router.get('/stats/summary', async (req, res) => {
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

module.exports = router;