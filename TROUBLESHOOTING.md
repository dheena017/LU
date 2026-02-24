# 🔧 Troubleshooting Guide

## How This File Works

When something breaks, find your error below and follow the fix. If not listed, see **General Troubleshooting** at bottom.

---

## Frontend Errors

### ❌ Blank White Screen
**What it means:** React crashed, nothing renders

**Fixes:**
1. Open browser DevTools: `F12`
2. Click "Console" tab
3. Look for red error message
4. Search that error in this file
5. If not found, Google it with "React" prefix

**Common causes:**
- Syntax error in JSX (missing comma, bracket)
- Import wrong file path
- Component not exported correctly

---

### ❌ "Cannot read property 'X' of undefined"
**What it means:** You're accessing something that doesn't exist (yet)

**Example:** `user.name` when `user` is `null`

**Fix:**
```jsx
// ❌ Wrong: Crashes if user is null
<p>{user.name}</p>

// ✅ Right: Check first
<p>{user?.name || 'Loading...'}</p>
```

---

### ❌ CORS Error: "blocked by CORS policy"
**What it means:** Frontend can't talk to backend

**Full error:** `Access to XML Http Request at 'http://localhost:5000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Fixes:**

**Option 1 (Best):** Check backend CORS_ORIGINS
```bash
# File: backend/.env

# Wrong ❌
CORS_ORIGINS=http://localhost:5000

# Right ✅
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,https://your-site.netlify.app
```

**Option 2:** Restart backend after changing .env
```bash
# Terminal 1: Press Ctrl+C
# Then: npm start
```

---

### ❌ API Call Returns 401 (Unauthorized)
**What it means:** Backend rejected your token

**Fixes:**

1. Check token is being sent:
```javascript
// In frontend, open DevTools Console:
console.log(localStorage.getItem('token'));

// Should show: eyJhbGciOiJ........
```

2. Token is missing → Login first
3. Token is invalid → Clear localStorage and login again:
```javascript
// In browser console:
localStorage.clear();
window.location.href = '/';
```

---

### ❌ Buttons/Links Not Working
**What it means:** Click handler not attached or has error

**Fixes:**

1. Check DevTools Console (F12) for errors
2. Add console.log to debug:
```jsx
function MyButton() {
    const handleClick = () => {
        console.log('Button clicked!'); // ← Add this
        doSomething();
    };
    return <button onClick={handleClick}>Click Me</button>;
}
```
3. Look for error in console
4. Fix the error

---

### ❌ Frontend Changes Not Appearing
**What it means:** Old code running, browser cached old version

**Fixes:**
```bash
# Hard refresh (clears cache):
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)

# OR use Incognito:
Ctrl+Shift+N (Windows) - clears cache automatically
```

---

## Backend Errors

### ❌ "Backend running at http://localhost:5000" but won't start

**Most common:** Port 5000 already in use

**Fix:**
```bash
# Windows: Kill process using port 5000
$port = 5000
$processId = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess
if ($processId) { Stop-Process -Id $processId -Force }

# Then restart:
npm start
```

---

### ❌ "ERROR: Cannot find module 'express'"
**What it means:** Dependencies not installed

**Fix:**
```bash
cd backend
npm install  # Downloads all packages
npm start
```

---

### ❌ "connect ECONNREFUSED 127.0.0.1:5432"
**What it means:** Backend can't connect to database

**Fix:**
1. Check DATABASE_URL in `backend/.env`:
```bash
# Should look like:
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres

# Check it's correct:
# - Has username:password
# - Has host (db.supabase.co)
# - Has database name (postgres)
```

2. If using Supabase, get correct URL:
   - Go to https://supabase.com
   - Your project → Settings → Database
   - Copy "Connection string" (use URI tab)
   - Replace in `backend/.env`

3. Restart backend: `npm start`

---

### ❌ "duplicate key value violates unique constraint"
**What it means:** Trying to create user that already exists

**Fix:**
```bash
# Clear users.json and restart:
# Or: Login with existing demo account instead
# Or: Edit database to remove duplicate
```

---

### ❌ "SyntaxError: Unexpected token"
**What it means:** JavaScript syntax error in server.js

**Fix:**
1. Read error message - it shows line number
2. Open `backend/server.js`
3. Go to that line number
4. Check for: missing comma, bracket, quote
5. Fix it
6. Restart: `npm start`

---

### ❌ API Endpoint Returns Empty Array `[]`
**What it means:** Query ran but found no data

**Fix:**
1. Check data exists in database:
   - Go to Supabase → SQL Editor
   - Run: `SELECT * FROM users;`
   - Should show rows

2. If empty: Insert demo data
   ```sql
   INSERT INTO users (id, name, email, password, role) 
   VALUES ('t1', 'Prof', 'teacher@kalvium.com', 'pass', 'teacher');
   ```

3. Try API again

---

## Database Errors

### ❌ "FATAL: too many connections"
**What it means:** Database connection pool full

**Fix:**
1. Connection leak in backend (forgot to close connection)
2. Restart backend: `npm start`
3. Check query is not hanging

---

### ❌ Can't Connect to Supabase
**What it means:** DATABASE_URL wrong or Supabase offline

**Fix:**
1. Verify DATABASE_URL format:
```bash
# Should be:
postgresql://[user]:[password]@[host]:[port]/[database]

# Example:
postgresql://postgres:YOUR_PASSWORD_HERE@db.supabase.co:5432/postgres
```

2. Test connection in terminal:
```bash
# On Windows, install PostgreSQL client first
# Then test:
psql [YOUR_DATABASE_URL]

