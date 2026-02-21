-- Database Schema for Kalvium LU Tracker
-- Use this with any PostgreSQL database to enable Mathesar integration

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
    batch TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Learning Units Table
CREATE TABLE IF NOT EXISTS learning_units (
    id BIGINT PRIMARY KEY, -- Matches the Date.now() style used in JSON
    title TEXT NOT NULL,
    module TEXT NOT NULL,
    due_date DATE,
    status TEXT DEFAULT 'Published' CHECK (status IN ('Published', 'Draft')),
    tags TEXT[], -- Postgres native array for easy filtering
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Student Progress & Assignments Table
-- This is a junction table connecting Students to LUs with their specific progress
CREATE TABLE IF NOT EXISTS user_progress (
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    lu_id BIGINT REFERENCES learning_units(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'Completed')),
    feedback TEXT,
    grade TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, lu_id)
);

-- 4. Activity Logs (For Heatmap/Streaks)
CREATE TABLE IF NOT EXISTS user_activity (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    UNIQUE(user_id, activity_date)
);

-- 5. Initial Seed Data (Optional)
INSERT INTO users (id, name, email, password, role) 
VALUES ('t1', 'Prof. Kalvium', 'teacher@kalvium.com', '$2b$10$AnDlaD2bp8DZ8eqUhAYkvOjL3Q7Irg/pHRqumP2LoHgH6iorYyF9a', 'teacher')
ON CONFLICT (id) DO NOTHING;
