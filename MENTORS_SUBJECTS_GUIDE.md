# 👨‍🏫 Mentors & Subjects System

Your Kalvium LU Tracker now includes a **mentorship structure** with **3 mentors** teaching **6 subjects**, where **each mentor teaches 2 subjects**.

---

## 📚 System Overview

```
Database Structure:
┌─────────────┐
│   Users     │ (includes mentors with role='mentor')
└──────┬──────┘
       │
       ├─→ Santusha Iyer (Senior Mentor)
       ├─→ Karunakaran (Language & Thinking Mentor)
       └─→ Arvind (Maths & Problem Solving Mentor)
       
       │
       ↓ (via mentor_subjects junction table)
       
┌──────────────────────────┐
│     Subjects (6)         │
├──────────────────────────┤
│ BOE     (Basics of...)   │
│ FEWDA   (Front-End...)   │
│ CT      (Communication...) 
│ EFP     (English for...) │
│ LAC     (Linear Algebra...) │
│ PSUPA   (Problem Solving...) │
└──────────────────────────┘
```

---

## 👥 Mentors

### 1️⃣ **Santusha Iyer** (Senior Mentor)
- **ID**: 7
- **Email**: santushta.iyer@kalvium.com
- **LinkedIn**: https://www.linkedin.com/in/santushta-iyer-a-99862a25b/
- **Password**: kalvium@123 (bcrypt hashed)
- **Description**: Guides learners through strong front-end foundations and practical engineering concepts with real-world clarity.
- **Teaches**:
  - 📌 **BOE** (Basics of Engineering)
  - 📌 **FEWDA** (Front-End Web Development Advance)

### 2️⃣ **Karunakaran** (Language & Thinking Mentor)
- **ID**: 8
- **Email**: karunakaran.h@kalvium.com
- **LinkedIn**: https://www.linkedin.com/in/h-karunakaran-3b1285376/
- **Password**: kalvium@123 (bcrypt hashed)
- **Description**: Helps learners build communication confidence, structured thinking, and professional language skills.
- **Teaches**:
  - 💬 **CT** (Communication & Thinking)
  - 💬 **EFP** (English for Professionals)

### 3️⃣ **Arvind** (Maths & Problem Solving Mentor)
- **ID**: 9
- **Email**: aravind.r@kalvium.com
- **LinkedIn**: https://www.linkedin.com/in/aravind-r-812634245/
- **Password**: kalvium@123 (bcrypt hashed)
- **Description**: Specializes in mathematical foundations and problem-solving techniques for engineering clarity.
- **Teaches**:
  - 🔢 **LAC** (Linear Algebra & Calculus)
  - 🔢 **PSUPA** (Problem Solving & Algorithms)

---

## 📖 Subjects (6 Total)

| Code | Name | Mentor(s) |
|------|------|-----------|
| **BOE** | Basics of Engineering | Santusha Iyer |
| **FEWDA** | Front-End Web Development Advance | Santusha Iyer |
| **CT** | Communication & Thinking | Karunakaran |
| **EFP** | English for Professionals | Karunakaran |
| **LAC** | Linear Algebra & Calculus | Arvind |
| **PSUPA** | Problem Solving & Algorithms | Arvind |

---

## 🗄️ Database Tables

### `subjects`
```sql
CREATE TABLE subjects (
    id TEXT PRIMARY KEY,           -- e.g., 'BOE'
    name TEXT NOT NULL,            -- e.g., 'Basics of Engineering'
    description TEXT,              -- Subject description
    created_at TIMESTAMP
);
```

### `users` (updated)
```sql
-- Added columns for mentors:
ALTER TABLE users ADD COLUMN linkedin TEXT;
ALTER TABLE users ADD COLUMN description TEXT;

-- Updated role constraint:
CHECK (role IN ('teacher', 'student', 'mentor'))
```

