/**
 * Mentor Routes
 * 
 * Endpoints for mentors to manage subjects and learning units
 */

const express = require('express');
const db = require('./db');

module.exports = function setupMentorRoutes(app, authenticateToken, authorizeRole, io) {
    
    // Get all subjects for a mentor
    app.get('/api/mentor/subjects', authenticateToken, authorizeRole('mentor'), async (req, res) => {
        try {
            const mentorId = req.user.id;
            
            // Get mentor's subjects
            const result = await db.query(`
                SELECT s.id, s.name, s.description
                FROM mentor_subjects ms
                JOIN subjects s ON ms.subject_id = s.id
                WHERE ms.mentor_id = $1
                ORDER BY s.name
            `, [mentorId]);
            
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to fetch subjects' });
        }
    });

    // Get learning units for a specific subject (mentor's subject)
    app.get('/api/mentor/subjects/:subjectId/lus', authenticateToken, authorizeRole('mentor'), async (req, res) => {
        try {
            const { subjectId } = req.params;
            const mentorId = req.user.id;
            
            // Verify mentor teaches this subject
            const authorizeResult = await db.query(`
                SELECT 1 FROM mentor_subjects 
                WHERE mentor_id = $1 AND subject_id = $2
            `, [mentorId, subjectId]);
            
            if (authorizeResult.rows.length === 0) {
                return res.status(403).json({ message: 'You do not teach this subject' });
            }
            
            // Get learning units for this subject
            const lusResult = await db.query(`
                SELECT id, title, module, due_date, status, tags
                FROM learning_units
                WHERE subject_id = $1
                ORDER BY created_at DESC
            `, [subjectId]);
            
            res.json(lusResult.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to fetch learning units' });
        }
    });

    // Create a learning unit for a subject (mentor)
    app.post('/api/mentor/subjects/:subjectId/lus', authenticateToken, authorizeRole('mentor'), async (req, res) => {
        try {
            const { subjectId } = req.params;
            const { title, module, dueDate, status, tags } = req.body;
            const mentorId = req.user.id;
            
            // Verify mentor teaches this subject
            const authorizeResult = await db.query(`
                SELECT 1 FROM mentor_subjects 
                WHERE mentor_id = $1 AND subject_id = $2
            `, [mentorId, subjectId]);
            
            if (authorizeResult.rows.length === 0) {
                return res.status(403).json({ message: 'You do not teach this subject' });
            }
            
            const luId = Date.now();
            const tagsArray = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []);
            
            await db.query(`
                INSERT INTO learning_units (id, title, module, due_date, status, tags, subject_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [luId, title, module, dueDate, status || 'Published', tagsArray, subjectId]);
            
            io.emit('data_updated', { 
                type: 'new_lu', 
                title, 
                subject: subjectId,
                mentor: mentorId 
            });
            
            res.status(201).json({ 
                id: luId, 
                title, 
                module,
                subjectId 
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to create learning unit' });
        }
    });

    // Update a learning unit (mentor - only if they teach the subject)
    app.put('/api/mentor/lus/:luId', authenticateToken, authorizeRole('mentor'), async (req, res) => {
        try {
            const { luId } = req.params;
            const { title, module, dueDate, status, tags } = req.body;
            const mentorId = req.user.id;
            
            // Get the LU and check if mentor teaches its subject
            const luResult = await db.query(`
                SELECT subject_id FROM learning_units WHERE id = $1
            `, [luId]);
            
            if (luResult.rows.length === 0) {
                return res.status(404).json({ message: 'Learning unit not found' });
            }
            
            const subjectId = luResult.rows[0].subject_id;
            
            // Verify mentor teaches this subject
            const authorizeResult = await db.query(`
                SELECT 1 FROM mentor_subjects 
                WHERE mentor_id = $1 AND subject_id = $2
            `, [mentorId, subjectId]);
            
            if (authorizeResult.rows.length === 0) {
                return res.status(403).json({ message: 'You cannot edit this unit' });
            }
            
            const tagsArray = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []);
            
            await db.query(`
                UPDATE learning_units 
                SET title = $1, module = $2, due_date = $3, status = $4, tags = $5
                WHERE id = $6
            `, [title, module, dueDate, status, tagsArray, luId]);
            
            io.emit('data_updated', { type: 'lu_updated', luId });
            
            res.json({ id: luId, title, module });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to update learning unit' });
        }
    });

    // Delete a learning unit (mentor - only if they teach the subject)
    app.delete('/api/mentor/lus/:luId', authenticateToken, authorizeRole('mentor'), async (req, res) => {
        try {
            const { luId } = req.params;
            const mentorId = req.user.id;
            
            // Get the LU and check if mentor teaches its subject
            const luResult = await db.query(`
                SELECT subject_id FROM learning_units WHERE id = $1
            `, [luId]);
            
            if (luResult.rows.length === 0) {
                return res.status(404).json({ message: 'Learning unit not found' });
            }
            
            const subjectId = luResult.rows[0].subject_id;
            
            // Verify mentor teaches this subject
            const authorizeResult = await db.query(`
                SELECT 1 FROM mentor_subjects 
                WHERE mentor_id = $1 AND subject_id = $2
            `, [mentorId, subjectId]);
            
            if (authorizeResult.rows.length === 0) {
                return res.status(403).json({ message: 'You cannot delete this unit' });
            }
            
            await db.query('DELETE FROM learning_units WHERE id = $1', [luId]);
            
            io.emit('data_updated', { type: 'lu_deleted', luId });
            
            res.json({ message: 'Learning unit deleted' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to delete learning unit' });
        }
    });

    // Get students enrolled in a subject (if needed)
    app.get('/api/mentor/subjects/:subjectId/students', authenticateToken, authorizeRole('mentor'), async (req, res) => {
        try {
            const { subjectId } = req.params;
            const mentorId = req.user.id;
            
            // Verify mentor teaches this subject
            const authorizeResult = await db.query(`
                SELECT 1 FROM mentor_subjects 
                WHERE mentor_id = $1 AND subject_id = $2
            `, [mentorId, subjectId]);
            
            if (authorizeResult.rows.length === 0) {
                return res.status(403).json({ message: 'You do not teach this subject' });
            }
            
            // Get all students (basic implementation)
            // In a full system, you'd have a student_subjects junction table
            const studentsResult = await db.query(`
                SELECT id, name, email, batch
                FROM users
                WHERE role = 'student'
                ORDER BY name
            `);
            
            res.json(studentsResult.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to fetch students' });
        }
    });
};
