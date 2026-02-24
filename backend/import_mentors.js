#!/usr/bin/env node

/**
 * Bulk Import Mentors & Subjects Migration Script
 * 
 * Imports:
 * - 6 Subjects (BOE, FEWDA, CT, EFP, LAC, PSUPA)
 * - 3 Mentors with 2 subjects each
 * 
 * Usage:
 *   node import_mentors.js
 */

require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcryptjs');

// Mentor Data
const mentorsData = [
    {
        id: '7',
        name: 'Santusha Iyer',
        role: 'Senior Mentor',
        email: 'santushta.iyer@kalvium.com',
        password: 'kalvium@123',
        description: 'Guides learners through strong front-end foundations and practical engineering concepts with real-world clarity.',
        linkedin: 'https://www.linkedin.com/in/santushta-iyer-a-99862a25b/',
        subjects: ['BOE', 'FEWDA']
    },
    {
        id: '8',
        name: 'Karunakaran',
        role: 'Language & Thinking Mentor',
        email: 'karunakaran.h@kalvium.com',
        password: 'kalvium@123',
        description: 'Helps learners build communication confidence, structured thinking, and professional language skills.',
        linkedin: 'https://www.linkedin.com/in/h-karunakaran-3b1285376/',
        subjects: ['CT', 'EFP']
    },
    {
        id: '9',
        name: 'Arvind',
        role: 'Maths & Problem Solving Mentor',
        email: 'aravind.r@kalvium.com',
        password: 'kalvium@123',
        description: 'Specializes in mathematical foundations and problem-solving techniques for engineering clarity.',
        linkedin: 'https://www.linkedin.com/in/aravind-r-812634245/',
        subjects: ['LAC', 'PSUPA']
    }
];

// Subject Mapping
const subjectsMap = {
    'BOE': { id: 'BOE', name: 'BOE', description: 'Basics of Engineering' },
    'FEWDA': { id: 'FEWDA', name: 'FEWDA', description: 'Front-End Web Development Advance' },
    'CT': { id: 'CT', name: 'CT', description: 'Communication & Thinking' },
    'EFP': { id: 'EFP', name: 'EFP', description: 'English for Professionals' },
    'LAC': { id: 'LAC', name: 'LAC', description: 'Linear Algebra & Calculus' },
    'PSUPA': { id: 'PSUPA', name: 'PSUPA', description: 'Problem Solving & Algorithms' }
};

async function importMentorsAndSubjects() {
    console.log('\n👨‍🏫 Starting Mentors & Subjects Import...\n');
    
    try {
        // Step 1: Import Subjects
        console.log('📚 Importing Subjects...');
        let subjectsImported = 0;
        
        for (const [key, subject] of Object.entries(subjectsMap)) {
            try {
                await db.query(
                    `INSERT INTO subjects (id, name, description)
                     VALUES ($1, $2, $3)
                     ON CONFLICT (id) DO UPDATE SET
                     name = $2, description = $3`,
                    [subject.id, subject.name, subject.description]
                );
                subjectsImported++;
                console.log(`  ✓ ${subject.name} (${subject.id})`);
            } catch (err) {
                console.log(`  ✗ ${subject.name}: ${err.message}`);
            }
        }
        console.log(`\nSubjects: ${subjectsImported}/6 imported\n`);

        // Step 2: Import Mentors
        console.log('👨‍🏫 Importing Mentors...');
        let mentorsImported = 0;
        const mentorSubjectsToInsert = [];
        
        for (const mentor of mentorsData) {
            try {
                // Hash password
                const hashedPassword = await bcrypt.hash(mentor.password, 10);
                
                // Insert mentor into users table
                await db.query(
                    `INSERT INTO users (id, name, email, password, role, bio, linkedin, description, created_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                     ON CONFLICT (id) DO UPDATE SET
                     name = $2, email = $3, password = $4, bio = $6, linkedin = $7, description = $8`,
                    [
                        mentor.id,
                        mentor.name,
                        mentor.email,
                        hashedPassword,
                        'mentor',
                        mentor.role,
                        mentor.linkedin,
                        mentor.description
                    ]
                );
                
                mentorsImported++;
                console.log(`  ✓ ${mentor.name} (${mentor.role})`);
                
                // Collect subject assignments
                for (const subject of mentor.subjects) {
                    mentorSubjectsToInsert.push({ mentorId: mentor.id, subjectId: subject });
                }
            } catch (err) {
                console.log(`  ✗ ${mentor.name}: ${err.message}`);
            }
        }
        console.log(`\nMentors: ${mentorsImported}/3 imported\n`);

        // Step 3: Assign Subjects to Mentors (Many-to-Many)
        console.log('🔗 Assigning Subjects to Mentors...');
        let assignmentsCreated = 0;
        
        for (const assignment of mentorSubjectsToInsert) {
            try {
                await db.query(
                    `INSERT INTO mentor_subjects (mentor_id, subject_id)
                     VALUES ($1, $2)
                     ON CONFLICT (mentor_id, subject_id) DO NOTHING`,
                    [assignment.mentorId, assignment.subjectId]
                );
                assignmentsCreated++;
                
                const mentor = mentorsData.find(m => m.id === assignment.mentorId);
                console.log(`  ✓ ${mentor.name} → ${assignment.subjectId}`);
            } catch (err) {
                console.log(`  ✗ Assignment ${assignment.mentorId} → ${assignment.subjectId}: ${err.message}`);
            }
        }
        console.log(`\nAssignments: ${assignmentsCreated}/6 created\n`);

        // Summary
        console.log(`📊 Import Summary:`);
        console.log(`   ✓ Subjects: ${subjectsImported}/6`);
        console.log(`   ✓ Mentors: ${mentorsImported}/3`);
        console.log(`   ✓ Subject Assignments: ${assignmentsCreated}/6`);
        
        if (subjectsImported === 6 && mentorsImported === 3 && assignmentsCreated === 6) {
            console.log(`\n✅ All imports successful!\n`);
            process.exit(0);
        } else {
            console.log(`\n⚠️  Some imports incomplete\n`);
            process.exit(1);
        }
    } catch (err) {
        console.error('\n❌ Import failed:', err.message);
        process.exit(1);
    }
}

// Run import
importMentorsAndSubjects();
