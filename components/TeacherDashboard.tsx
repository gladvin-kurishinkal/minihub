
import React, { useState, useEffect, useMemo } from 'react';
import { User, Certificate, Backlog, UserRole, FeeRecord, SemesterResult } from '../types.ts';
import { SmoothInput } from './SmoothInput.tsx';
import { getUsers } from '../services/dataService.ts';

interface TeacherDashboardProps {
  user: User;
  certificates: Certificate[];
  allBacklogs: Record<string, Backlog[]>;
  allFees: Record<string, FeeRecord[]>;
  allResults: Record<string, SemesterResult[]>;
  onUpdateStatus: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  onUpdateBacklog: (studentId: string, backlogId: string, status: 'PENDING' | 'REGISTERED' | 'CLEARED') => void;
  onRemoveBacklog: (studentId: string, backlogId: string) => void;
  onAddBacklog: (studentId: string, backlog: Omit<Backlog, 'id'>) => void;
  onUpdateFeeStatus: (studentId: string, feeId: string, status: 'PAID' | 'UNPAID') => void;
  onUpdateResult: (studentId: string, semester: number, sgpa: number) => void;
  onAddFee: (studentId: string, fee: Omit<FeeRecord, 'id'>) => void;
  onRemoveFee: (studentId: string, feeId: string) => void;
  onNotifyStudent: (studentId: string, message: string, type: 'FEE' | 'ACADEMIC' | 'GENERAL') => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  user,
  certificates,
  allBacklogs,
  allFees,
  allResults,
  onUpdateStatus,
  onUpdateBacklog,
  onRemoveBacklog,
  onAddBacklog,
  onUpdateFeeStatus,
  onUpdateResult,
  onAddFee,
  onRemoveFee,
  onNotifyStudent
}) => {
  const [activeTab, setActiveTab] = useState<'certs' | 'backlogs' | 'fees'>('certs');
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [isAddingBacklog, setIsAddingBacklog] = useState<string | null>(null);
  const [isAddingFee, setIsAddingFee] = useState<string | null>(null);
  const [newB, setNewB] = useState({ subjectCode: '', subjectName: '', semester: 1 });
  const [newF, setNewF] = useState({ description: '', amount: '' });
  const [viewingFile, setViewingFile] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [certSearch, setCertSearch] = useState('');
  const [managingStudentId, setManagingStudentId] = useState<string | null>(null);
  const [notifyingIds, setNotifyingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getUsers()
      .then(users => setAllStudents(users.filter(u => u.role === UserRole.STUDENT && u.department === user.department)))
      .catch(err => console.error('Failed to load students:', err));
  }, [user.department]);

  const departmentalCerts = useMemo(() => {
    return certificates.filter(c => c.studentDepartment === user.department);
  }, [certificates, user.department]);

  const pendingCerts = useMemo(() => {
    return departmentalCerts.filter(c => c.status === 'PENDING');
  }, [departmentalCerts]);

  const filteredCerts = useMemo(() => {
    if (!certSearch) return pendingCerts;
    const query = certSearch.toLowerCase();
    return pendingCerts.filter(c =>
      c.studentName.toLowerCase().includes(query) ||
      c.title.toLowerCase().includes(query) ||
      c.studentId.toLowerCase().includes(query)
    );
  }, [pendingCerts, certSearch]);

  const filteredStudents = useMemo(() => {
    return allStudents.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.ktuid.toLowerCase().includes(studentSearch.toLowerCase());
      return matchesSearch;
    });
  }, [allStudents, studentSearch]);

  const studentsWithPendingFees = useMemo(() => {
    return allStudents.filter(student => {
      const studentFees = allFees[student.id] || [];
      return studentFees.some(f => f.status === 'UNPAID');
    });
  }, [allStudents, allFees]);

  const handleApproveAll = () => {
    if (confirm(`Are you sure you want to approve all ${filteredCerts.length} visible pending certificates?`)) {
      filteredCerts.forEach(cert => onUpdateStatus(cert.id, 'APPROVED'));
    }
  };

  const handleAddBacklog = (studentId: string) => {
    if (!newB.subjectCode || !newB.subjectName) return;
    onAddBacklog(studentId, { ...newB, status: 'PENDING' });
    setNewB({ subjectCode: '', subjectName: '', semester: 1 });
    setIsAddingBacklog(null);
  };

  const handleAddFee = (studentId: string) => {
    if (!newF.description || !newF.amount) return;
    onAddFee(studentId, {
      description: newF.description,
      amount: parseFloat(newF.amount),
      status: 'UNPAID',
      dueDate: new Date().toISOString().split('T')[0]
    });
    setNewF({ description: '', amount: '' });
    setIsAddingFee(null);
  };

  const triggerNotify = (studentId: string, studentName: string) => {
    setNotifyingIds(prev => new Set(prev).add(studentId));

    // Simulate API delay
    setTimeout(() => {
      onNotifyStudent(studentId, `URGENT: Outstanding fee dues detected on your account. Please clear your arrears immediately to avoid registration blocking.`, 'FEE');
      setNotifyingIds(prev => {
        const next = new Set(prev);
        next.delete(studentId);
        return next;
      });
    }, 1200);
  };

  const managingStudent = allStudents.find(s => s.id === managingStudentId);

  return (
    <div className="space-y-8">
      {/* Evidence Viewer Overlay */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-fade-in" onClick={() => setViewingFile(null)}>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] max-w-2xl w-full border border-slate-200/60 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 px-4">
              <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Attachment Preview</h3>
              <button onClick={() => setViewingFile(null)} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">&times;</button>
            </div>
            <div className="bg-slate-100 dark:bg-slate-950 rounded-[1.5rem] overflow-hidden flex justify-center p-2">
              <img src={viewingFile} alt="Evidence" className="max-w-full rounded-xl shadow-lg border border-white/10 animate-fade-in" />
            </div>
          </div>
        </div>
      )}

      {/* Student Management Modal */}
      {managingStudentId && managingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-fade-in" onClick={() => setManagingStudentId(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-200/60 shadow-2xl animate-scale-in flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Manage Student Profile</h3>
                  <p className="text-sm font-bold text-indigo-500 uppercase tracking-widest">{managingStudent.name} • {managingStudent.ktuid}</p>
                </div>
                <button
                  onClick={() => triggerNotify(managingStudent.id, managingStudent.name)}
                  disabled={notifyingIds.has(managingStudent.id)}
                  className={`p-3 rounded-2xl transition-all ${notifyingIds.has(managingStudent.id) ? 'bg-slate-100 text-slate-300' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm'}`}
                  title="Notify Student"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${notifyingIds.has(managingStudent.id) ? 'animate-bounce' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </button>
              </div>
              <button onClick={() => setManagingStudentId(null)} className="p-4 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Academic Performance Overrides */}
              <section>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>
                  Academic Results (SGPA Override)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {(allResults[managingStudent.id] || []).map(res => (
                    <div key={res.semester} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Semester {res.semester}</p>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        defaultValue={res.sgpa}
                        onBlur={(e) => onUpdateResult(managingStudent.id, res.semester, parseFloat(e.target.value))}
                        className="w-full bg-transparent text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:text-indigo-600 dark:focus:text-indigo-400"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Backlog Management */}
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2"></span>
                    Backlog Control
                  </h4>
                  <button onClick={() => setIsAddingBacklog(managingStudent.id)} className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline">+ Add New Backlog</button>
                </div>

                {isAddingBacklog === managingStudent.id && (
                  <div className="mb-6 p-6 bg-rose-50/30 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/50 space-y-4 animate-scale-in">
                    <div className="grid grid-cols-2 gap-4">
                      <SmoothInput placeholder="Code" value={newB.subjectCode} onChange={v => setNewB({ ...newB, subjectCode: v })} fontSans className="h-12" />
                      <SmoothInput placeholder="Name" value={newB.subjectName} onChange={v => setNewB({ ...newB, subjectName: v })} fontSans className="h-12" />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button onClick={() => setIsAddingBacklog(null)} className="px-6 py-2 text-xs font-bold text-slate-500">Cancel</button>
                      <button onClick={() => handleAddBacklog(managingStudent.id)} className="px-6 py-2 bg-rose-600 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-rose-500/20">Record Backlog</button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {(allBacklogs[managingStudent.id] || []).map(b => (
                    <div key={b.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{b.subjectCode}</span>
                        <span className="text-sm text-slate-500 ml-2">{b.subjectName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={b.status}
                          onChange={(e) => onUpdateBacklog(managingStudent.id, b.id, e.target.value as any)}
                          className="bg-white dark:bg-slate-900 text-[10px] font-black uppercase tracking-widest rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-800"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="REGISTERED">Registered</option>
                          <option value="CLEARED">Cleared</option>
                        </select>
                        <button onClick={() => onRemoveBacklog(managingStudent.id, b.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {(allBacklogs[managingStudent.id] || []).length === 0 && <p className="text-center text-slate-400 text-sm py-4 italic">No backlogs recorded.</p>}
                </div>
              </section>

              {/* Fee Management */}
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                    Financial Ledger
                  </h4>
                  <button onClick={() => setIsAddingFee(managingStudent.id)} className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline">+ New Arrear</button>
                </div>

                {isAddingFee === managingStudent.id && (
                  <div className="mb-6 p-6 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-900/50 space-y-4 animate-scale-in">
                    <div className="grid grid-cols-2 gap-4">
                      <SmoothInput placeholder="Description (e.g. Lab Fee)" value={newF.description} onChange={v => setNewF({ ...newF, description: v })} fontSans className="h-12" />
                      <SmoothInput placeholder="Amount (₹)" value={newF.amount} onChange={v => setNewF({ ...newF, amount: v })} fontSans className="h-12" />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button onClick={() => setIsAddingFee(null)} className="px-6 py-2 text-xs font-bold text-slate-500">Cancel</button>
                      <button onClick={() => handleAddFee(managingStudent.id)} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-emerald-500/20">Add Fee Entry</button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {(allFees[managingStudent.id] || []).map(f => (
                    <div key={f.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{f.description}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">₹{f.amount.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateFeeStatus(managingStudent.id, f.id, f.status === 'PAID' ? 'UNPAID' : 'PAID')}
                          className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${f.status === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}
                        >
                          {f.status}
                        </button>
                        <button onClick={() => onRemoveFee(managingStudent.id, f.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {(allFees[managingStudent.id] || []).length === 0 && <p className="text-center text-slate-400 text-sm py-4 italic">Clear account - No arrears.</p>}
                </div>
              </section>
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-right">
              <button onClick={() => setManagingStudentId(null)} className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all">Done Managing</button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800 animate-slide-up stagger-1 hover:shadow-xl hover:scale-[1.02] transition-all duration-500">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Verification Queue</h3>
          <p className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter mt-4">{pendingCerts.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800 animate-slide-up stagger-2 hover:shadow-xl hover:scale-[1.02] transition-all duration-500">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Student Roster</h3>
          <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mt-4">{filteredStudents.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800 animate-slide-up stagger-3 hover:shadow-xl hover:scale-[1.02] transition-all duration-500">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Fee Defaulters</h3>
          <p className="text-5xl font-black text-rose-500 tracking-tighter mt-4">{studentsWithPendingFees.length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden animate-slide-up stagger-3">
        <div className="flex flex-col sm:flex-row border-b border-slate-100 dark:border-slate-800 p-2 items-center">
          <div className="flex space-x-2 flex-1 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {['certs', 'backlogs', 'fees'].map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-8 py-4 text-sm font-bold transition-all duration-500 rounded-2xl whitespace-nowrap animate-tab-entry stagger-${i + 1} ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 translate-y-[-2px]' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600'}`}
              >
                {tab === 'certs' ? 'Credential Pipeline' : tab === 'backlogs' ? 'Records Admin' : 'Pending Fees'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 min-h-[400px]">
          <div key={activeTab} className="animate-view-morphic">
            {activeTab === 'certs' ? (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-list-roll stagger-1">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Verification Queue</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Filtering {filteredCerts.length} of {pendingCerts.length} pending</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <div className="w-full sm:w-64">
                      <SmoothInput placeholder="Search claims..." value={certSearch} onChange={setCertSearch} fontSans className="h-12" />
                    </div>
                    {filteredCerts.length > 1 && (
                      <button
                        onClick={handleApproveAll}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all"
                      >
                        Approve Visible
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredCerts.length === 0 ? (
                        <tr><td className="py-20 text-center text-slate-400 italic">No pending verifications match your search.</td></tr>
                      ) : (
                        filteredCerts.map((cert, i) => (
                          <tr key={cert.id} className={`text-sm hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all animate-list-roll stagger-${Math.min(i + 2, 7)}`}>
                            <td className="px-6 py-6">
                              <p className="font-bold text-slate-900 dark:text-white">{cert.studentName}</p>
                              <p className="text-xs text-slate-400">{cert.studentId}</p>
                            </td>
                            <td className="px-6 py-6">
                              <p className="font-semibold text-slate-700 dark:text-slate-200">{cert.title}</p>
                              <p className="text-[10px] font-black text-indigo-500 uppercase">{cert.category}</p>
                            </td>
                            <td className="px-6 py-6 font-black text-center text-lg text-slate-900 dark:text-white">{cert.pointsClaimed}</td>
                            <td className="px-6 py-6 text-right">
                              <div className="flex justify-end space-x-2">
                                {cert.fileUrl && (
                                  <button onClick={() => setViewingFile(cert.fileUrl!)} className="p-3 bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm" title="View Attachment">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                  </button>
                                )}
                                <button onClick={() => onUpdateStatus(cert.id, 'APPROVED')} className="p-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm" title="Approve">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </button>
                                <button onClick={() => onUpdateStatus(cert.id, 'REJECTED')} className="p-3 bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm" title="Reject">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === 'backlogs' ? (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-list-roll stagger-1">
                  <h4 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Student Registry</h4>
                  <div className="w-full sm:w-80">
                    <SmoothInput placeholder="Search students..." value={studentSearch} onChange={setStudentSearch} fontSans />
                  </div>
                </div>

                <div className="grid gap-6">
                  {filteredStudents.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 italic bg-slate-50 dark:bg-slate-950 rounded-3xl">No students found for this department.</div>
                  ) : (
                    filteredStudents.map((student, i) => (
                      <div key={student.id} className={`bg-white dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 animate-list-roll stagger-${Math.min(i + 2, 7)}`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                          <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{student.name}</p>
                            <p className="text-xs font-black text-indigo-500 uppercase tracking-widest">{student.ktuid} • {student.email}</p>
                          </div>
                          <button
                            onClick={() => setManagingStudentId(student.id)}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all"
                          >
                            Administer Account
                          </button>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Current Hurdles</p>
                          {(allBacklogs[student.id] || []).length === 0 ? (
                            <div className="p-4 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-xl border border-emerald-100/50 dark:border-emerald-800/30 text-emerald-600 text-xs font-bold">No recorded backlogs for this student.</div>
                          ) : (
                            allBacklogs[student.id].map((backlog) => (
                              <div key={backlog.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <span className="text-sm font-black text-indigo-600">{backlog.subjectCode} - {backlog.subjectName}</span>
                                <div className="flex items-center space-x-3">
                                  <span className={`text-[10px] font-black uppercase ${backlog.status === 'CLEARED' ? 'text-emerald-500' : backlog.status === 'REGISTERED' ? 'text-indigo-500' : 'text-rose-500'}`}>
                                    {backlog.status === 'REGISTERED' ? 'Exam Scheduled' : backlog.status}
                                  </span>
                                  {backlog.status !== 'CLEARED' && (
                                    <button
                                      onClick={() => onUpdateBacklog(student.id, backlog.id, 'CLEARED')}
                                      className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-colors"
                                      title="Mark as Cleared"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <h4 className="text-xl font-extrabold tracking-tight animate-list-roll stagger-1 text-slate-900 dark:text-white">Financial Arrears</h4>
                <div className="grid gap-4">
                  {studentsWithPendingFees.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 italic bg-slate-50 dark:bg-slate-950 rounded-3xl">Great! All students in your department have cleared their dues.</div>
                  ) : (
                    studentsWithPendingFees.map((student, i) => {
                      const pendingTotal = (allFees[student.id] || []).filter(f => f.status === 'UNPAID').reduce((sum, f) => sum + f.amount, 0);
                      return (
                        <div key={student.id} className={`bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 animate-list-roll stagger-${Math.min(i + 2, 7)} flex flex-col sm:flex-row justify-between items-center group`}>
                          <div className="text-center sm:text-left">
                            <p className="text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{student.name}</p>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{student.ktuid}</p>
                          </div>
                          <div className="mt-4 sm:mt-0 text-center sm:text-right flex items-center gap-6">
                            <div>
                              <p className="text-2xl font-black text-rose-500">₹{pendingTotal.toLocaleString()}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 text-right">Pending Amount</p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => triggerNotify(student.id, student.name)}
                                disabled={notifyingIds.has(student.id)}
                                className={`p-3 rounded-2xl transition-all ${notifyingIds.has(student.id) ? 'bg-slate-100 text-slate-300' : 'bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white shadow-sm'}`}
                                title="Send Fee Alert"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${notifyingIds.has(student.id) ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                              </button>
                              <button
                                onClick={() => setManagingStudentId(student.id)}
                                className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline"
                              >
                                Manage
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
