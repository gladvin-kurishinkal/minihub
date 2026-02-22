/**
 * Seed script — populates MongoDB with initial data from constants.ts (converted to JS).
 * Runs only if collections are empty, so it's safe to call on every startup.
 */

const User = require('./models/User');
const Certificate = require('./models/Certificate');
const Backlog = require('./models/Backlog');
const FeeRecord = require('./models/FeeRecord');
const Result = require('./models/Result');

const SEED_USERS = [
    {
        id: 'ADR23CD015',
        name: 'Anuj Sharma',
        role: 'STUDENT',
        ktuid: 'ADR23CD015',
        department: 'CSE',
        email: 'anuj@college.edu',
        password: 'student123',
    },
    {
        id: 'TEACHER001',
        name: 'Dr. Priya Nair',
        role: 'TEACHER',
        ktuid: 'TEACHER001',
        department: 'CSE',
        email: 'priya@college.edu',
        password: 'teacher123',
    },
];

const SEED_CERTIFICATES = [
    { id: 'c1', studentId: 'ADR23CD015', studentName: 'Anuj Sharma', studentDepartment: 'CSE', title: 'CodeChef Competition Winner', category: 'Technical Fests', date: '2023-11-20', pointsClaimed: 8, status: 'APPROVED' },
    { id: 'c2', studentId: 'ADR23CD015', studentName: 'Anuj Sharma', studentDepartment: 'CSE', title: 'NSS 7 Day Camp', category: 'IV/NSS/NCC', date: '2023-12-15', pointsClaimed: 20, status: 'PENDING' },
    { id: 'c4', studentId: 'ADR23CD015', studentName: 'Anuj Sharma', studentDepartment: 'CSE', title: 'IEEE Paper Presentation', category: 'Technical Fests', date: '2024-02-05', pointsClaimed: 10, status: 'APPROVED' },
    { id: 'c5', studentId: 'ADR23CD015', studentName: 'Anuj Sharma', studentDepartment: 'CSE', title: 'College Union Secretary', category: 'Leadership', date: '2023-09-01', pointsClaimed: 24, status: 'APPROVED' },
];

const SEED_BACKLOGS = [
    { id: 'b1', studentId: 'ADR23CD015', subjectCode: 'MA101', subjectName: 'Linear Algebra', semester: 1, status: 'PENDING' },
    { id: 'b3', studentId: 'ADR23CD015', subjectCode: 'CS202', subjectName: 'Comp Org', semester: 4, status: 'PENDING' },
];

const SEED_FEES = [
    { id: '1', studentId: 'ADR23CD015', description: 'Semester 5 Tuition Fee', amount: 35000, dueDate: '2024-05-15', status: 'PAID' },
    { id: '2', studentId: 'ADR23CD015', description: 'Lab Fee S5', amount: 2500, dueDate: '2024-05-15', status: 'PAID' },
    { id: '3', studentId: 'ADR23CD015', description: 'Bus Fee Q3', amount: 5000, dueDate: '2024-06-01', status: 'UNPAID' },
    { id: '4', studentId: 'ADR23CD015', description: 'Examination Fee S5', amount: 1800, dueDate: '2024-06-20', status: 'UNPAID' },
    { id: '5', studentId: 'ADR23CD015', description: 'Library Fine', amount: 50, dueDate: '2024-04-10', status: 'PAID' },
];

const SEED_RESULTS = [
    {
        studentId: 'ADR23CD015', semester: 1, sgpa: 8.42,
        subjects: [
            { code: 'MA101', name: 'Linear Algebra', grade: 'A', credits: 4, gradePoint: 9 },
            { code: 'PH100', name: 'Engineering Physics', grade: 'B+', credits: 4, gradePoint: 8 },
            { code: 'BE100', name: 'Engg. Mechanics', grade: 'A+', credits: 3, gradePoint: 10 },
            { code: 'BE101-05', name: 'Basics of CSE', grade: 'A', credits: 3, gradePoint: 9 },
            { code: 'BE103', name: 'Sustainable Engineering', grade: 'A', credits: 3, gradePoint: 9 },
        ]
    },
    {
        studentId: 'ADR23CD015', semester: 2, sgpa: 7.95,
        subjects: [
            { code: 'MA102', name: 'Diff. Equations', grade: 'B', credits: 4, gradePoint: 7 },
            { code: 'CY100', name: 'Engineering Chemistry', grade: 'A', credits: 4, gradePoint: 9 },
            { code: 'EE100', name: 'Basics of EE', grade: 'B+', credits: 3, gradePoint: 8 },
            { code: 'EC100', name: 'Basics of Electronics', grade: 'A', credits: 3, gradePoint: 9 },
            { code: 'CE100', name: 'Basics of Civil', grade: 'B+', credits: 3, gradePoint: 8 },
        ]
    },
    {
        studentId: 'ADR23CD015', semester: 3, sgpa: 8.85,
        subjects: [
            { code: 'MAT203', name: 'Discrete Math', grade: 'S', credits: 4, gradePoint: 10 },
            { code: 'CST201', name: 'Data Structures', grade: 'A+', credits: 4, gradePoint: 10 },
            { code: 'CST203', name: 'Logic System Design', grade: 'A', credits: 4, gradePoint: 9 },
            { code: 'CST205', name: 'Object Oriented Prog', grade: 'B+', credits: 3, gradePoint: 8 },
            { code: 'HUT200', name: 'Professional Ethics', grade: 'A', credits: 2, gradePoint: 9 },
        ]
    },
    {
        studentId: 'ADR23CD015', semester: 4, sgpa: 7.60,
        subjects: [
            { code: 'MAT206', name: 'Graph Theory', grade: 'C', credits: 4, gradePoint: 6 },
            { code: 'CST202', name: 'Computer Org', grade: 'B', credits: 4, gradePoint: 7 },
            { code: 'CST204', name: 'Database Management', grade: 'A', credits: 4, gradePoint: 9 },
            { code: 'CST206', name: 'Operating Systems', grade: 'B+', credits: 4, gradePoint: 8 },
            { code: 'MCN202', name: 'Constitution of India', grade: 'P', credits: 0, gradePoint: 0 },
        ]
    },
];

async function runSeed() {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
        console.log('ℹ️  DB already seeded, skipping.');
        return;
    }

    console.log('🌱 Seeding database with initial data...');
    await User.insertMany(SEED_USERS);
    await Certificate.insertMany(SEED_CERTIFICATES);
    await Backlog.insertMany(SEED_BACKLOGS);
    await FeeRecord.insertMany(SEED_FEES);
    await Result.insertMany(SEED_RESULTS);
    console.log('✅ Seeding complete!');
}

module.exports = { runSeed };
