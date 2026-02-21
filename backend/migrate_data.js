const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./db');

const readJSON = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8'));
const isBcryptHash = (value) => typeof value === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);

async function migrate() {
    console.log('📦 Starting SMART Migration (LUs first)...');

    try {
        const users = readJSON('users.json');
        const lus = readJSON('lus.json');

        console.log(`📚 Migrating ${lus.length} Learning Units...`);
        for (const lu of lus) {
            await db.query(
                'INSERT INTO learning_units (id, title, module, due_date, status, tags) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
                [lu.id, lu.title, lu.module, lu.dueDate, lu.status || 'Published', lu.tags || []]
            );
        }

        console.log(`👤 Migrating ${users.length} users...`);
        for (const user of users) {
            console.log(` -> Processing: ${user.name}`);
            const passwordToStore = isBcryptHash(user.password)
                ? user.password
                : await bcrypt.hash(String(user.password || ''), 10);
            await db.query(
                'INSERT INTO users (id, name, email, password, role, batch, bio) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET password = $4',
                [user.id, user.name, user.email, passwordToStore, user.role, user.batch, user.bio]
            );

            // Migrate progress
            if (user.progress) {
                for (const [luId, prog] of Object.entries(user.progress)) {
                    // Check if LU exists (sanity check for foreign key)
                    const luExists = await db.query('SELECT id FROM learning_units WHERE id = $1', [luId]);
                    if (luExists.rows.length === 0) {
                        console.warn(`  ! Skipping progress for LU ${luId} (LU not found)`);
                        continue;
                    }

                    const status = typeof prog === 'string' ? prog : prog.status;
                    const feedback = prog.feedback || null;
                    const grade = prog.grade || null;

                    await db.query(
                        'INSERT INTO user_progress (user_id, lu_id, status, feedback, grade) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id, lu_id) DO UPDATE SET status = $3, feedback = $4, grade = $5',
                        [user.id, luId, status, feedback, grade]
                    );
                }
            }

            // Migrate activity
            if (user.learningActivity) {
                for (const date of user.learningActivity) {
                    await db.query(
                        'INSERT INTO user_activity (user_id, activity_date) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                        [user.id, date]
                    );
                }
            }
        }

        console.log('✨ SMART Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
