# 🔧 Setup Netlify & Supabase CLI

Complete guide to install and configure CLI tools for Netlify and Supabase on Windows.

---

## 🚀 Part 1: Setup Netlify CLI

### Step 1.1: Install Node.js (If Not Already)

Netlify CLI requires Node.js.

```bash
# Check if Node.js is installed:
node --version
npm --version

# If not installed:
# Download from https://nodejs.org (LTS version)
# Run the installer
# Restart PowerShell
```

### Step 1.2: Install Netlify CLI

```bash
# Install globally
npm install -g netlify-cli

# Verify installation
netlify --version
# Should show: netlify/17.x.x or similar
```

### Step 1.3: Authenticate with Netlify

```bash
# Login to your Netlify account
netlify login

# Browser will open:
# 1. Click "Authorize" button
# 2. You'll be logged in
# 3. Close browser and return to terminal
```

### Step 1.4: Link Your Project

```bash
# Navigate to project folder
cd c:\Users\dheen\kalvium-lu-tracker

# Link this folder to your Netlify site
netlify link

# Choose:
# → "Link this directory to an existing site" (if deploying existing site)
# → Or create new site
```

### Step 1.5: Test Deployment

```bash
# Build and preview locally
netlify build
netlify preview

# Or deploy directly
netlify deploy --prod

# You'll see:
# ✓ Deployed successfully
# → Your live URL
```

---

## ✅ Netlify CLI Commands Cheat Sheet

```bash
# Login
netlify login

# Link project to site
netlify link

# Deploy to staging
netlify deploy

# Deploy to production
netlify deploy --prod

# Build locally
netlify build

# Preview build locally
netlify preview

# Check site info
netlify sites:list

# View environment variables
netlify env:list

# Set environment variable
netlify env:set VITE_API_BASE_URL "https://your-backend.com"

# Show logs
netlify log:tail

# Open site in browser
netlify open:site
```

---

## 🚀 Part 2: Setup Supabase CLI

### Step 2.1: Install Supabase CLI

```bash
# Install globally using npm
npm install -g supabase

# Or using Windows Chocolatey (if installed):
choco install supabase-cli

# Verify installation
supabase --version
# Should show: supabase version X.X.X
```

### Step 2.2: Login to Supabase

```bash
# Start login
supabase login

# Browser will open:
# 1. Go to https://supabase.com
# 2. Sign in with your account
# 3. Create personal access token:
#    - Go to Account Settings → Tokens
#    - Create new token with "admin" scope
#    - Copy token
# 4. Paste in terminal when asked
```

### Step 2.3: Initialize Supabase Project

```bash
# Navigate to project (if not already there)
cd c:\Users\dheen\kalvium-lu-tracker

# Initialize Supabase
supabase init

# This creates:
# - supabase/ folder
# - supabase/config.toml
# - supabase/migrations/ folder

# Answer prompts:
# - Project name: kalvium-lu-tracker
# - Database password: [leave empty or set one]
```

### Step 2.4: Link to Existing Supabase Project

```bash
# If you already have a Supabase project:
supabase link --project-ref your_project_ref

# Find project ref at:
# https://supabase.com/dashboard/projects
# Click your project → Settings → API
# Copy "Reference ID" (looks like: abcdefghijklmnop)
```

### Step 2.5: Start Local Supabase

```bash
# Start local database server (requires Docker)
supabase start

# First time takes ~2 minutes to download Docker
# You'll see:
# ✓ Supabase local development started
# → API URL: http://localhost:54321
# → DB URL: postgresql://postgres:postgres@localhost:5432/postgres

# Stop it later with:
supabase stop
```

---

## ✅ Supabase CLI Commands Cheat Sheet

```bash
# Authentication
supabase login           # Login to account
supabase logout          # Logout

# Project
supabase init            # Initialize new project
supabase link            # Link to existing cloud project
supabase projects:list   # List your projects

# Local Development
supabase start           # Start local dev database
supabase stop            # Stop local database
supabase db:reset        # Reset local database

# Migrations
supabase migration:new   # Create new migration
supabase migration:list  # List all migrations
supabase db:push         # Push migrations to cloud

# Database
supabase db:pull         # Pull schema from cloud
supabase db:dump         # Export database

# Deployment
supabase db:migrate      # Run migrations on cloud

# Status
supabase status          # Show project status
```

---

## 🔗 Part 3: Connect Both CLI Tools to Your Project

### Step 3.1: Setup Environment Variables for Both

**Create `backend/.env`:**
```bash
# Get these from Supabase
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres
JWT_SECRET=your_random_secret_key
NODE_ENV=development
PORT=5000
CORS_ORIGINS=http://localhost:5173,https://your-site.netlify.app
```

**Create `frontend/.env.production`:**
```bash
# Get these from your backend hosting
VITE_API_BASE_URL=https://your-backend-url.com
VITE_SOCKET_URL=https://your-backend-url.com
```

### Step 3.2: Setup Netlify Environment Variables via CLI

```bash
# Navigate to project
cd c:\Users\dheen\kalvium-lu-tracker

# Set environment variable on Netlify
netlify env:set VITE_API_BASE_URL "https://your-backend-url.com"

# Set multiple at once
netlify env:set VITE_API_BASE_URL "https://your-backend-url.com"
netlify env:set VITE_SOCKET_URL "https://your-backend-url.com"

# View all environment variables
netlify env:list

# Trigger rebuild with new env vars
netlify deploy --prod
```

