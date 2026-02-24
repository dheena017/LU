#!/usr/bin/env node

/**
 * Bulk Import Students Migration Script
 * 
 * Usage:
 *   node import_students.js
 * 
 * This script reads student data and imports them into the database.
 */

require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcryptjs');

// CSV Data - paste your student data here or read from file
const csvData = `id,name,linkedin,github,term,created_at,email,photo,tagline,bio,password,resume_url,course_name,course_goals,projects,overall_reflection
1,hariz,,,S139,2026-02-22 17:55:56.430039+00,mohamed.hariz.s.139@kalvium.community,/assets/student1.jpg,hello,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
2,sham,,,S139,2026-02-22 17:55:56.430039+00,cheekaramelli.shyam.s.139@kalvium.community,/assets/student2.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
3,amarnath,https://www.linkedin.com/in/amarnath-p-s-942782322/,https://github.com/amarnath-cdr,S139,2026-02-22 17:55:56.430039+00,amarnath.p.s.139@kalvium.community,/assets/student3.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
4,kamala kiruthi,https://www.linkedin.com/in/kamala-kiruthi/,https://github.com/kamalakiruthi8,S139,2026-02-22 17:55:56.430039+00,kamala.kiruthi.s.139@kalvium.community,/assets/student5.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
5,arulananthan,,,S139,2026-02-22 17:55:56.430039+00,arulananthan.m.s.139@kalvium.community,/assets/student4.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
6,lohith,https://www.linkedin.com/in/chinthalapalli-lohith-126447384/,https://github.com/lohithchinthalalpalli,S139,2026-02-22 17:55:56.430039+00,lohith.chinthalapalli.s.139@kalvium.community,/assets/student6.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
7,hari,https://www.linkedin.com/in/hari-r-bb3181370/,https://github.com/harirs139-ui,S139,2026-02-22 17:55:56.430039+00,hari.r.s.139@kalvium.community,/assets/student7.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
8,jayseelan,https://www.linkedin.com/in/jayaseelan-d-1951952a6,https://www.linkedin.com/in/jayaseelan-d-1951952a6,S139,2026-02-22 17:55:56.430039+00,jayaseelan.d.s.139@kalvium.community,/assets/student8.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
9,durga saranya,https://www.linkedin.com/feed/,https://github.com/durgasaranyas139-lgtm,S139,2026-02-22 17:55:56.430039+00,durga.saranya.s.139@kalvium.community,/assets/student9.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
10,gokul,http://www.linkedin.com/in/gokul-raj95,https://www.linkedin.com/in/gokul-raj95,S139,2026-02-22 17:55:56.430039+00,gokul.raj.s.139@kalvium.community,/assets/student10.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
11,joy arnold,https://www.linkedin.com/in/joyarnold21?utm_source=share_via&utm_content=profile&utm_medium=member_android,,S139,2026-02-22 17:55:56.430039+00,joy.arnold.s.139@kalvium.community,/assets/student11.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
12,kathiravan,https://www.linkedin.com/in/kathiravan-e-56688a39b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app,https://github.com/ekathiravanelumalai71-a11y,S139,2026-02-22 17:55:56.430039+00,kathiravan.e.s.139@kalvium.community,/assets/student12.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
13,mosses,https://www.linkedin.com/in/moses-acknal-7957973a4/,https://github.com/mosesacknals139,S139,2026-02-22 17:55:56.430039+00,moses.acknal.s.139@kalvium.community,/assets/student13.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
14,priyadharsan,http://www.linkedin.com/in/priyadharsan-s2007,https://github.com/Priyadharsan2911,S139,2026-02-22 17:55:56.430039+00,priyadharsan.s.s.139@kalvium.community,/assets/student14.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
15,abinay,https://www.linkedin.com/feed/?trk=guest_homepage-basic_google-one-tap-submit,,S139,2026-02-22 17:55:56.430039+00,abhinay.m.s.139@kalvium.community,/assets/student15.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
16,suriya,,,S139,2026-02-22 17:55:56.430039+00,suriya.r.s.139@kalvium.community,/assets/student16.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
17,yakesh,https://www.linkedin.com/in/yakesh-r-92648a383?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app,https://github.com/yakpranu-design,S139,2026-02-22 17:55:56.430039+00,yakesh.r.s.139@kalvium.community,/assets/student17.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
18,nanthakumar,http://www.linkedin.com/in/nandhakumar-pm-8276b7381,https://github.com/nandhakumar1980,S139,2026-02-22 17:55:56.430039+00,nandhakumar.p.s.139@kalvium.community,/assets/student18.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
19,srinithi,https://www.linkedin.com/in/srinithi-vijayakumar-981785344/,https://github.com/srinithivijayakumars139-wq,S139,2026-02-22 17:55:56.430039+00,srinithi.vijayakumar.s.139@kalvium.community,/assets/student19.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
20,srimathi,https://www.linkedin.com/in/srimathi-vijayakumar-10518a383/,https://github.com/srimajaya123-blip,S139,2026-02-22 17:55:56.430039+00,srimathi.vijayakumar.s.139@kalvium.community,/assets/student20.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
21,srinidthi,https://www.linkedin.com/in/srinidhi-v-123193384/,https://github.com/srinidhivs139-ai,S139,2026-02-22 17:55:56.430039+00,srinidhi.v.s.139@kalvium.community,/assets/student21.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
22,mohan,http://www.linkedin.com/in/mohan-e-b7945b2b2,https://github.com/mohanes139-cell,S139,2026-02-22 17:55:56.430039+00,mohan.e.s.139@kalvium.community,/assets/student22.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"
23,nabi rasool,http://www.linkedin.com/in/nabi-rasool-129494393,,S139,2026-02-22 17:55:56.430039+00,nabi.rasool.s.139@kalvium.community,/assets/student23.jpg,Full Stack Developer | Building the Future,Passionate software developer focused on creating impactful solutions through clean code and innovative thinking.,kalvium@123,,Full Stack Engineering,,[],"{""future"": """", ""growth"": """", ""takeaways"": []}"`;

