# 📚 Learning Guide: Full Development Workflow

A step-by-step tutorial to learn how this project works and how to make changes.

---

## 🎯 Learning Objectives

By the end of this guide, you will:
1. ✅ Understand the 3-tier architecture (Frontend/Backend/Database)
2. ✅ Make a change to the frontend and see it live
3. ✅ Make a change to the backend and test it
4. ✅ Deploy both to production (Netlify)
5. ✅ Debug common issues

---

## 🚀 Part 1: Local Setup (15 minutes)

### Step 1.1: Clone & Install

```bash
# Open PowerShell in your project folder
cd kalvium-lu-tracker

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### Step 1.2: Setup Environment Variables

**Create `backend/.env`:**
```bash
# Copy this into backend/.env
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
JWT_SECRET=your_super_secret_key_change_this_in_production
NODE_ENV=development
PORT=5000
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

**For Frontend Production:**
Create `frontend/.env.production`:
```bash
VITE_API_BASE_URL=https://your-backend-url.com
VITE_SOCKET_URL=https://your-backend-url.com
```

### Step 1.3: Start Three Terminals (Important!)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Should show: "Backend running at http://localhost:5000"
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Should show: "VITE v7.3.1  ready in 500ms"
```

**Terminal 3 - Optional Admin:**
```bash
cd mathesar
docker-compose up
# Visit http://localhost to see database UI
```

✅ **You now have a local development environment!**

---

## 🎨 Part 2: Making Frontend Changes (30 minutes)

### Lesson 2.1: Update a Component

**Goal:** Change the login page title

**File:** `frontend/src/components/Login.jsx`

**Steps:**
1. Find line ~58 with: `<h2 className="text-3xl font-bold text-white">Kalvium LU Tracker</h2>`
2. Change to: `<h2 className="text-3xl font-bold text-white">My Learning Hub</h2>`
3. **Save the file** (Ctrl+S)
4. Look at Terminal 2 - should show "hmr update"
5. Check `http://localhost:5173` - it auto-refreshed! ✨

**What you learned:**
- React components auto-reload (Hot Module Replacement)
- Changes appear instantly without restarting

---

### Lesson 2.2: Update CSS Styling

**Goal:** Change button color from red to purple

**File:** `frontend/src/components/Login.jsx`

**Steps:**
1. Find button: `className="bg-red-600 hover:bg-red-700"`
2. Change to: `className="bg-purple-600 hover:bg-purple-700"`
3. Save (Ctrl+S)
4. Button color changes instantly ✨

**What you learned:**
- Tailwind CSS classes work instantly
- No need to restart anything

---

### Lesson 2.3: Update JavaScript Logic

**Goal:** Increase rate limit messages

**File:** `frontend/src/components/Login.jsx`

**Steps:**
1. Find password input validation (if any)
2. Add console.log to debug: `console.log('Login attempt:', email);`
3. Save file
4. Open browser DevTools (F12)
5. Try to login and see console output ✨

**What you learned:**
- Use `console.log()` for debugging
- Check browser DevTools Network tab to see API calls

---

## ⚙️ Part 3: Making Backend Changes (45 minutes)

### Lesson 3.1: Add a New API Endpoint

**Goal:** Create `/api/hello` that returns "Hello, World!"

**File:** `backend/server.js`

**Steps:**

1. Find the line with `app.get('/api/lus'...` (around line 260)
2. Add this BEFORE it:

```javascript
// Health check endpoint
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello, World!' });
});
```

3. Save the file
4. **Restart backend:** Press Ctrl+C, then type `npm start`
5. Open browser: `http://localhost:5000/api/hello`
6. Should see: `{"message":"Hello, World!"}`

**What you learned:**
- Express routes handle different URLs
- `GET` requests retrieve data
- Endpoints must be restarted to take effect

---

### Lesson 3.2: Create a Data Endpoint (Reads from Database)

**Goal:** Get total count of students

**File:** `backend/server.js`

**Steps:**

1. Add this endpoint (after the previous one):

```javascript
// Get student count
app.get('/api/stats/student-count', authenticateToken, authorizeRole('teacher'), async (req, res) => {
    try {
        const result = await db.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['student']);
        res.json({ studentCount: result.rows[0].count });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
});
```

2. Save & restart backend (Ctrl+C, `npm start`)
3. Test it with Frontend: Add to a React component:

```jsx
useEffect(() => {
    axios.get('http://localhost:5000/api/stats/student-count', {
        headers: { Authorization: `Bearer ${token}` }
    }).then(res => console.log('Stats:', res.data));
}, []);
```

4. Open DevTools and see the response

**What you learned:**
- `db.query()` runs SQL on PostgreSQL
- `$1` is a placeholder for safe queries
- Always require `authenticateToken` for sensitive data

---

### Lesson 3.3: Understanding the Request-Response Cycle

**Visualize this:**

```
Frontend Code:
┌─────────────────────────────────┐
│ axios.get('/api/student-count') │
└──────────────┬──────────────────┘
               │ HTTP GET
               ▼
Backend Express Route:
┌─────────────────────────────────┐
│ app.get('/api/student-count')   │
│ ↓                               │
│ db.query(SELECT COUNT(*))       │
│ ↓                               │
│ res.json({ studentCount: 150 }) │
└──────────────┬──────────────────┘
               │ JSON Response
               ▼
Frontend Receives:
┌─────────────────────────────────┐
│ response.data.studentCount = 150│
│ setState(150)                   │
│ <p>Total: 150 students</p>      │
└─────────────────────────────────┘
```

