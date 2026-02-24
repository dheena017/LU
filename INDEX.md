# 📑 Documentation Index & Navigation

This file helps you find the right guide for what you need to do.

---

## 🎯 What Do You Want to Do?

### "I'm brand new and just want to get it running"
→ **Read:** [QUICKSTART.md](QUICKSTART.md)
- Copy-paste commands to start backend + frontend
- 5 minutes to working system
- Then learn from there

---

### "I want to learn how this project works"
→ **Read:** [LEARNING.md](LEARNING.md)
- Step-by-step tutorial with examples
- How frontend talks to backend
- How deployment works
- 1-2 hours to understand the full flow

---

### "I made changes but they're not working"
→ **Read:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Find your error message
- Get step-by-step fix
- Learn why it happened

---

### "I want to deploy to Netlify/Production"
→ **Read:** [DEPLOYMENT.md](DEPLOYMENT.md)
- Environment variables setup
- How Netlify auto-deploys
- How backend deployment works
- Advanced deployment topics

### "I need to setup Netlify & Supabase CLI tools"
→ **Read:** [CLI_SETUP.md](CLI_SETUP.md)
- Install Netlify CLI step-by-step
- Install Supabase CLI step-by-step
- Login and authenticate
- Link to your projects
- Common CLI issues & fixes

---

### "I need a quick command reference"
→ **Read:** [QUICKSTART.md](QUICKSTART.md)
- Section: "⚡ Quick Start Cheat Sheet"
- Copy common commands
- 30-second lookup

---

## 📚 File Guide

| File | Purpose | Read When |
|------|---------|-----------|
| **README.md** | Project overview | Want high-level summary |
| **QUICKSTART.md** | Copy-paste commands | Want to run it now |
| **LEARNING.md** | Full tutorial | Want to understand how it works |
| **CLI_SETUP.md** | Install Netlify & Supabase CLI | Setting up deployment tools |
| **DEPLOYMENT.md** | Production guide | Ready to deploy |
| **TROUBLESHOOTING.md** | Fix problems | Something is broken |
| **This file** | Navigation | Don't know where to start |

---

## 🎓 Recommended Learning Path

### Day 1: Get it Running
1. Read QUICKSTART.md
2. Follow "Getting Started" section
3. Run all 3 terminals
4. See it working at http://localhost:5173

### Day 2: Understand the Architecture
1. Read LEARNING.md Part 1-2
2. Make a small frontend change (button color)
3. See auto-refresh magic
4. Change login page title

### Day 3: Backend Changes
1. Read LEARNING.md Part 3
2. Add new endpoint to backend
3. Test it with curl or fetch
4. Understand request-response cycle

### Day 4: Full Feature
1. Read LEARNING.md Part 4
2. Add a feature that uses both frontend + backend
3. Test end-to-end locally
4. Understand the full data flow

### Day 5: Deployment
1. Read DEPLOYMENT.md
2. Commit your code: `git push origin main`
3. Watch Netlify auto-deploy
4. Test on live site
5. Celebrate! 🎉

---

## 🔍 Find Info By Topic

### Frontend (React/Vite)
- How to change UI → **LEARNING.md** Part 2
- Styling with Tailwind → **LEARNING.md** Part 2
- API calls from frontend → **LEARNING.md** Part 4
- Debugging → **TROUBLESHOOTING.md** Frontend section

### Backend (Express.js/Node)
- How to add API endpoint → **LEARNING.md** Part 3
- Database queries → **LEARNING.md** Part 3
- Authentication/JWT → **DEPLOYMENT.md** Security section
- Environment variables → **DEPLOYMENT.md** Env section

### Database (PostgreSQL)
- Table schema → **backend/schema.sql** file
- RLS setup → **DEPLOYMENT.md** RLS section
- Query examples → **LEARNING.md** Part 3

### Deployment
- Netlify setup → **DEPLOYMENT.md** Netlify section
- Backend hosting → **DEPLOYMENT.md** Backend section
- Environment variables → **DEPLOYMENT.md** Env section
- Git flow → **DEPLOYMENT.md** Git section

### CLI Tools
- Install Netlify CLI → **CLI_SETUP.md** Part 1
- Install Supabase CLI → **CLI_SETUP.md** Part 2
- Authenticate & link projects → **CLI_SETUP.md** Part 3
- Common CLI issues → **CLI_SETUP.md** Troubleshooting section

### Troubleshooting
- Blank screen → **TROUBLESHOOTING.md** Frontend Errors
- Backend won't start → **TROUBLESHOOTING.md** Backend Errors
- Database connection → **TROUBLESHOOTING.md** Database Errors
- Deployment fails → **TROUBLESHOOTING.md** Deployment Errors

---

## 💡 Key Concepts Explained

