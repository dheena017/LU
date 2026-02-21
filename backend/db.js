const { Pool } = require('pg');
require('dotenv').config();

// This is the "brain" that connects to your database
// It reads the connection details from a .env file for security
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err, client) => {
    console.error('❌ Unexpected error on idle client', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool // Export pool for one-time connections
};
