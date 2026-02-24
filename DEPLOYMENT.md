# 🚀 Deployment & Development Guide

This guide teaches you how to make changes that work in both **Netlify (Frontend)** and your **Backend Server**, then deploy them to production.

---

## 📋 Understanding the Architecture

Your system has **3 main parts**:

```
┌─────────────────┐
│   FRONTEND      │  (React + Vite)
│   Netlify       │  Runs at: https://your-site.netlify.app
└────────┬────────┘
         │ API Calls (REST)
         │ Real-time (WebSocket)
         ▼
┌─────────────────┐
│   BACKEND       │  (Node.js + Express)
│   Heroku/Cloud  │  Runs at: https://backend-url.com
└────────┬────────┘
         │ SQL Queries
         │
         ▼
┌─────────────────┐
│   DATABASE      │  (PostgreSQL)
│   Supabase      │  Cloud data storage
└─────────────────┘
```

**Data Flow Example:**
```
User clicks "Save" in React
    ↓
Frontend sends POST /api/profile/:userId (axios)
    ↓
Backend receives request, validates token
    ↓
Backend queries PostgreSQL UPDATE
    ↓
Backend returns updated user JSON
    ↓
Frontend receives response, updates state
    ↓
User sees changes on screen
```

---

## 🛠️ Local Development Setup

### Start ALL THREE services in separate terminals:

#### **Terminal 1: Backend Server**
```bash
cd backend
node server.js
```
- Runs on `http://localhost:5000`
- Handles all API requests
- Connects to Supabase database

#### **Terminal 2: Frontend Development**
```bash
cd frontend
npm run dev
```
- Runs on `http://localhost:5173`
- Hot-reload (auto-refreshes on save)
- Calls backend at `http://localhost:5000`

#### **Terminal 3: Admin Panel (Optional)**
```bash
cd mathesar
docker-compose up
```
- Runs on `http://localhost` (port 80)
- Visualize database without code

---

## 📝 Making Changes: Step-by-Step

### **Scenario 1: Update Frontend Only (React Component)**

**Example:** Change the button color in Register.jsx

1. **Edit the file:**
   ```bash
   # Open: frontend/src/components/Register.jsx
   # Change the button class
   - className="bg-red-600"
   + className="bg-blue-600"
   ```

2. **Test locally:**
   - Save file → See auto-refresh in browser at `http://localhost:5173`
   - Check browser console for errors (`F12`)

3. **Deploy to Netlify:**
   ```bash
   git add frontend/src/components/Register.jsx
   git commit -m "Change button color to blue"
   git push origin main
   ```
   - Netlify auto-detects changes
   - Runs `npm run build` automatically
   - Deploys to live site within 2-5 minutes
   - Check deployment status: https://app.netlify.com

---

### **Scenario 2: Update Backend Only (API Endpoint)**

**Example:** Add a new endpoint to get user stats

1. **Edit backend file:**
   ```javascript
   // backend/server.js
   
   // Add this new endpoint (after existing routes)
   app.get('/api/user/:userId/stats', authenticateToken, async (req, res) => {
       try {
           const result = await db.query(
               'SELECT COUNT(*) as completedCount FROM user_progress WHERE user_id = $1 AND status = $2',
               [req.params.userId, 'Completed']
           );
           res.json(result.rows[0]);
       } catch (err) {
           res.status(500).json({ message: 'Database error' });
       }
   });
   ```

2. **Test locally:**
   - Save file → Restart backend: `Ctrl+C`, then `node server.js`
   - Test in browser: `http://localhost:5173`
   - Check browser Network tab (`F12` → Network) to see API calls

3. **Deploy to backend hosting:**
   ```bash
   git add backend/server.js
   git commit -m "Add user stats endpoint"
   git push origin main
   ```
   - Your hosting (Heroku/Railway/Render) auto-deploys
   - New endpoint is live at your backend URL

---

### **Scenario 3: Update Frontend + Backend Together**

**Example:** Add a "My Stats" card to student dashboard

**Step A: Backend API (Provide the data)**
```javascript
// backend/server.js
app.get('/api/student/:userId/stats', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT COUNT(*) as total, COUNT(CASE WHEN status = $1 THEN 1 END) as completed FROM user_progress WHERE user_id = $2',
            ['Completed', req.params.userId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});
```

**Step B: Frontend Component (Display the data)**
```jsx
// frontend/src/components/StudentDashboard.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../lib/config';

export default function StatsCard({ userId }) {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(
                    `${API_BASE_URL}/api/student/${userId}/stats`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
                );
                setStats(response.data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }
        };
        fetchStats();
    }, [userId]);

    if (!stats) return <div>Loading...</div>;

    return (
        <div className="bg-[#1E1E1E] p-6 rounded-lg">
            <h3 className="text-white font-bold">Your Progress</h3>
            <p>{stats.completed} / {stats.total} completed</p>
        </div>
    );
}
```