### What is a Full-Stack App?
```
Frontend (React)        → What user sees
        ↕ (API calls)
Backend (Express)       → Where logic happens
        ↕ (SQL queries)
Database (PostgreSQL)   → Where data lives
```

See **LEARNING.md** Part 4 for visual examples.

### What is Git & GitHub?
Tool to track code changes and upload to cloud.

```
Local Changes → git add . → git commit → git push → GitHub
              (staging)  (saving)      (uploading)
```

See **DEPLOYMENT.md** Git section.

### What is Netlify?
Service that auto-builds and deploys frontend when you push to GitHub.

```
Push to GitHub → Netlify sees it → Builds → Deploys → Live!
                                  2-5 min
```

See **DEPLOYMENT.md** Netlify section.

### What are Environment Variables?
Secret values not committed to GitHub (like passwords).

```
❌ Don't do: DATABASE_URL=secret in code
✅ Do:      DATABASE_URL in .env file
            .env not pushed to GitHub
```

See **DEPLOYMENT.md** Environment section.

---

## 🚨 Common Situations

### "My code works locally but not on Netlify"
1. Check **TROUBLESHOOTING.md** → Deployment Errors
2. Likely: Environment variables missing
3. Read **DEPLOYMENT.md** → Environment Variables section

### "I made a change but nothing happened"
1. Check all 3 services running (backend, frontend, maybe database)
2. Hard refresh browser: Ctrl+Shift+R
3. Read **TROUBLESHOOTING.md** → "Frontend Changes Not Appearing"

### "API calls fail"
1. Is backend running?
2. Is CORS set up?
3. Is token valid?
4. Read **TROUBLESHOOTING.md** → Network/Connection Errors

### "Database says 'too many connections'"
1. Read **TROUBLESHOOTING.md** → Database Errors
2. Restart backend: Ctrl+C then npm start in Terminal 1

### "I broke something and don't know what"
1. Run: `git status` (see changed files)
2. Run: `git diff` (see exact changes)
3. Read **TROUBLESHOOTING.md** for your error
4. If stuck: Show someone the git diff

---

## 🔗 External Resources

### Learning
- **React:** https://react.dev (official docs)
- **Express.js:** https://expressjs.com (official docs)
- **Tailwind CSS:** https://tailwindcss.com (styling)
- **PostgreSQL:** https://postgresql.org (database)

### Deployment Platforms
- **Netlify:** https://netlify.com (frontend hosting)
- **Heroku:** https://heroku.com (backend hosting)
- **Railway:** https://railway.app (backend hosting)
- **Render:** https://render.com (backend hosting)

### Developer Tools
- **GitHub:** https://github.com (code storage)
- **Supabase:** https://supabase.com (database hosting)
- **Postman:** https://postman.com (API testing)
- **Visual Studio Code:** https://code.visualstudio.com (editor)

---

## ✅ Quick Decision Tree

```
┌─ What do you want to do?
│
├─→ "Get it running right now"?
│   └─→ QUICKSTART.md
│
├─→ "Learn how it works"?
│   └─→ LEARNING.md
│
├─→ "Make a feature"?
│   ├─→ Frontend only? → LEARNING.md Part 2
│   ├─→ Backend only? → LEARNING.md Part 3
│   └─→ Both? → LEARNING.md Part 4
│
├─→ "Setup CLI tools for deployment"?
│   └─→ CLI_SETUP.md
│
├─→ "Deploy to production"?
│   └─→ DEPLOYMENT.md
│
├─→ "Something's broken"?
│   └─→ TROUBLESHOOTING.md
│
└─→ "Need a quick command"?
    └─→ QUICKSTART.md (Cheat Sheet section)
```

---

## 🎓 Success Metrics

You're ready when you can:
- [ ] Start backend + frontend without errors
- [ ] Make a frontend change and see it live
- [ ] Add an API endpoint to backend
- [ ] Test it from frontend
- [ ] Push to GitHub
- [ ] See it deploy on Netlify
- [ ] Debug an error using the guides
- [ ] Explain the data flow to someone else

---

## 🤝 Get Help

**If you're stuck:**

1. **Search:** Find your error in TROUBLESHOOTING.md
2. **Read:** Follow the suggested fix
3. **Try:** Implement the fix
4. **Ask:** Show your error to an instructor/teammate
5. **Search Google:** "[Your error] React" or "[Your error] Node.js"

**When asking for help, provide:**
```
What I was trying to do:
[Describe your goal]

Full error message:
[Copy-paste the exact error, including line numbers]

What I've tried:
[List the fixes you already attempted]

Terminal / console output:
[Screenshot or copy-paste]
```

---

## 🎉 You're Ready!

Pick a guide above based on what you want to do.

**Recommended:** Start with QUICKSTART.md, then move to LEARNING.md.

Happy coding! 🚀

---

*Last updated: February 2026*
*Questions? Check the guide for your topic or search TROUBLESHOOTING.md*
