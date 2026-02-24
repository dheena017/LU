-- Database Schema for Kalvium LU Tracker
-- Use this with any PostgreSQL database to enable Mathesar integration

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'student', 'mentor')),
    batch TEXT,
    bio TEXT,
    linkedin TEXT,
    description TEXT,
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

-- 5. Subjects/Courses Table
CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Mentor-Subject Junction Table (Many-to-Many)
-- Allows one mentor to teach multiple subjects
CREATE TABLE IF NOT EXISTS mentor_subjects (
    mentor_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (mentor_id, subject_id)
);

-- 7. Password Reset Tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token
    ON password_reset_tokens (token_hash);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user
    ON password_reset_tokens (user_id);

-- 7. Initial Seed Data (Optional)
INSERT INTO users (id, name, email, password, role) 
VALUES ('t1', 'Prof. Kalvium', 'teacher@kalvium.com', '$2b$10$AnDlaD2bp8DZ8eqUhAYkvOjL3Q7Irg/pHRqumP2LoHgH6iorYyF9a', 'teacher')
ON CONFLICT (id) DO NOTHING;

-- 8. Row Level Security (Supabase/PostgREST Safety)
-- Enable RLS on exposed tables so Supabase security checks pass.
ALTER TABLE IF EXISTS public.learning_units ENABLE ROW LEVEL SECURITY;

-- Read access for public clients.
DROP POLICY IF EXISTS learning_units_public_read ON public.learning_units;
CREATE POLICY learning_units_public_read
ON public.learning_units
FOR SELECT
TO anon, authenticated
USING (true);

-- Write access restricted to authenticated clients.
DROP POLICY IF EXISTS learning_units_authenticated_write ON public.learning_units;
CREATE POLICY learning_units_authenticated_write
ON public.learning_units
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
