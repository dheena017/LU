# 📊 Student Data Import Guide

This document explains how to bulk import students into your Kalvium LU Tracker database.

---

## 📋 What's Included

- **23 Students** from Batch S139
- All student profiles with:
  - Name, email, LinkedIn, GitHub
  - Bio, tagline, course info
  - Photos, batch designation
  - Pre-hashed passwords (kalvium@123)

---

## 🚀 Quick Start

### Step 1: Setup Database Connection
Ensure your `.env` file in the `backend/` folder has:
```
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
```

### Step 2: Run the Import Script
```bash
cd backend
npm run import
```

That's it! All 23 students will be imported.

---

## 📝 What Gets Imported

For each student, the script imports:

| Field | Value |
|-------|-------|
| **ID** | Auto-assigned (1-23) |
| **Name** | Student name from CSV |
| **Email** | Kalvium community email |
| **Password** | `kalvium@123` (bcrypt hashed) |
| **Role** | `student` (auto-set) |
| **Batch** | `S139` |
| **Bio** | Student bio from CSV |
| **Created At** | Original timestamp |

---

## ✅ Verification

### Check if import worked:

**In PostgreSQL/Supabase:**
```sql
SELECT count(*) FROM users WHERE role = 'student';
```
Should show: **23**

**Query all imported students:**
```sql
SELECT id, name, email, batch FROM users WHERE role = 'student' ORDER BY id;
```

**Check specific student:**
```sql
SELECT * FROM users WHERE email = 'hariz.s.139@kalvium.community';
```

---

## 🔐 Security Notes

- All passwords are **bcrypt hashed** (not plain text)
- Default password: `kalvium@123`
- Students can change passwords after login
- Never re-run import with plain passwords

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'dotenv'"
```bash
npm install
```

### Error: "Connection refused"
- Check DATABASE_URL is correct in `.env`
- Verify Supabase database is running
- Test connection: `npx psql $DATABASE_URL -c "SELECT 1;"`

### Error: "Duplicate key value violates unique constraint"
- Students already imported
- Either skip or delete them first:
  ```sql
  DELETE FROM users WHERE role = 'student' AND batch = 'S139';
  ```
  Then re-run: `npm run import`

### Import ran but shows "0 successful"
- Check `.env` variables
- Verify database schema exists (run `npm run setup`)
- Check database logs for errors

---

## 🔄 Re-importing (Update Data)

To update existing students:
1. Delete old data:
   ```sql
   DELETE FROM users WHERE role = 'student' AND batch = 'S139';
   ```
2. Re-run import:
   ```bash
   npm run import
   ```

---

## 📦 What's in the Files

### `import_students.js`
- CSV parsing logic
- Student data embedded
- Bcrypt password hashing
- Error handling & reporting

### Added to `package.json`
```json
"import": "node import_students.js"
```

Now you can run: `npm run import`

---

## 📞 Next Steps

- Run the import: `cd backend && npm run import`
- Verify in database: Check user count
- Login with student account in app
- Assign Learning Units to students
- Monitor progress on teacher dashboard

---

## 📊 Student List

Import includes these students:
1. hariz
2. sham
3. amarnath
4. kamala kiruthi
5. arulananthan
6. lohith
7. hari
8. jayseelan
9. durga saranya
10. gokul
11. joy arnold
12. kathiravan
13. mosses
14. priyadharsan
15. abinay
16. suriya
17. yakesh
18. nanthakumar
19. srinithi
20. srimathi
21. srinidthi
22. mohan
23. nabi rasool

**All with batch:** S139  
**All with password:** kalvium@123

---

*Data import ready! Run `npm run import` to get started.* 🚀
