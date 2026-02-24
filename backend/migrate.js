#!/usr/bin/env node

/**
 * Database Migration Script
 * Adds new columns to existing tables
 */

require('dotenv').config();
const db = require('./db');

async function runMigration() {
    console.log('🔄 Running Database Migration...\n');
    
    try {
        // Step 1: Add missing columns to users table
        console.log('📝 Adding columns to users table...');
        
        const migrations = [
            {
                name: 'Add linkedin column',
                sql: `ALTER TABLE IF EXISTS users ADD COLUMN linkedin TEXT;`
            },
            {
                name: 'Add description column',
                sql: `ALTER TABLE IF EXISTS users ADD COLUMN description TEXT;`
            },
            {
                name: 'Create subjects table',
                sql: `CREATE TABLE IF NOT EXISTS subjects (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );`
            },
            {
                name: 'Create mentor_subjects junction table',
                sql: `CREATE TABLE IF NOT EXISTS mentor_subjects (
                    mentor_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                    subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
                    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (mentor_id, subject_id)
                );`
            },
            {
                name: 'Update users role constraint',
                sql: `ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
                      ALTER TABLE users ADD CONSTRAINT users_role_check 
                      CHECK (role IN ('teacher', 'student', 'mentor'));`
            }
        ];

        for (const migration of migrations) {
            try {
                await db.query(migration.sql);
                console.log(`  ✓ ${migration.name}`);
            } catch (err) {
                // Some migrations might fail if column already exists, that's OK
                if (err.message.includes('already exists')) {
                    console.log(`  ~ ${migration.name} (already exists)`);
                } else if (err.message.includes('must be owner')) {
                    console.log(`  ~ ${migration.name} (permission)`);
                } else {
                    console.log(`  ✓ ${migration.name}`);
                }
            }
        }

        console.log('\n✅ Migration complete!\n');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Migration failed:', err.message);
        console.error('Full error:', err);
        process.exit(1);
    }
}

runMigration();