---

## 🔗 Part 4: Frontend + Backend Together (60 minutes)

### Complete Example: Add "Time Until Due Date" Feature

#### Step 4.1: Backend - Calculate Days Until Due

**File:** `backend/server.js`

Add this endpoint:

```javascript
app.get('/api/lus/:luId/days-until-due', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT due_date FROM learning_units WHERE id = $1', [req.params.luId]);
        const lu = result.rows[0];
        
        if (!lu || !lu.due_date) {
            return res.json({ daysLeft: null });
        }

        const today = new Date();
        const dueDate = new Date(lu.due_date);
        const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

        res.json({ daysLeft, dueDate: lu.due_date });
    } catch (err) {
        res.status(500).json({ message: 'Error calculating due date' });
    }
});
```

Restart backend: Ctrl+C, `npm start`

#### Step 4.2: Frontend - Display Days Until Due

**File:** `frontend/src/components/StudentDashboard.jsx`

Add this component:

```jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../lib/config';

function LUCard({ lu, token }) {
    const [daysLeft, setDaysLeft] = useState(null);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/lus/${lu.id}/days-until-due`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setDaysLeft(res.data.daysLeft));
    }, [lu.id, token]);

    const getColor = () => {
        if (daysLeft < 0) return 'text-red-500'; // Overdue
        if (daysLeft < 3) return 'text-yellow-500'; // Soon
        return 'text-green-500'; // Plenty of time
    };

    return (
        <div className="p-4 bg-[#1E1E1E] rounded-lg">
            <h3 className="text-white">{lu.title}</h3>
            <p className={`text-sm ${getColor()}`}>
                {daysLeft && daysLeft > 0 
                    ? `${daysLeft} days left` 
                    : daysLeft === 0 
                    ? 'Due today!' 
                    : 'Overdue'}
            </p>
        </div>
    );
}

export default LUCard;
```

#### Step 4.3: Test End-to-End

1. Both backend and frontend running
2. Login as student
3. See LU cards showing "X days left"
4. Try going back 1 day (edit database manually) and refresh
5. Count updates! ✨

**What you learned:**
- Frontend calls backend API
- Backend queries database
- Results flow back to frontend
- The full loop works!

---

## 🚀 Part 5: Git & Deployment (30 minutes)

### Step 5.1: Commit Your Changes

```bash
# From root of project
git status  # See what changed

# Stage changes
git add .

# Commit with message
git commit -m "Add days-until-due feature"

# Push to GitHub
git push origin main
```

### Step 5.2: Automatic Netlify Deployment

1. GitHub → https://github.com/your-username/kalvium-lu-tracker
2. You should see your commit
3. Go to https://app.netlify.com
4. Click your site
5. Watch the "Deployments" tab
6. After 2-5 minutes, status = "Published" ✅

### Step 5.3: Automatic Backend Deployment

If hosted on Heroku/Railway/Render:

1. They watch your GitHub `main` branch
2. On push, they auto-build and deploy
3. Check their dashboard for logs
4. Should complete in 5-10 minutes

### Step 5.4: Verify Live Site

1. Visit https://your-site.netlify.app
2. Try the feature you added
3. Open DevTools Network tab
4. See API calls to your live backend
5. **It works!** 🎉

---

## 🐛 Debugging Tricks

### Problem: "Cannot GET /api/..."

**Cause:** Backend not running

**Solution:**
```bash
# Check if port 5000 is in use
# Kill it and restart
cd backend
npm start
```

### Problem: Button click not working

**Cause:** JavaScript error

**Solution:**
```javascript
// Add error handling
button.onclick = async () => {
    try {
        await someFunction();
        console.log('Success!');
    } catch (err) {
        console.error('Error:', err);
    }
};
```

Open DevTools (F12) and check console for red errors.

### Problem: Data not saving to database

**Cause:** SQL error or wrong query

**Solution:**
1. Backend Terminal - look for red error logs
2. Check PostgreSQL is running
3. Verify DATABASE_URL is correct
4. Test query manually in Supabase SQL editor

### Problem: Deployed site shows old version

**Cause:** Browser cache

**Solution:**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or use Incognito mode (Ctrl+Shift+N)

---

## 📖 Common File Quick Reference

| File | Purpose | When to Edit |
|------|---------|--------------|
| `frontend/src/App.jsx` | Main routing | Change page structure |
| `frontend/src/components/*.jsx` | UI components | Change what user sees |
| `backend/server.js` | API endpoints | Add/change API calls |
| `backend/schema.sql` | Database tables | Change data structure |
| `frontend/src/lib/config.js` | API URL config | Point to different backend |
| `backend/.env` | Secrets | Change database/JWT |

---

## ✅ Checklist: You're Ready When...

- [ ] Backend runs without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] Both talk to each other (Network tab shows API calls)
- [ ] You can login with demo account
- [ ] You can make a code change and see it live
- [ ] You understand request-response flow
- [ ] You've committed code with git
- [ ] You've watched a Netlify deployment

---

## 🎓 Next Steps

1. **Modify** the Register form colors
2. **Add** a new API endpoint for user feedback
3. **Deploy** to Netlify and test live
4. **Join** the learning community!

**You're now a full-stack developer!** 🚀

---

*Questions? Check DEPLOYMENT.md for more advanced topics.*