// Parse CSV with proper handling
function parseCSV(data) {
    const lines = data.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
        // Handle quoted fields
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        
        const row = {};
        headers.forEach((header, i) => {
            row[header] = values[i] || '';
        });
        return row;
    });
}

async function importStudents() {
    console.log('\n📚 Starting Student Import Migration...\n');
    
    try {
        const students = parseCSV(csvData);
        console.log(`✓ Parsed ${students.length} students\n`);
        
        let successful = 0;
        let failed = 0;
        const failed_students = [];
        
        for (const student of students) {
            try {
                // Hash password
                const hashedPassword = await bcrypt.hash(student.password || 'kalvium@123', 10);
                
                // Insert into database
                await db.query(
                    `INSERT INTO users (id, name, email, password, role, batch, bio, created_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     ON CONFLICT (id) DO UPDATE SET
                     name = $2, email = $3, password = $4, batch = $6, bio = $7`,
                    [
                        student.id,
                        student.name,
                        student.email,
                        hashedPassword,
                        'student',
                        student.term,
                        student.bio,
                        student.created_at
                    ]
                );
                
                successful++;
                console.log(`  ✓ ${student.name} (${student.email})`);
            } catch (err) {
                failed++;
                failed_students.push(student.name);
                console.log(`  ✗ ${student.name}: ${err.message}`);
            }
        }
        
        console.log(`\n📊 Import Summary:`);
        console.log(`   ✓ Successful: ${successful}`);
        console.log(`   ✗ Failed: ${failed}`);
        
        if (failed > 0) {
            console.log(`\n⚠️  Failed imports: ${failed_students.join(', ')}`);
        }
        
        console.log(`\n✅ Migration complete!\n`);
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Migration failed:', err.message);
        process.exit(1);
    }
}

// Run migration
importStudents();