### Step 3.3: Setup Supabase Environment Variables

```bash
# Store DATABASE_URL in backend/.env
echo "DATABASE_URL=postgresql://..." > backend/.env

# Or manually:
# 1. Go to https://supabase.com/dashboard/projects
# 2. Click your project
# 3. Settings → Database
# 4. Copy connection string
# 5. Paste in backend/.env
```

---

## 🚀 Part 4: Complete Deployment Workflow

### Deploy to Netlify + Supabase

**Step 1: Prepare Everything**
```bash
cd c:\Users\dheen\kalvium-lu-tracker

# Make sure code is ready
npm run lint        # Check for errors
npm run build       # Test build works

# Commit all changes
git add .
git commit -m "Ready for deployment"
git push origin main
```

**Step 2: Deploy Frontend to Netlify**
```bash
# Option A: Auto-deploy via GitHub (recommended)
# Netlify watches GitHub automatically, just wait 2-5 minutes

# Option B: Manual deploy
netlify deploy --prod
```

**Step 3: Deploy Database Changes to Supabase**
```bash
# If you made database schema changes:
supabase db:push

# Or pull latest from cloud:
supabase db:pull
```

**Step 4: Deploy Backend (to separate hosting)**
```bash
# Backend hosting (Heroku/Railway/Render) auto-deploys
# Just push to GitHub:
git push origin main

# Check their dashboard for logs
# Should deploy in 5-10 minutes
```

---

## ✅ Verify Everything is Deployed

```bash
# Check Netlify site is live
netlify open:site

# Check backend is responding
curl https://your-backend-url.com/api/hello

# Should see: {"message":"Hello, World!"}

# Check database has latest schema
# Go to https://supabase.com/dashboard
# View tables in Supabase editor
```

---

## 🐛 Common CLI Issues & Fixes

### Issue: "netlify: command not found"

**Fix:**
```bash
# Reinstall globally
npm install -g netlify-cli

# Or check if npm is in PATH
npm list -g netlify-cli

# Should show path like:
# /Users/username/.npm/netlify-cli/...
```

### Issue: "supabase: command not found"

**Fix:**
```bash
# Check installation
npm list -g supabase

# If not installed:
npm install -g supabase

# Restart PowerShell after installing
```

### Issue: "Not authenticated" when running commands

**Fix:**
```bash
# Login again
netlify login
supabase login

# This will open browser for authentication
```

### Issue: "Cannot connect to Docker" (Supabase local)

**Fix:**
```bash
# Docker is required for local Supabase
# 1. Install Docker Desktop: https://docker.com/products/desktop
# 2. Restart computer
# 3. Try again: supabase start

# Or skip local and use cloud directly:
supabase link --project-ref your_project_ref
```

### Issue: "Permission denied" on Windows

**Fix:**
```bash
# Run PowerShell as Administrator
# Right-click PowerShell → "Run as Administrator"

# Then try command again
npm install -g netlify-cli
```

---

## 📊 CLI Tools Status Check

Run this to verify everything is installed:

```bash
# Check Node.js
node --version    # Should show: v18.x.x or newer

# Check npm
npm --version     # Should show: 9.x.x or newer

# Check Netlify CLI
netlify --version # Should show: netlify/17.x.x

# Check Supabase CLI
supabase --version # Should show: supabase X.X.X

# All showing versions? → You're ready! ✅
```

---

## 🎯 Quick Reference: What Each CLI Does

| Tool | What it does | Install | Login | Use Case |
|------|-------------|---------|-------|----------|
| **Netlify CLI** | Deploy frontend to Netlify | `npm install -g netlify-cli` | `netlify login` | Deploy React app |
| **Supabase CLI** | Manage cloud database | `npm install -g supabase` | `supabase login` | Push schema, pull data |

---

## 🚀 Typical Workflow with Both CLIs

```bash
# 1. Make code changes locally
# 2. Test frontend locally (npm run dev)
# 3. Test backend locally (npm start)

# 4. Commit to GitHub
git add .
git commit -m "New feature"
git push origin main

# 5. Netlify auto-deploys (or use: netlify deploy --prod)

# 6. If schema changed, push to Supabase:
supabase db:push

# 7. Monitor deployment:
netlify log:tail    # See Netlify logs
# + Check backend hosting dashboard for logs

# 8. Verify live site:
netlify open:site
# Test the feature on production
```

---

## 📚 Official Documentation

- **Netlify CLI:** https://docs.netlify.com/cli/get-started
- **Supabase CLI:** https://supabase.com/docs/guides/cli
- **Docker (for Supabase local):** https://docker.com/products/desktop

---

## ✅ You're Setup When:

- [ ] `netlify --version` shows version number
- [ ] `supabase --version` shows version number
- [ ] `netlify login` succeeds
- [ ] `supabase login` succeeds
- [ ] Your site linked with `netlify link`
- [ ] Project linked with `supabase link --project-ref YOUR_REF`
- [ ] Can run `netlify env:list` without errors
- [ ] Can run `supabase db:push` without errors (or local with Docker)

---

**Ready to deploy!** 🚀

Next: See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment workflow.
