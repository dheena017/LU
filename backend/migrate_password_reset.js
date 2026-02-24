#!/usr/bin/env node

/**
 * Migration: Add password_reset_tokens table
 * Usage: node migrate_password_reset.js
 */

require('dotenv').config();
const db = require('./db');

const run = async () => {
    try {
        console.log('🔄 Migrating password reset tokens table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id SERIAL PRIMARY KEY,
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                token_hash TEXT NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                used_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token
            ON password_reset_tokens (token_hash);
        `);
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user
            ON password_reset_tokens (user_id);
        `);
        console.log('✅ Password reset tokens migration complete');
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    } finally {
        process.exit(0);
    }
};

run();