# Should connect successfully
```

---

## Deployment Errors

### ❌ Netlify Build Fails
**Goes on Netlify → Deployments tab → Red X**

**Fixes:**

1. Check build logs:
   - Netlify → Your Site → Deployments
   - Click failed deployment → "Deploy log"
   - Read error message

2. Common errors:
   - `npm: not found` → Node.js not installed on Netlify
   - `Cannot find module` → Dependency missing
   - `env variable not found` → Add to Netlify > Build & Deploy > Environment

3. Add environment variable to Netlify:
   - Netlify App → Your Site → Settings
   - Build & Deploy → Environment
   - "Edit variables"
   - Add: `VITE_API_BASE_URL=https://your-backend-url.com`
   - Re-deploy

---

### ❌ Netlify Deploy Succeeds But Site Blank
**Deployed to Netlify but shows blank/errors**

**Fixes:**

1. Hard refresh browser:
```bash
Ctrl+Shift+R
```

2. Check frontend environment variables:
   - Create `frontend/.env.production`
   - Add correct `VITE_API_BASE_URL`

3. Test API connection:
   - Open DevTools (F12)
   - Network tab
   - Try logging in
   - See if API calls succeed or fail
   - If fail: Check VITE_API_BASE_URL is correct

---

### ❌ Backend Deployment Fails
**Heroku/Railway/Render shows deploy error**

**Fixes:**

1. Check deployment logs (platform-specific)
2. Common issues:
   - `dependencies not installed` → `npm install` locally, commit `package-lock.json`
   - `port not specified` → Add `PORT=5000` environment variable
   - `database URL missing` → Add `DATABASE_URL` in platform's environment variables

3. View logs:
   - Heroku: `heroku logs --tail`
   - Railway: Dashboard → Logs
   - Render: Dashboard → Logs

---

## Network/Connection Errors

### ❌ Network Timeout: Request Took Too Long
**What it means:** Backend not responding or database query slow

**Fixes:**

1. Check backend is running:
```bash
# Open browser to: http://localhost:5000/api/hello
# Should see: {"message":"Hello, World!"}

# If blank/error: Backend crashed
# Terminal 1: npm start
```

2. Check database query is not slow:
   - Open Supabase → Logs
   - Look for slow queries (> 5 seconds)
   - Optimize query or add index

3. Increase timeout in frontend:
```javascript
// In frontend API call:
axios.get(url, {
    timeout: 30000  // 30 seconds instead of default
}).then(...)
```

---

### ❌ "Failed to fetch" in Browser Console
**What it means:** Network request failed (many causes)

**Fixes:**

1. Check what URL is being called:
   - DevTools → Network tab
   - Look for red ❌ request
   - Copy URL
   - Try in browser address bar

2. If 404 (Not Found): Route doesn't exist
   - Check spelling in backend/server.js
   - Check method (GET vs POST)

3. If 500 (Server Error): Backend crashed
   - Terminal 1 check for red error
   - Restart: `npm start`

---

## Login/Auth Errors

### ❌ "Invalid credentials" but sure password is right
**What it means:** Password or email doesn't match database

**Fixes:**

1. Use demo credentials (they work):
```
Email: student1@kalvium.com
Pass: pass
```

2. If using custom account:
   - It might not exist in database
   - Register new account first: Click "Sign Up"
   - Then login with that email/password

3. Clear localStorage and try again:
```javascript
// Browser console:
localStorage.clear();
window.location.href = '/';
```

---

### ❌ "Session Expired" after login
**What it means:** JWT token expired or invalid

**Fixes:**

1. Close all tabs and reopen
2. Login again
3. Check JWT_SECRET in backend .env matches everywhere

---

## Real-Time/Socket.IO Errors

### ❌ "Real-time updates not working"
**What it means:** WebSocket connection failed

**Fixes:**

1. Check SOCKET_URL in frontend:
```javascript
// frontend/src/lib/config.js
export const SOCKET_URL = 'http://localhost:5000';  // ← Should match backend
```

2. Check Socket.IO running on backend:
```javascript
// backend/server.js should have:
const io = new Server(server, {
    cors: {
        origin: CORS_ORIGINS,
        ...
    }
});
```

3. Restart backend: `npm start`

---

## General Troubleshooting

### Step 1: Check All Services Running
```bash
# Should see 3 things working:

# Terminal 1: Backend
Backend running at http://localhost:5000

# Terminal 2: Frontend
VITE v7.3.1  ready in 500ms

# Browser: http://localhost:5173
Should load and not blank
```

If any missing, that's the problem.

---

### Step 2: Check Logs
- Frontend: Browser DevTools Console (F12)
- Backend: Terminal 1 (looks for red ERROR)
- Database: Supabase → Logs tab

---

### Step 3: Restart Everything
```bash
# Terminal 1: Ctrl+C, npm start
# Terminal 2: Ctrl+C, npm run dev
# Browser: Ctrl+Shift+R (hard refresh)
```

90% of issues fixed by restart!

---

### Step 4: Check Git Status
```bash
git status
# Maybe you have uncommitted changes breaking things
# Or need to pull latest from GitHub
```

---

### Step 5: Nuclear Option (Last Resort)
```bash
# Delete node_modules and reinstall
cd backend && rm -r node_modules && npm install
cd ../frontend && rm -r node_modules && npm install

# Clear browser cache
# Use Incognito mode Ctrl+Shift+N
```

---

## Can't Find Your Error?

1. **Search this file** for keywords from error message
2. **Google the error** with "React" or "Node.js" prefix
3. **Check project GitHub Issues** for similar problems
4. **Ask in learning community** with:
   - Full error message (copy/paste)
   - What you were trying to do
   - Which file you edited
   - Terminal output (screenshots)

---

## Still Stuck?

Contact your instructor or team lead with:
1. Screenshot of error
2. Terminal output (full logs)
3. What changed before error appeared
4. Steps to reproduce the issue

**Good luck!** 🚀
