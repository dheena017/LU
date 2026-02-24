#!/usr/bin/env node

/**
 * Add subject_id to learning_units table
 */

require('dotenv').config();
const db = require('./db');

async function migrate() {
    console.log('🔄 Migrating learning_units table...\n');
    
    try {
        // Add subject_id column
        await db.query(`
            ALTER TABLE IF EXISTS learning_units 
            ADD COLUMN subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL;
        `);
        console.log('✓ Added subject_id column to learning_units');

        // Create index for faster queries
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_learning_units_subject 
            ON learning_units(subject_id);
        `);
        console.log('✓ Created index on learning_units.subject_id');

        console.log('\n✅ Migration complete!\n');
        process.exit(0);
    } catch (err) {
        if (err.message.includes('already exists')) {
            console.log('✓ Columns already exist (skipping)');
            process.exit(0);
        }
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
