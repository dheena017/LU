const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT"]
    }
});

const PORT = 5000;
const LUS_FILE = path.join(__dirname, 'lus.json');
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(cors());
app.use(bodyParser.json());

// Helper functions
const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// Socket connection
io.on('connection', (socket) => {
    console.log('A user connected for real-time updates');
    socket.on('disconnect', () => console.log('User disconnected'));
});

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
        dueDate: req.body.dueDate,
        assignedTo: req.body.assignedTo || []
    };
    lus.push(newLU);
    writeJSON(LUS_FILE, lus);

    // Notify all clients of new LU
    io.emit('data_updated', { type: 'new_lu', title: newLU.title });

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

        const currentData = users[userIndex].progress[luId] || { status: 'To Do' };
        const updatedData = typeof currentData === 'string' ? { status: currentData } : currentData;

        users[userIndex].progress[luId] = {
            ...updatedData,
            feedback,
            grade
        };

        writeJSON(USERS_FILE, users);

        // Notify of grade update
        io.emit('data_updated', { type: 'grade_updated', userId });

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

        // Log Activity for Heatmap
        if (!users[userIndex].learningActivity) users[userIndex].learningActivity = [];
        const today = new Date().toISOString().split('T')[0];
        users[userIndex].learningActivity.push(today);

        writeJSON(USERS_FILE, users);

        // Notify of status update
        io.emit('data_updated', { type: 'status_updated', userId, status });

        res.json({ success: true, status });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

app.get('/api/lus', (req, res) => res.json(readJSON(LUS_FILE)));

// Registration
app.post('/api/register', (req, res) => {
    const { name, email, password, role, batch } = req.body;
    const users = readJSON(USERS_FILE);

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'User already exists with this email' });
    }

    const newUser = {
        id: `u${Date.now()}`,
        name,
        email,
        password,
        role,
        batch: role === 'student' ? (batch || 'Unassigned') : undefined,
        completedLUs: [],
        progress: {}
    };

    users.push(newUser);
    writeJSON(USERS_FILE, users);

    // Notify of new registration
    io.emit('data_updated', { type: 'registration' });

    res.status(201).json({ message: 'User created' });
});

// Update Profile
app.put('/api/profile/:userId', (req, res) => {
    const { userId } = req.params;
    const { name, email, bio } = req.body;

    const users = readJSON(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        users[userIndex] = {
            ...users[userIndex],
            name: name || users[userIndex].name,
            email: email || users[userIndex].email,
            bio: bio || users[userIndex].bio
        };

        writeJSON(USERS_FILE, users);

        // Notify of profile change
        io.emit('data_updated', { type: 'profile_updated', userId });

        const { password, ...userWithoutPassword } = users[userIndex];
        res.json(userWithoutPassword);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

server.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
