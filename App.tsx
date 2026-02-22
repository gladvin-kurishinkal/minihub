
import React, { useState, useEffect } from 'react';
import { User, UserRole, Certificate, Backlog, FeeRecord, SemesterResult, Notification } from './types.ts';
import { Login } from './components/Login.tsx';
import { StudentDashboard } from './components/StudentDashboard.tsx';
import { TeacherDashboard } from './components/TeacherDashboard.tsx';
import { ThemeToggle } from './components/ThemeToggle.tsx';
import * as ds from './services/dataService.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [backlogs, setBacklogs] = useState<Record<string, Backlog[]>>({});
  const [fees, setFees] = useState<Record<string, FeeRecord[]>>({});
  const [results, setResults] = useState<Record<string, SemesterResult[]>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('theme') !== 'light';
      }
    } catch (e) { }
    return true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      }
    } catch (e) { }
  }, [isDark]);

  // Load all data from MongoDB when user logs in
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      ds.getCertificates(),
      ds.getAllBacklogs(),
      ds.getAllFees(),
      ds.getAllResults(),
      ds.getAllNotifications(),
    ])
      .then(([certs, bLogs, feeList, resultList, notifList]) => {
        setCertificates(certs);

        // Group backlogs by studentId
        const backlogMap: Record<string, Backlog[]> = {};
        (bLogs as (Backlog & { studentId: string })[]).forEach((b) => {
          if (!backlogMap[b.studentId]) backlogMap[b.studentId] = [];
          backlogMap[b.studentId].push({ id: b.id, subjectCode: b.subjectCode, subjectName: b.subjectName, semester: b.semester, status: b.status });
        });
        setBacklogs(backlogMap);

        // Group fees by studentId
        const feeMap: Record<string, FeeRecord[]> = {};
        (feeList as (FeeRecord & { studentId: string })[]).forEach((f) => {
          if (!feeMap[f.studentId]) feeMap[f.studentId] = [];
          feeMap[f.studentId].push({ id: f.id, description: f.description, amount: f.amount, dueDate: f.dueDate, status: f.status });
        });
        setFees(feeMap);

        // Group results by studentId
        const resultMap: Record<string, SemesterResult[]> = {};
        (resultList as (SemesterResult & { studentId: string })[]).forEach((r) => {
          if (!resultMap[r.studentId]) resultMap[r.studentId] = [];
          resultMap[r.studentId].push({ semester: r.semester, sgpa: r.sgpa, subjects: r.subjects });
        });
        setResults(resultMap);

        setNotifications(notifList);
      })
      .catch((err) => console.error('Failed to load data:', err))
      .finally(() => setLoading(false));
  }, [user]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const updateBacklog = async (studentId: string, backlogId: string, status: Backlog['status']) => {
    await ds.updateBacklogStatus(backlogId, status);
    setBacklogs(prev => ({
      ...prev,
      [studentId]: (prev[studentId] || []).map(b => b.id === backlogId ? { ...b, status } : b)
    }));
  };

  const removeBacklog = async (studentId: string, backlogId: string) => {
    await ds.deleteBacklog(backlogId);
    setBacklogs(prev => ({
      ...prev,
      [studentId]: (prev[studentId] || []).filter(b => b.id !== backlogId)
    }));
  };

  const addBacklog = async (studentId: string, nb: Omit<Backlog, 'id'>) => {
    const newBacklog = { ...nb, id: Math.random().toString(36).substr(2, 5), studentId };
    await ds.addBacklog(newBacklog);
    setBacklogs(prev => ({ ...prev, [studentId]: [...(prev[studentId] || []), newBacklog] }));
  };

  const updateFeeStatus = async (studentId: string, feeId: string, status: 'PAID' | 'UNPAID') => {
    await ds.updateFeeStatus(feeId, status);
    setFees(prev => ({
      ...prev,
      [studentId]: (prev[studentId] || []).map(f => f.id === feeId ? { ...f, status } : f)
    }));
  };

  const addFee = async (studentId: string, fee: Omit<FeeRecord, 'id'>) => {
    const newFee: FeeRecord & { studentId: string } = { ...fee, id: Math.random().toString(36).substr(2, 9), studentId };
    await ds.addFeeRecord(newFee);
    setFees(prev => ({
      ...prev,
      [studentId]: [newFee, ...(prev[studentId] || [])]
    }));
  };

  const removeFee = async (studentId: string, feeId: string) => {
    await ds.deleteFeeRecord(feeId);
    setFees(prev => ({
      ...prev,
      [studentId]: (prev[studentId] || []).filter(f => f.id !== feeId)
    }));
  };

  const notifyStudent = async (studentId: string, message: string, type: 'FEE' | 'ACADEMIC' | 'GENERAL' = 'GENERAL') => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      studentId,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };
    await ds.addNotification(newNotif);
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotifRead = async (notifId: string) => {
    await ds.markNotificationRead(notifId);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
  };

  const updateResult = async (studentId: string, semester: number, sgpa: number) => {
    await ds.updateSemesterResult(studentId, semester, sgpa);
    setResults(prev => ({
      ...prev,
      [studentId]: (prev[studentId] || []).map(r => r.semester === semester ? { ...r, sgpa } : r)
    }));
  };

  const handleAddCertificate = async (cert: Certificate) => {
    await ds.addCertificate(cert);
    setCertificates(prev => [cert, ...prev]);
  };

  const handleUpdateCertStatus = async (id: string, status: Certificate['status']) => {
    await ds.updateCertificateStatus(id, status);
    setCertificates(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (!user) return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen">
      <div className="fixed top-8 right-8 z-50"><ThemeToggle isDark={isDark} toggle={() => setIsDark(!isDark)} /></div>
      <Login onLogin={setUser} />
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold text-sm">Connecting to database…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 animate-fade-in">
      <nav className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 h-20 flex items-center px-8">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h1 className="text-xl font-black tracking-tighter">KTU <span className="text-indigo-600">HUB</span></h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle isDark={isDark} toggle={() => setIsDark(!isDark)} />
            <button
              onClick={() => setUser(null)}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-rose-500 transition-all"
              title="Logout"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <header className="mb-10 animate-slide-up">
          <h2 className="text-3xl font-black tracking-tighter">Hello, {user.name}</h2>
          <p className="text-slate-500 text-sm font-bold">{user.department} Department Hub • {user.role}</p>
        </header>

        {user.role === UserRole.STUDENT ? (
          <StudentDashboard
            user={user}
            certificates={certificates}
            backlogs={backlogs[user.id] || []}
            fees={fees[user.id] || []}
            results={results[user.id] || []}
            notifications={notifications.filter(n => n.studentId === user.id)}
            onAddCertificate={handleAddCertificate}
            onRegisterForExam={(bid) => updateBacklog(user.id, bid, 'REGISTERED')}
            onPayFee={(fid) => updateFeeStatus(user.id, fid, 'PAID')}
            onMarkAsRead={markNotifRead}
          />
        ) : (
          <TeacherDashboard
            user={user}
            certificates={certificates}
            allBacklogs={backlogs}
            allFees={fees}
            allResults={results}
            onUpdateStatus={handleUpdateCertStatus}
            onUpdateBacklog={updateBacklog}
            onRemoveBacklog={removeBacklog}
            onAddBacklog={addBacklog}
            onUpdateFeeStatus={updateFeeStatus}
            onUpdateResult={updateResult}
            onAddFee={addFee}
            onRemoveFee={removeFee}
            onNotifyStudent={notifyStudent}
          />
        )}
      </main>
    </div>
  );
};

export default App;
