
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  ktuid: string;
  department: string;
  email: string;
}

export interface Notification {
  id: string;
  studentId: string;
  message: string;
  type: 'FEE' | 'ACADEMIC' | 'GENERAL';
  timestamp: string;
  isRead: boolean;
}

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  studentDepartment: string;
  title: string;
  category: KTUActivityCategory;
  date: string;
  pointsClaimed: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  fileUrl?: string; // Base64 or mock URL
}

export enum KTUActivityCategory {
  LEADERSHIP = 'Leadership',
  TECH_QUIZ = 'Tech Quiz',
  SPORTS = 'Sports/Games',
  CREATIVE_ARTS = 'Creative Arts',
  TECHNICAL_FESTS = 'Technical Fests',
  IV_NSS_NCC = 'IV/NSS/NCC',
  MOOC = 'MOOC Courses'
}

export interface Backlog {
  id: string;
  subjectCode: string;
  subjectName: string;
  semester: number;
  status: 'PENDING' | 'REGISTERED' | 'CLEARED';
}

export interface FeeRecord {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'UNPAID';
}

export interface SubjectResult {
  code: string;
  name: string;
  grade: string;
  credits: number;
  gradePoint: number;
}

export interface SemesterResult {
  semester: number;
  sgpa: number;
  subjects: SubjectResult[];
}
