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
        // Return user without password
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

// Teacher: Create LU
app.post('/api/lus', (req, res) => {
    const lus = readJSON(LUS_FILE);
    const newLU = {
        id: Date.now(),
        ...req.body,
        assignedTo: req.body.assignedTo || []
    };
    lus.push(newLU);
    writeJSON(LUS_FILE, lus);
    res.status(201).json(newLU);
});

// Student: Get my LUs
app.get('/api/student/:userId/lus', (req, res) => {
    const { userId } = req.params;
    const lus = readJSON(LUS_FILE);
    const userLus = lus.filter(lu => lu.assignedTo.includes(userId));

    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.id === userId);

    // Attach status from user's completed/in-progress list if you want more complexity,
    // but for now let's just use the user's progress list in users.json
    const progress = user.progress || {};

    const formattedLus = userLus.map(lu => ({
        ...lu,
        status: progress[lu.id] || 'To Do'
    }));

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
        users[userIndex].progress[luId] = status;
        writeJSON(USERS_FILE, users);
        res.json({ success: true, status });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

app.get('/api/lus', (req, res) => res.json(readJSON(LUS_FILE)));

app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
