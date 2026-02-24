# ⚡ Quick Start Cheat Sheet

Copy-paste these commands for common tasks.

---

## 🚀 Getting Started (First Time)

```bash
# 1. Install dependencies
cd backend && npm install && cd ../frontend && npm install && cd ..

# 2. Set up environment (copy your DATABASE_URL from Supabase)
# Create backend/.env with DATABASE_URL and JWT_SECRET

# 3. Start everything (in 3 separate terminals)
# Terminal 1:
cd backend && npm start

# Terminal 2:
cd frontend && npm run dev

# Terminal 3 (Optional - Database UI):
cd mathesar && docker-compose up
```

---

## 📝 Regular Development

### Make Frontend Changes
```bash
# Edit file in frontend/src/
# Save → Auto-refreshes at http://localhost:5173
# No restart needed!
```

### Make Backend Changes
```bash
# Edit file in backend/
# Restart: Press Ctrl+C in Terminal 1
# Run: npm start
# Test at http://localhost:5000
```

### Run Database Setup
```bash
cd backend
npm run setup  # Runs schema.sql
```

---

## 🔄 Git & Deployment

### Commit & Push
```bash
git add .
git commit -m "Your message here"
git push origin main
```

### Deploy Frontend (Netlify)
- Just push to GitHub main branch
- Netlify auto-builds in 2-5 minutes
- Check: https://app.netlify.com

### Deploy Backend (Heroku/Railway)
- Just push to GitHub main branch
- Your host auto-deploys
- Takes 5-10 minutes

---

## 🧪 Testing APIs

### Test Backend Endpoint with curl
```bash
# GET request
curl http://localhost:5000/api/hello

# POST request with token
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass"}'
```

### Test in Browser Console
```javascript
// Get with token
fetch('http://localhost:5000/api/profile/USER_ID', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
}).then(r => r.json()).then(d => console.log(d))

// POST
fetch('http://localhost:5000/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Test', email: 'test@test.com', password: 'pass' })
}).then(r => r.json()).then(d => console.log(d))
```

---

## 🐛 Debugging

### View Backend Logs
```bash
# Terminal shows live logs
# Look for errors (red text)
# Restart if crashed: Ctrl+C then npm start
```

### View Frontend Errors
```bash
# Open browser DevTools: F12
# Console tab: see all errors
# Network tab: see API calls
# Click request → Response → see JSON data
```

### Clear Cache
```bash
# Hard refresh browser
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)

# Or use Incognito Mode
Ctrl+Shift+N (Windows)
Cmd+Shift+N (Mac)
```

---

## 🔐 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=change_this_to_random_string
NODE_ENV=development
PORT=5000
CORS_ORIGINS=http://localhost:5173,https://your-site.netlify.app
```

### Frontend (.env.production)
```
VITE_API_BASE_URL=https://your-backend-url.com
VITE_SOCKET_URL=https://your-backend-url.com
```

---

## 📋 Useful Commands

| Command | What it does |
|---------|-------------|
| `npm start` (backend) | Run backend server |
| `npm run dev` (frontend) | Run frontend dev server |
| `npm run build` (frontend) | Build for production |
| `npm run lint` (frontend) | Check code quality |
| `git status` | See changed files |
| `git add .` | Stage all changes |
| `git commit -m "msg"` | Commit changes |
| `git push origin main` | Push to GitHub |
| `npm install` | Install dependencies |

---

## 🔗 Important URLs (Local)

```
Frontend:     http://localhost:5173
Backend:      http://localhost:5000
Backend API:  http://localhost:5000/api/*
Admin Panel:  http://localhost (port 80)
```

---

## 📍 Demo Credentials

```
Teacher:
  Email: teacher@kalvium.com
  Pass: pass

Student 1:
  Email: student1@kalvium.com
  Pass: pass

Student 2:
  Email: student2@kalvium.com
  Pass: pass
```

---

## 🚨 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "EADDRINUSE: Port 5000 already in use" | Kill existing process: `taskkill /F /IM node.exe` |
| "Cannot GET /api/..." | Backend crashed, restart: `npm start` |
| "CORS error in console" | Add frontend URL to CORS_ORIGINS in backend/.env |
| "Blank screen" | Check browser console (F12) for red errors |
| "Database connection error" | Verify DATABASE_URL is correct in backend/.env |
| "Changes not appearing" | Hard refresh: Ctrl+Shift+R |
| "API calls fail after deploy" | Check environment variables on Netlify/hosting |

---

## 🎯 Workflow: Make a Feature

```
1. Edit backend/server.js (add POST endpoint)
2. Add SQL query to database
3. Test in Terminal 1 (backend) - check logs
4. Edit frontend/src/components/*.jsx (add hook + API call)
5. Test in Terminal 2 (frontend) - check Network tab (F12)
6. `git add .` → `git commit -m "msg"` → `git push`
7. Wait 5-10 minutes for deployment
8. Test live at https://your-site.netlify.app
```

---

## 📚 Learn More

- **Frontend:** LEARNING.md (step-by-step tutorial)
- **Deployment:** DEPLOYMENT.md (production guide)
- **Original README:** README.md (project overview)

---

**Happy Coding!** 🚀
