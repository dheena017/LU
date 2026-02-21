# 🚀 Kalvium LU Tracker

A professional Learning Unit (LU) tracking system with a React frontend, Node.js/Express backend, and PostgreSQL (Supabase) database. Integrated with Mathesar for no-code data management.

---

## 🛠️ How to Start the App

You need to run **three** separate terminals to have the full system active:

### 1. **Start the Backend** (Database Logic)
```powershell
cd backend
node server.js
```
*Running at: `http://localhost:5000`*

### 2. **Start the Frontend** (The Dashboard)
```powershell
cd frontend
npm run dev
```
*View it at: `http://localhost:5173`*

### 3. **Start the Admin Panel** (Mathesar)
```powershell
cd mathesar
docker-compose up
```
*Manage data at: `http://localhost`*

---

## 🏗️ Project Architecture
- **Frontend**: React + Tailwind CSS + Lucide Icons
- **Backend**: Node.js + Express + Socket.IO (Real-time)
- **Database**: PostgreSQL (Hosted on **Supabase**)
- **Data Management**: Mathesar (Docker-based admin UI)

## 🔑 Key Credentials
- **Student**: `s1` (Login with `deena@kalvium.com` / `pass`)
- **Teacher**: `t1` (Login with `teacher@kalvium.com` / `pass`)

---

## 💡 Pro Tips
- **Syncing**: The app uses Socket.IO. If you change a grade in Mathesar or the Teacher dashboard, the Student dashboard updates automatically!
- **Database**: All data is stored in your Supabase project. You can also view/edit tables directly in the Supabase Table Editor.