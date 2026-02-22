import { api } from './api.ts';
import {
    User,
    Certificate,
    Backlog,
    FeeRecord,
    SemesterResult,
    Notification,
} from '../types.ts';

// ── Users ──────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
    return api.get<User[]>('/api/users');
}

export async function loginUser(
    ktuid: string,
    password: string
): Promise<User> {
    return api.post<User>('/api/users/login', { ktuid, password });
}

export async function registerUser(
    userData: Omit<User, 'id'> & { password: string }
): Promise<User> {
    return api.post<User>('/api/users/register', userData);
}

// ── Certificates ───────────────────────────────────────────────────────────

export async function getCertificates(): Promise<Certificate[]> {
    return api.get<Certificate[]>('/api/certificates');
}

export async function addCertificate(cert: Certificate): Promise<Certificate> {
    return api.post<Certificate>('/api/certificates', cert);
}

export async function updateCertificateStatus(
    id: string,
    status: Certificate['status']
): Promise<Certificate> {
    return api.patch<Certificate>(`/api/certificates/${id}`, { status });
}

// ── Backlogs ───────────────────────────────────────────────────────────────

export async function getAllBacklogs(): Promise<Backlog[]> {
    return api.get<Backlog[]>('/api/backlogs');
}

export async function addBacklog(
    backlog: Backlog & { studentId: string }
): Promise<Backlog> {
    return api.post<Backlog>('/api/backlogs', backlog);
}

export async function updateBacklogStatus(
    id: string,
    status: Backlog['status']
): Promise<Backlog> {
    return api.patch<Backlog>(`/api/backlogs/${id}`, { status });
}

export async function deleteBacklog(id: string): Promise<void> {
    return api.delete<void>(`/api/backlogs/${id}`);
}

// ── Fees ───────────────────────────────────────────────────────────────────

export async function getAllFees(): Promise<(FeeRecord & { studentId: string })[]> {
    return api.get<(FeeRecord & { studentId: string })[]>('/api/fees');
}

export async function addFeeRecord(
    fee: FeeRecord & { studentId: string }
): Promise<FeeRecord> {
    return api.post<FeeRecord>('/api/fees', fee);
}

export async function updateFeeStatus(
    id: string,
    status: FeeRecord['status']
): Promise<FeeRecord> {
    return api.patch<FeeRecord>(`/api/fees/${id}`, { status });
}

export async function deleteFeeRecord(id: string): Promise<void> {
    return api.delete<void>(`/api/fees/${id}`);
}

// ── Results ────────────────────────────────────────────────────────────────

export async function getAllResults(): Promise<(SemesterResult & { studentId: string })[]> {
    return api.get<(SemesterResult & { studentId: string })[]>('/api/results');
}

export async function updateSemesterResult(
    studentId: string,
    semester: number,
    sgpa: number
): Promise<SemesterResult> {
    return api.patch<SemesterResult>(`/api/results/${studentId}/${semester}`, { sgpa });
}

// ── Notifications ──────────────────────────────────────────────────────────

export async function getAllNotifications(): Promise<Notification[]> {
    return api.get<Notification[]>('/api/notifications');
}

export async function addNotification(
    notif: Omit<Notification, 'id'> & { id: string }
): Promise<Notification> {
    return api.post<Notification>('/api/notifications', notif);
}

export async function markNotificationRead(id: string): Promise<Notification> {
    return api.patch<Notification>(`/api/notifications/${id}`, { isRead: true });
}