**Step C: Deploy Both**
```bash
git add backend/server.js frontend/src/components/StudentDashboard.jsx
git commit -m "Add student stats feature (frontend + backend)"
git push origin main
```
- Both get deployed automatically
- Frontend talks to new backend endpoint

---

## 🔐 Environment Variables

Your app uses `.env` files to store secrets (never commit these!).

### **Backend .env** (`backend/.env`)
```env
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
JWT_SECRET=your_secret_key_here_change_this
NODE_ENV=production
PORT=5000
CORS_ORIGINS=http://localhost:5173,https://your-site.netlify.app
```

### **Frontend .env** (`frontend/.env.production`)
```env
VITE_API_BASE_URL=https://your-backend-url.com
VITE_SOCKET_URL=https://your-backend-url.com
```

**How Netlify Receives Environment Variables:**
1. Go to https://app.netlify.com → Your Site
2. Settings → Build & Deploy → Environment
3. Add: `VITE_API_BASE_URL=https://your-backend-url.com`
4. Re-deploy to apply

---

## 🔄 Deployment Workflow Checklist

### **Before You Push (Local Testing)**
- [ ] Test on `http://localhost:5173` in your browser
- [ ] Open browser console (`F12`) - no red errors
- [ ] Test all features you changed
- [ ] Run `npm run lint` in frontend to check for syntax errors

### **Pushing to GitHub**
```bash
# From project root
git add .                                    # Stage all changes
git commit -m "Brief description of change"  # Commit with message
git push origin main                         # Push to GitHub
```

### **Frontend Deploys Automatically on Netlify**
- Netlify watches your GitHub repo
- When you push to `main`, it auto-builds and deploys
- Live in 2-5 minutes
- Check status: https://app.netlify.com → Deployments

### **Backend Deploys Automatically (if hosted on Heroku/Railway/Render)**
- Same as frontend - auto-deploys on push
- Check deployment logs on your hosting platform

### **Verify It Works**
1. Visit https://your-site.netlify.app
2. Perform the action you changed
3. Check browser Network tab (`F12` → Network)
4. See if API calls hit your backend
5. Confirm database updates appear

---

## 🐛 Debugging Common Issues

### **Issue: "Cannot GET /api/..."**
- Backend is not running or crashed
- **Fix:** Restart backend: `Ctrl+C` then `node server.js`

### **Issue: "CORS error" in console**
- Frontend and backend CORS settings don't match
- **Fix:** Check `backend/server.js` CORS_ORIGINS includes your frontend URL

### **Issue: Data doesn't save**
- Check if Backend is talking to Database
- **Fix:** Verify `DATABASE_URL` in `backend/.env` is correct

### **Issue: Netlify deploy fails**
- Wrong environment variables or build error
- **Fix:** Check Netlify deployment logs → App → Deployments → View logs

### **Issue: Changes don't appear after push**
- Browser cache showing old version
- **Fix:** Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

## 📂 File Structure Reference

```
kalvium-lu-tracker/
├── backend/
│   ├── server.js          ← Main API (edit here for new endpoints)
│   ├── db.js              ← Database connection
│   ├── schema.sql         ← Database tables
│   ├── package.json       ← Backend dependencies
│   └── .env               ← Secrets (don't push!)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx        ← Main React component
│   │   ├── components/    ← UI components (edit here for changes)
│   │   ├── lib/
│   │   │   └── config.js  ← API_BASE_URL points to backend
│   │   └── main.jsx       ← React entry point
│   ├── package.json       ← Frontend dependencies
│   └── .env.production    ← Production backend URL
│
└── README.md              ← Project info
```

---

## ✅ Quick Cheat Sheet

| Task | Command | Time |
|------|---------|------|
| Start local dev | Terminal 1: `node backend/server.js` + Terminal 2: `npm run dev` (frontend) | Instant |
| Deploy frontend | `git push origin main` | 2-5 min |
| Deploy backend | `git push origin main` | 5-10 min |
| Check live site | Visit https://your-site.netlify.app | Instant |
| View backend logs | Check hosting platform dashboard | Instant |
| Reset local data | Delete `backend/users.json`, restart backend | Instant |
| Hot reload frontend | Save a `.jsx` file → Auto-refresh | <1 sec |

---

## 📚 Learning Resources

- **React Docs:** https://react.dev
- **Express.js:** https://expressjs.com
- **PostgreSQL:** https://www.postgresql.org/docs
- **Netlify Deployment:** https://docs.netlify.com
- **Environment Variables:** https://12factor.net/config

---

**Now you're ready! Start with local testing, then push changes when ready.** 🚀
