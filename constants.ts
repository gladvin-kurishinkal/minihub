
import { KTUActivityCategory, Backlog, FeeRecord, Certificate, SemesterResult } from './types.ts';

export const KTU_ACTIVITY_RULES = {
  [KTUActivityCategory.LEADERSHIP]: { maxPoints: 24, description: "College/University Union positions" },
  [KTUActivityCategory.TECH_QUIZ]: { maxPoints: 10, description: "Participation in Tech Events" },
  [KTUActivityCategory.SPORTS]: { maxPoints: 20, description: "Zonal/State level sports" },
  [KTUActivityCategory.CREATIVE_ARTS]: { maxPoints: 15, description: "Cultural festival winners" },
  [KTUActivityCategory.TECHNICAL_FESTS]: { maxPoints: 10, description: "Presentation/Events" },
  [KTUActivityCategory.IV_NSS_NCC]: { maxPoints: 20, description: "NSS/NCC camp participation" },
  [KTUActivityCategory.MOOC]: { maxPoints: 20, description: "Certification from SWAYAM/NPTEL" },
};

export const INITIAL_FEES: FeeRecord[] = [
  { id: '1', description: 'Semester 5 Tuition Fee', amount: 35000, dueDate: '2024-05-15', status: 'PAID' },
  { id: '2', description: 'Lab Fee S5', amount: 2500, dueDate: '2024-05-15', status: 'PAID' },
  { id: '3', description: 'Bus Fee Q3', amount: 5000, dueDate: '2024-06-01', status: 'UNPAID' },
  { id: '4', description: 'Examination Fee S5', amount: 1800, dueDate: '2024-06-20', status: 'UNPAID' },
  { id: '5', description: 'Library Fine', amount: 50, dueDate: '2024-04-10', status: 'PAID' },
];

export const INITIAL_CERTIFICATES: Certificate[] = [
  { id: 'c1', studentId: 'ADR23CD015', studentName: 'Anuj', studentDepartment: 'CSE', title: 'CodeChef Competition Winner', category: KTUActivityCategory.TECHNICAL_FESTS, date: '2023-11-20', pointsClaimed: 8, status: 'APPROVED' },
  { id: 'c2', studentId: 'ADR23CD015', studentName: 'Anuj', studentDepartment: 'CSE', title: 'NSS 7 Day Camp', category: KTUActivityCategory.IV_NSS_NCC, date: '2023-12-15', pointsClaimed: 20, status: 'PENDING' },
  { id: 'c4', studentId: 'ADR23CD015', studentName: 'Anuj', studentDepartment: 'CSE', title: 'IEEE Paper Presentation', category: KTUActivityCategory.TECHNICAL_FESTS, date: '2024-02-05', pointsClaimed: 10, status: 'APPROVED' },
  { id: 'c5', studentId: 'ADR23CD015', studentName: 'Anuj', studentDepartment: 'CSE', title: 'College Union Secretary', category: KTUActivityCategory.LEADERSHIP, date: '2023-09-01', pointsClaimed: 24, status: 'APPROVED' },
];

export const INITIAL_RESULTS: Record<string, SemesterResult[]> = {
  'ADR23CD015': [
    {
      semester: 1,
      sgpa: 8.42,
      subjects: [
        { code: 'MA101', name: 'Linear Algebra', grade: 'A', credits: 4, gradePoint: 9 },
        { code: 'PH100', name: 'Engineering Physics', grade: 'B+', credits: 4, gradePoint: 8 },
        { code: 'BE100', name: 'Engg. Mechanics', grade: 'A+', credits: 3, gradePoint: 10 },
        { code: 'BE101-05', name: 'Basics of CSE', grade: 'A', credits: 3, gradePoint: 9 },
        { code: 'BE103', name: 'Sustainable Engineering', grade: 'A', credits: 3, gradePoint: 9 },
      ]
    },
    {
      semester: 2,
      sgpa: 7.95,
      subjects: [
        { code: 'MA102', name: 'Diff. Equations', grade: 'B', credits: 4, gradePoint: 7 },
        { code: 'CY100', name: 'Engineering Chemistry', grade: 'A', credits: 4, gradePoint: 9 },
        { code: 'EE100', name: 'Basics of EE', grade: 'B+', credits: 3, gradePoint: 8 },
        { code: 'EC100', name: 'Basics of Electronics', grade: 'A', credits: 3, gradePoint: 9 },
        { code: 'CE100', name: 'Basics of Civil', grade: 'B+', credits: 3, gradePoint: 8 },
      ]
    },
    {
      semester: 3,
      sgpa: 8.85,
      subjects: [
        { code: 'MAT203', name: 'Discrete Math', grade: 'S', credits: 4, gradePoint: 10 },
        { code: 'CST201', name: 'Data Structures', grade: 'A+', credits: 4, gradePoint: 10 },
        { code: 'CST203', name: 'Logic System Design', grade: 'A', credits: 4, gradePoint: 9 },
        { code: 'CST205', name: 'Object Oriented Prog', grade: 'B+', credits: 3, gradePoint: 8 },
        { code: 'HUT200', name: 'Professional Ethics', grade: 'A', credits: 2, gradePoint: 9 },
      ]
    },
    {
      semester: 4,
      sgpa: 7.60,
      subjects: [
        { code: 'MAT206', name: 'Graph Theory', grade: 'C', credits: 4, gradePoint: 6 },
        { code: 'CST202', name: 'Computer Org', grade: 'B', credits: 4, gradePoint: 7 },
        { code: 'CST204', name: 'Database Management', grade: 'A', credits: 4, gradePoint: 9 },
        { code: 'CST206', name: 'Operating Systems', grade: 'B+', credits: 4, gradePoint: 8 },
        { code: 'MCN202', name: 'Constitution of India', grade: 'P', credits: 0, gradePoint: 0 },
      ]
    }
  ]
};