### `mentor_subjects` (Many-to-Many)
```sql
CREATE TABLE mentor_subjects (
    mentor_id TEXT,          -- References users(id)
    subject_id TEXT,         -- References subjects(id)
    assigned_at TIMESTAMP,
    PRIMARY KEY (mentor_id, subject_id)
);
```

**Purpose**: Links mentors to subjects (allows 1 mentor → many subjects)

---

## 🚀 Usage

### Login as a Mentor
```
Email: santushta.iyer@kalvium.com
Password: kalvium@123
```

### Check Mentors & Subjects in Database

**All mentors:**
```sql
SELECT id, name, role, email FROM users WHERE role = 'mentor';
```

**All subjects:**
```sql
SELECT id, name, description FROM subjects;
```

**Mentor → Subject assignments:**
```sql
SELECT u.name as mentor, s.name as subject 
FROM mentor_subjects ms
JOIN users u ON ms.mentor_id = u.id
JOIN subjects s ON ms.subject_id = s.id
ORDER BY u.name, s.name;
```

**Output:**
```
mentor             | subject
-------------------+-------------------------------------------
Santusha Iyer      | Basics of Engineering
Santusha Iyer      | Front-End Web Development Advance
Karunakaran        | Communication & Thinking
Karunakaran        | English for Professionals
Arvind             | Linear Algebra & Calculus
Arvind             | Problem Solving & Algorithms
```

---

## 📝 Files Added/Modified

| File | Purpose |
|------|---------|
| `backend/import_mentors.js` | Import script for 3 mentors & 6 subjects |
| `backend/migrate.js` | Database migration to add new columns |
| `backend/schema.sql` | Updated schema with subjects & mentor_subjects tables |
| `backend/package.json` | Added `npm run migrate` and `npm run import-mentors` |

---

## 🔄 Imported Data

### ✅ Subjects: 6/6
- BOE
- FEWDA
- CT
- EFP
- LAC
- PSUPA

### ✅ Mentors: 3/3
- Santusha Iyer (ID: 7)
- Karunakaran (ID: 8)
- Arvind (ID: 9)

### ✅ Subject Assignments: 6/6
- Santusha Iyer → BOE, FEWDA
- Karunakaran → CT, EFP
- Arvind → LAC, PSUPA

---

## 🎯 Current Status

| Component | Status | Count |
|-----------|--------|-------|
| Students | ✅ Imported | 23 (Batch S139) |
| Mentors | ✅ Imported | 3 |
| Subjects | ✅ Imported | 6 |
| Mentor-Subject Links | ✅ Created | 6 |
| Teacher | ✅ Ready | 1 (teacher@kalvium.com) |

---

## 🔗 Next Steps

### Extend the System

**Option 1: Add more mentors**
```bash
# Edit backend/import_mentors.js
# Add mentor to mentorsData array
# Run: npm run import-mentors
```

**Option 2: Assign subjects to students**
```sql
-- Add student_subjects table
CREATE TABLE student_subjects (
    student_id TEXT REFERENCES users(id),
    subject_id TEXT REFERENCES subjects(id),
    enrolled_at TIMESTAMP,
    PRIMARY KEY (student_id, subject_id)
);
```

**Option 3: Create Learning Units per subject**
```sql
-- Link learning_units to subjects
ALTER TABLE learning_units ADD COLUMN subject_id TEXT 
    REFERENCES subjects(id);
```

---

## 📞 Commands

```bash
# Run database migration
npm run migrate

# Import mentors & subjects
npm run import-mentors

# Import students (from earlier)
npm run import

# Start backend server
npm start
```

---

## 🎓 System Complete!

Your Kalvium LU Tracker now has:
- ✅ **23 Students** (All in Batch S139)
- ✅ **3 Mentors** (Teaching their subjects)
- ✅ **6 Subjects** (Mathematical, Technical, Language, Engineering)
- ✅ **Proper Database Structure** (Many-to-many relationships)

---

*Mentors & subjects infrastructure ready for production! 🚀*
