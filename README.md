# 🚀 Kalvium LU Tracker (Ultra Edition)

A high-performance, professional Learning Unit (LU) tracking system designed for students and educators. This system features real-time updates, advanced safety guards, and a premium dark-themed aesthetic.

---

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