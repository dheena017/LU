const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const db = require('./db');
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('Missing JWT_SECRET environment variable. Refusing to start.');
    process.exit(1);
}

const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:4173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const io = new Server(server, {
    cors: {
        origin: CORS_ORIGINS,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    }
});

const isBcryptHash = (value) => typeof value === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || CORS_ORIGINS.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
};

// Security Middleware
app.use(helmet(process.env.NODE_ENV === 'production' ? {} : {
    contentSecurityPolicy: false,
}));
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access denied. Token missing.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
};

const authorizeRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
        }
        next();
    };
};

// Socket connection
io.on('connection', (socket) => {
    console.log('A user connected for real-time updates');
    socket.on('disconnect', () => console.log('User disconnected'));
});

// Auth Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        let storedPasswordHash = user.password;
        if (!isBcryptHash(storedPasswordHash)) {
            if (password !== user.password) {
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }
            storedPasswordHash = await bcrypt.hash(password, 10);
            await db.query('UPDATE users SET password = $1 WHERE id = $2', [storedPasswordHash, user.id]);
        }

        const isMatch = await bcrypt.compare(password, storedPasswordHash);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        const { password: _, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

// Teacher: Get all students and their progress
app.get('/api/teacher/students', authenticateToken, authorizeRole('teacher'), async (req, res) => {
    try {
        const studentsRes = await db.query('SELECT * FROM users WHERE role = $1', ['student']);
        const progressRes = await db.query('SELECT * FROM user_progress');
        const activityRes = await db.query('SELECT * FROM user_activity');

        const students = studentsRes.rows.map(student => {
            const studentProgress = {};
            progressRes.rows
                .filter(p => p.user_id === student.id)
                .forEach(p => {
                    studentProgress[p.lu_id] = {
                        status: p.status,
                        feedback: p.feedback,
                        grade: p.grade
                    };
                });

            const learningActivity = activityRes.rows
                .filter(a => a.user_id === student.id)
                .map(a => {
                    try {
                        return new Date(a.activity_date).toISOString().split('T')[0];
                    } catch (e) {
                        return a.activity_date;
                    }
                });

            return {
                ...student,
                progress: studentProgress,
                learningActivity: learningActivity
            };
        });

        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

// Teacher: Create LU with Due Date
app.post('/api/lus', authenticateToken, authorizeRole('teacher'), async (req, res) => {
    const { title, module, dueDate, assignedTo, status, tags } = req.body;
    const luId = Date.now();
    try {
        await db.query(
            'INSERT INTO learning_units (id, title, module, due_date, status, tags) VALUES ($1, $2, $3, $4, $5, $6)',
            [luId, title, module, dueDate, status || 'Published', tags || []]
        );

        // Assign to students
        if (assignedTo && assignedTo.length > 0) {
            for (const userId of assignedTo) {
                await db.query(
                    'INSERT INTO user_progress (user_id, lu_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [userId, luId]
                );
            }
        }

        if (status !== 'Draft') {
            io.emit('data_updated', { type: 'new_lu', title });
        }

        res.status(201).json({ id: luId, title, module });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
});

// Teacher: Grade an LU (Personalized Feedback)
app.put('/api/teacher/grade/:studentId/:luId', authenticateToken, authorizeRole('teacher'), async (req, res) => {
    const { studentId, luId } = req.params;
    const { feedback, grade } = req.body;
    try {
        await db.query(
            'UPDATE user_progress SET feedback = $1, grade = $2 WHERE user_id = $3 AND lu_id = $4',
            [feedback, grade, studentId, luId]
        );
        io.emit('data_updated', { type: 'grade_updated', userId: studentId });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
});

// Student: Get my LUs
app.get('/api/student/:userId/lus', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    // Security check: Student can only access their own data
    if (req.user.role === 'student' && req.user.id !== userId) {
        return res.status(403).json({ message: 'Unauthorized access to student data' });
    }
    try {
        const result = await db.query(`
            SELECT 
                lu.id::TEXT as id, 
                lu.title, 
                lu.module, 
                lu.due_date AS "dueDate", 
                lu.status AS "luStatus", 
                lu.tags,
                up.status AS "status", 
                up.feedback, 
                up.grade
            FROM learning_units lu
            JOIN user_progress up ON lu.id = up.lu_id
            WHERE up.user_id = $1 AND (lu.status = 'Published' OR lu.status IS NULL)
        `, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

// Student: Update status
app.put('/api/student/:userId/lus/:luId', authenticateToken, async (req, res) => {
    const { userId, luId } = req.params;
    if (req.user.role === 'student' && req.user.id !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    const { status } = req.body;
    try {
        await db.query(
            'UPDATE user_progress SET status = $1 WHERE user_id = $2 AND lu_id = $3',
            [status, userId, luId]
        );

        // Log Activity
        const today = new Date().toISOString().split('T')[0];
        await db.query(
            'INSERT INTO user_activity (user_id, activity_date) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, today]
        );

        io.emit('data_updated', { type: 'status_updated', userId, status });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

app.get('/api/lus', authenticateToken, authorizeRole('teacher'), async (req, res) => {
    try {
        const lusRes = await db.query('SELECT id::TEXT as id, title, module, due_date AS "dueDate", status, tags FROM learning_units');
        const assignmentsRes = await db.query('SELECT lu_id::TEXT as lu_id, user_id FROM user_progress');

        const lus = lusRes.rows.map(lu => {
            return {
                ...lu,
                assignedTo: assignmentsRes.rows
                    .filter(a => a.lu_id === lu.id)
                    .map(a => a.user_id)
            };
        });
        res.json(lus);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

// Teacher: Delete Learning Unit
app.delete('/api/lus/:id', authenticateToken, authorizeRole('teacher'), async (req, res) => {
    const { id } = req.params;
    try {
        // Delete assignments first (User Progress)
        await db.query('DELETE FROM user_progress WHERE lu_id = $1', [id]);
        // Delete LU itself
        await db.query('DELETE FROM learning_units WHERE id = $1', [id]);

        io.emit('data_updated', { type: 'lu_deleted', id });
        res.json({ success: true, message: 'Learning Unit deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

// Profile retrieval
app.get('/api/profile/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    if (req.user.role === 'student' && req.user.id !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    try {
        const userRes = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
        const actRes = await db.query('SELECT activity_date FROM user_activity WHERE user_id = $1', [userId]);

        const user = userRes.rows[0];
        if (user) {
            const { password, ...safeUser } = user;
            safeUser.learningActivity = actRes.rows.map(r => {
                const date = new Date(r.activity_date);
                return date.toISOString().split('T')[0];
            });
            res.json(safeUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

// Registration
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, role, batch } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ message: 'Missing required registration fields' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const id = `u${Date.now()}`;
        await db.query(
            'INSERT INTO users (id, name, email, password, role, batch) VALUES ($1, $2, $3, $4, $5, $6)',
            [id, name, email, hashedPassword, role || 'student', batch || 'Unassigned']
        );
        io.emit('data_updated', { type: 'registration' });
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'User already exists or database error' });
    }
});

// Update Profile
app.put('/api/profile/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    if (req.user.id !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    const { name, email, bio } = req.body;
    try {
        await db.query(
            'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), bio = COALESCE($3, bio) WHERE id = $4',
            [name, email, bio, userId]
        );
        const updatedUserRes = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
        const updatedUser = updatedUserRes.rows[0];
        const { password, ...safeUser } = updatedUser;
        io.emit('data_updated', { type: 'profile_updated', userId });
        res.json(safeUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

server.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
