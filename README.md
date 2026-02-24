# 🚀 Kalvium LU Tracker (Ultra Edition)

A high-performance, professional Learning Unit (LU) tracking system designed for students and educators. This system features real-time updates, advanced safety guards, and a premium dark-themed aesthetic.

---

## 📖 Documentation Guide

**New to this project?** Start here in order:

1. **[QUICKSTART.md](QUICKSTART.md)** ⚡ - Copy-paste commands to get running (5 min)
2. **[LEARNING.md](LEARNING.md)** 📚 - Full tutorial: How to make changes (1 hour)
3. **[DEPLOYMENT.md](DEPLOYMENT.md)** 🚀 - Deploy to Netlify & production (Advanced)
4. **[README.md](README.md)** - Project overview (this file)

## 🛠️ Quick Start Guide

To run the full system, open **three separate terminals**:

### 1. **Backend Server** (Auth & Database Logic)
```powershell
cd backend
node server.js
```
*   **Port**: `5000`
*   **Role**: Handles JWT auth, PostgreSQL queries, and real-time Socket.IO broadcasts.

### 2. **Frontend App** (Client Dashboard)
```powershell
cd frontend
npm run dev
```
*   **Port**: `5173`
*   **Role**: Premium React interface with role-based routing and live data syncing.

### 🌐 Deploy Frontend to Netlify

The `frontend` app is ready for Netlify deployment (SPA routing + build config already included).

1. Push this repo to GitHub.
2. In Netlify: **Add new site** → **Import from Git**.
3. Select the repository and set:
	- **Base directory**: `frontend`
	- **Build command**: `npm run build`
	- **Publish directory**: `dist`
4. Add Netlify environment variables:
	- `VITE_API_BASE_URL` = your deployed backend URL (example: `https://your-backend.onrender.com`)
	- `VITE_SOCKET_URL` = same backend URL (or your socket endpoint)
5. Deploy.

> ⚠️ Netlify hosts the React frontend only. The Node/Express backend should be deployed on a backend host (Render/Railway/EC2/etc).

### 🔌 Backend CORS Setup for Production

After backend deployment, allow your Netlify domain in CORS:

```powershell
# Example environment variable on your backend host
CORS_ORIGINS=https://your-site.netlify.app,http://localhost:5173
```

Also ensure `JWT_SECRET` is set in backend environment variables.

### 3. **Admin Panel** (Mathesar Data Management)
```powershell
cd mathesar
docker-compose up
```
*   **Port**: `80` (Localhost)
*   **Role**: No-code interface for bulk editing LUs, student records, and database schema.

---

## 🏗️ Technical Stack

*   **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons + Framer Motion (Animations).
*   **Backend**: Node.js + Express.js.
*   **Real-time**: Socket.IO for instant dashboard updates without page refreshes.
*   **Database**: PostgreSQL (Cloud-hosted via **Supabase**).
*   **Security**: JWT (JSON Web Tokens) for session management + Bcrypt for password hashing.

---

## 🛡️ Stability & Safety Features (Recent Updates)

We implemented several "Safety Nets" to prevent technical failures:

1.  **Global Error Boundary**: Wrapped the entire application in a recovery component. If a rendering crash occurs, it displays a "System Halted" recovery screen instead of a "Black Screen."
2.  **Session Validation**: The app now strictly validates user data on startup. If a session is corrupted or missing a "Role," it automatically clears local storage to prevent redirect loops.
3.  **Full Profile Synchronization**: The Profile Update API now returns the complete, sanitized user object to ensure the frontend state remains consistent after edits.
4.  **Role-Based Access Control (RBAC)**: Secure routing ensures Teachers can only access teacher dashboards and Students can only see their own LUs.

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Teacher** | `teacher@kalvium.com` | `pass` |
| **Student** | `student1@kalvium.com` | `pass` |
| **Alternative Student** | `student2@kalvium.com` | `pass` |

---

## 📂 Database Schema Overview

The system uses three primary tables in PostgreSQL:
*   `users`: Stores profile data, hashed passwords, and roles (`teacher`/`student`).
*   `learning_units`: Stores LU titles, modules, due dates, and tags.
*   `user_progress`: Junction table linking users to LUs with `status` (Pending/In Progress/Completed), `grade`, and `feedback`.
*   `user_activity`: Tracks login/update frequency for the "Learning Streak" heatmap.

---

## 💡 Troubleshooting Tips

*   **Black Screen?**: This usually means a syntax error in the code or a broken JSX tag. Check the `npm run dev` terminal for specific line errors.
*   **Port 5000 Error?**: If you see `EADDRINUSE`, it means an old node process is stuck. Run `taskkill /F /IM node.exe` and restart.
*   **Login Loop?**: Clear your browser's local storage or use the "Reset Session" button on the Error Boundary screen.

---
*Created with ❤️ for the Kalvium Ecosystem.*