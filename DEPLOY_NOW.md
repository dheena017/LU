# 🚀 DEPLOY NOW: Complete Production Guide

**Estimated time: 20 minutes**

Your app is ready to deploy! Follow these steps to get both frontend and backend live.

---

## 📋 What You'll Get

✅ Frontend live on Netlify  
✅ Backend live on Render.com (or your choice)  
✅ Database connected (Supabase)  
✅ Real-time updates working  
✅ Full production setup  

---

## ⚙️ Prerequisites Checklist

- [ ] GitHub repo with latest code pushed (`git push` done)
- [ ] Supabase database created ([supabase.com](https://supabase.com))
- [ ] Copy your Supabase connection string (from Settings → Database → Connection string)

---

## 🔧 PART 1: Deploy Backend (10 mins)

### Option A: Render.com (Easiest, Free Tier)

**Step 1: Create Render Account**
- Go to [render.com](https://render.com)
- Sign up with GitHub (click "Continue with GitHub")
- Authorize

**Step 2: Create New Web Service**
- Click "New +" → "Web Service"
- Connect your `kalvium-lu-tracker` GitHub repo
- Name: `kalvium-backend`
- Root directory: (leave blank)

**Step 3: Build & Start Commands**
- Build command: `npm install`
- Start command: `cd backend && node server.js`

**Step 4: Add Environment Variables** (scroll to "Environment")
```
DATABASE_URL = postgresql://postgres:YOUR_PASSWORD@db.supabase.co:5432/postgres
JWT_SECRET = (run this in terminal: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
CORS_ORIGINS = https://your-site.netlify.app,http://localhost:5173
NODE_ENV = production
```

**Step 5: Deploy**
- Click "Create Web Service"
- Wait 3-5 minutes
- You'll get a URL like: `https://kalvium-backend.onrender.com`
- **Copy this URL** (you'll need it for frontend)

---

### Option B: Railway.app (Alternative)

1. Go to [railway.app](https://railway.app) → Deploy → Import GitHub repo
2. Select `kalvium-lu-tracker`
3. Add Variables (same as above)
4. Deploy
5. Get your backend URL from Railway dashboard

---

## 🎨 PART 2: Deploy Frontend (10 mins)

### Step 1: Create Netlify Account
- Go to [netlify.com](https://netlify.com)
- Click "Sign up" → Select "GitHub"
- Authorize Netlify app for your repos

### Step 2: Add New Site
- Click "Add new site" → "Import an existing project"
- Select "GitHub"
- Choose the `kalvium-lu-tracker` repo

### Step 3: Configure Build
Netlify should auto-detect, but verify:
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### Step 4: Set Environment Variables
Before deploying, go to **Build & deploy** → **Environment**

Add these ONE AT A TIME:
```
Key: VITE_API_BASE_URL
Value: https://kalvium-backend.onrender.com

Key: VITE_SOCKET_URL  
Value: https://kalvium-backend.onrender.com
```

(Replace `kalvium-backend.onrender.com` with your actual backend URL from Step 1)

### Step 5: Deploy!
- Click "Deploy site"
- Wait 2-3 minutes
- Get your Netlify URL: `https://kalvium-lu-tracker.netlify.app`

---

## ✅ Test Everything Works

1. **Open your Netlify URL** in browser
2. **Try logging in:**
   - Email: `teacher@kalvium.com`
   - Password: `pass`
3. **Check for errors:**
   - Press `F12` → Console tab
   - Look for red errors
   - If you see CORS errors: backend CORS_ORIGINS needs updating

4. **Test features:**
   - Create a new LU (teacher)
   - Update student progress
   - See real-time socket updates

---

## 🔄 Update CORS if Needed

If you see CORS errors after deployment:

1. Go back to Render/Railway dashboard
2. Find your backend service
3. Go to Environment Variables
4. Update `CORS_ORIGINS` to include your final Netlify URL
5. Redeploy backend

Example:
```
CORS_ORIGINS=https://kalvium-lu-tracker.netlify.app,http://localhost:5173
```

---

## 🎉 You're Live!

Your production URLs:
- **Frontend:** https://kalvium-lu-tracker.netlify.app
- **Backend:** https://kalvium-backend.onrender.com
- **Database:** Supabase (managed automatically)

---

## 📝 Making Changes After Deploy

From now on, deployments are **automatic**:

```bash
# Make changes locally
# ... edit files ...

# Push to GitHub
git add .
git commit -m "Your change description"
git push origin main

# Frontend redeploys automatically in 2-3 minutes (Netlify)
# Backend redeploys automatically in 2-3 minutes (Render)
```

Monitor deployments:
- **Frontend:** https://app.netlify.com (Deployments tab)
- **Backend:** Your Render dashboard (Deployments tab)

---

## 🐛 Troubleshooting

### "Cannot POST /api/login" after deploy
- Frontend can't reach backend
- **Fix:** Check `VITE_API_BASE_URL` in Netlify env vars matches your backend URL exactly

### CORS error in console
- Backend doesn't allow your Netlify domain
- **Fix:** Update `CORS_ORIGINS` on Render/Railway and redeploy backend

### Login works but no data loads
- Socket.IO connection failing
- **Fix:** Check `VITE_SOCKET_URL` matches backend URL

### Deployment failed
- Check build logs: Netlify/Render dashboard → Deployments → Click failed deploy
- Common: Missing environment variables or build errors

---

## 🔐 Security Notes

✅ Never commit `.env` files  
✅ Use Netlify/Render UI for env variables (safer)  
✅ Rotate `JWT_SECRET` every 90 days  
✅ Keep `DATABASE_URL` secret (never share)  
✅ CORS_ORIGINS should be specific (not `*`)  

---

## 📞 Need Help?

- **Netlify docs:** https://docs.netlify.com
- **Render docs:** https://render.com/docs
- **Check build logs** - they often show exactly what's wrong

**Questions? Check the errors in your deployment logs first!**

---

*Your app is now production-ready! 🚀*
