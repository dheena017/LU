const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const LUS_FILE = path.join(__dirname, 'lus.json');
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(cors());
app.use(bodyParser.json());

// Helper functions
const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// Auth Route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Teacher: Get all students and their progress
app.get('/api/teacher/students', (req, res) => {
    const users = readJSON(USERS_FILE).filter(u => u.role === 'student');
    res.json(users);
});

// Teacher: Create LU with Due Date
app.post('/api/lus', (req, res) => {
    const lus = readJSON(LUS_FILE);
    const newLU = {
        id: Date.now(),
        title: req.body.title,
        module: req.body.module,
        dueDate: req.body.dueDate, // NEW
        assignedTo: req.body.assignedTo || []
    };
    lus.push(newLU);
    writeJSON(LUS_FILE, lus);
    res.status(201).json(newLU);
});

// Teacher: Provide Feedback/Grade
app.put('/api/teacher/grade/:userId/:luId', (req, res) => {
    const { userId, luId } = req.params;
    const { feedback, grade } = req.body;

    const users = readJSON(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        if (!users[userIndex].progress) users[userIndex].progress = {};

        // Ensure we preserve the existing status if only grading
        const currentData = users[userIndex].progress[luId] || { status: 'To Do' };
        const updatedData = typeof currentData === 'string' ? { status: currentData } : currentData;

        users[userIndex].progress[luId] = {
            ...updatedData,
            feedback,
            grade
        };

        writeJSON(USERS_FILE, users);
        res.json({ success: true, progress: users[userIndex].progress[luId] });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Student: Get my LUs
app.get('/api/student/:userId/lus', (req, res) => {
    const { userId } = req.params;
    const lus = readJSON(LUS_FILE);
    const userLus = lus.filter(lu => lu.assignedTo.includes(userId));

    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.id === userId);
    const progress = user.progress || {};

    const formattedLus = userLus.map(lu => {
        const prog = progress[lu.id] || 'To Do';
        return {
            ...lu,
            status: typeof prog === 'string' ? prog : prog.status,
            feedback: prog.feedback || null,
            grade: prog.grade || null
        };
    });

    res.json(formattedLus);
});

// Student: Update status
app.put('/api/student/:userId/lus/:luId', (req, res) => {
    const { userId, luId } = req.params;
    const { status } = req.body;

    const users = readJSON(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        if (!users[userIndex].progress) users[userIndex].progress = {};

        const currentData = users[userIndex].progress[luId] || {};
        const updatedData = typeof currentData === 'string' ? { status: currentData } : currentData;

        users[userIndex].progress[luId] = {
            ...updatedData,
            status: status
        };

        writeJSON(USERS_FILE, users);
        res.json({ success: true, status });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

app.get('/api/lus', (req, res) => res.json(readJSON(LUS_FILE)));

app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
