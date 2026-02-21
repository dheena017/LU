const fs = require('fs');
const path = require('path');
const db = require('./db');

async function setupDatabase() {
    console.log('🚀 Starting Database Setup...');
    try {
        console.log('🔍 Testing connection...');
        const res = await db.query('SELECT NOW()');
        console.log('✅ Connection successful:', res.rows[0].now);

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('📝 Executing schema...');
        await db.query(schema);

        console.log('✅ Database Schema created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error setting up database:', err);
        process.exit(1);
    }
}

setupDatabase();
