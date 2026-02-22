
import React, { useState, useMemo } from 'react';
import { User, Certificate, KTUActivityCategory, Backlog, FeeRecord, SemesterResult, Notification } from '../types.ts';
import { SmoothInput } from './SmoothInput.tsx';
import { suggestCategory } from '../services/geminiService.ts';

interface StudentDashboardProps {
  user: User;
  certificates: Certificate[];
  backlogs: Backlog[];
  fees: FeeRecord[];
  results: SemesterResult[];
  notifications: Notification[];
  onAddCertificate: (cert: Certificate) => void;
  onRegisterForExam: (backlogId: string) => void;
  onPayFee: (feeId: string) => void;
  onMarkAsRead: (id: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
  user, 
  certificates, 
  backlogs, 
  fees,
  results,
  notifications,
  onAddCertificate,
  onRegisterForExam,
  onPayFee,
  onMarkAsRead
}) => {
  const [activeTab, setActiveTab] = useState<'points' | 'backlogs' | 'fees' | 'results' | 'alerts'>('points');
  const [isUploading, setIsUploading] = useState(false);
  const [newCert, setNewCert] = useState({ title: '', category: KTUActivityCategory.TECHNICAL_FESTS, points: '' });
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [payingFeeId, setPayingFeeId] = useState<string | null>(null);
  const [paymentProgress, setPaymentProgress] = useState(0);
  
  const [applyingBacklogId, setApplyingBacklogId] = useState<string | null>(null);

  const approvedPoints = certificates
    .filter(c => c.status === 'APPROVED' && c.studentId === user.id)
    .reduce((acc, curr) => acc + curr.pointsClaimed, 0);

  const cgpa = useMemo(() => {
    if (results.length === 0) return 0;
    const totalSgpa = results.reduce((acc, sem) => acc + sem.sgpa, 0);
    return parseFloat((totalSgpa / results.length).toFixed(2));
  }, [results]);

  const unreadNotifs = notifications.filter(n => !n.isRead);

  const handleAiSuggest = async () => {
    if (!newCert.title) return;
    setIsAiLoading(true);
    const suggested = await suggestCategory(newCert.title);
    setNewCert(prev => ({ ...prev, category: suggested }));
    setIsAiLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFileBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const cert: Certificate = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: user.id,
      studentName: user.name,
      studentDepartment: user.department,
      title: newCert.title,
      category: newCert.category,
      date: new Date().toISOString().split('T')[0],
      pointsClaimed: Number(newCert.points),
      status: 'PENDING',
      fileUrl: fileBase64 || undefined
    };
    onAddCertificate(cert);
    setIsUploading(false);
    setNewCert({ title: '', category: KTUActivityCategory.TECHNICAL_FESTS, points: '' });
    setFileBase64(null);
  };

  const handlePayment = (feeId: string) => {
    setPayingFeeId(feeId);
    setPaymentProgress(0);
    const interval = setInterval(() => {
      setPaymentProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onPayFee(feeId);
            setPayingFeeId(null);
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const selectClasses = "w-full h-[60px] px-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:text-white transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer";

  const pendingRegistrations = backlogs.filter(b => b.status === 'PENDING');
  const activeRegistrations = backlogs.filter(b => b.status === 'REGISTERED');

  return (
    <div className="space-y-8">
      {/* Exam Confirmation Modal */}
      {applyingBacklogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full border border-slate-200/60 dark:border-slate-800 animate-scale-in">
            <h3 className="text-xl font-bold mb-4 tracking-tight text-slate-900 dark:text-white">Exam Registration</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 leading-relaxed">
              Registering for <strong>{backlogs.find(b => b.id === applyingBacklogId)?.subjectName}</strong> supplementary exam. A registration fee of ₹500 will be added to your arrears.
            </p>
            <div className="flex space-x-3">
              <button onClick={() => setApplyingBacklogId(null)} className="flex-1 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors">Cancel</button>
              <button onClick={() => { onRegisterForExam(applyingBacklogId!); setApplyingBacklogId(null); }} className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Activity Points', value: `${approvedPoints} / 100`, color: 'indigo', pct: Math.min(approvedPoints, 100) },
          { label: 'Backlogs Pending', value: pendingRegistrations.length.toString(), color: 'rose', pct: (pendingRegistrations.length / 5) * 100 },
          { label: 'Academic CGPA', value: cgpa.toString(), color: 'emerald', pct: (cgpa / 10) * 100 }
        ].map((stat, idx) => (
          <div key={idx} className={`bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-500 animate-slide-up stagger-${idx+1}`}>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</h3>
            <p className={`text-3xl font-black mt-2 text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.value}</p>
            <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full bg-${stat.color}-500 rounded-full transition-all duration-[1500ms] cubic-bezier(0.16, 1, 0.3, 1)`} style={{ width: `${stat.pct}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden animate-slide-up stagger-3">
        <div className="flex border-b border-slate-100 dark:border-slate-800 p-2 overflow-x-auto no-scrollbar items-center">
          {[
            { id: 'points', label: 'Activity Portal' },
            { id: 'backlogs', label: 'Re-exam Center' },
            { id: 'fees', label: 'Finance' },
            { id: 'results', label: 'Results' }
          ].map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-8 py-4 text-sm font-bold transition-all duration-500 rounded-2xl whitespace-nowrap animate-tab-entry stagger-${i+1} ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 translate-y-[-2px]' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600'}`}
            >
              {tab.label}
            </button>
          ))}
          
          <div className="ml-auto pr-4">
              <button 
                onClick={() => setActiveTab('alerts')}
                className={`p-3 rounded-xl transition-all relative ${activeTab === 'alerts' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  {unreadNotifs.length > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
                  )}
              </button>
          </div>
        </div>

        <div className="p-8 min-h-[400px]">
          <div key={activeTab} className="animate-view-morphic">
            {activeTab === 'points' ? (
              <div className="space-y-8">
                <div className="flex justify-between items-center animate-list-roll stagger-1">
                  <h4 className="text-xl font-bold">Activity Point Claims</h4>
                  <button onClick={() => setIsUploading(!isUploading)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all">
                    {isUploading ? 'Hide Form' : 'New Claim'}
                  </button>
                </div>

                {isUploading && (
                  <form onSubmit={handleUpload} className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-6 animate-scale-in shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 ml-4 uppercase tracking-widest">Activity Title</label>
                        <SmoothInput 
                          value={newCert.title} 
                          onChange={(val) => setNewCert({...newCert, title: val})} 
                          placeholder="e.g. Workshop on Web Dev" 
                          fontSans
                          required 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="flex justify-between text-xs font-bold text-slate-500 ml-4 uppercase tracking-widest">
                          Category
                          <button 
                            type="button" 
                            onClick={handleAiSuggest}
                            disabled={isAiLoading || !newCert.title}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50 disabled:no-underline"
                          >
                            {isAiLoading ? 'Analyzing...' : '✨ Auto-Suggest'}
                          </button>
                        </label>
                        <select 
                          value={newCert.category} 
                          onChange={(e) => setNewCert({...newCert, category: e.target.value as KTUActivityCategory})} 
                          className={selectClasses}
                        >
                          {Object.values(KTUActivityCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 ml-4 uppercase tracking-widest">Points Claimed</label>
                        <SmoothInput 
                          value={newCert.points} 
                          onChange={(val) => setNewCert({...newCert, points: val})} 
                          placeholder="Points (e.g. 10)"
                          required 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 ml-4 uppercase tracking-widest">Evidence Attachment</label>
                        <div className="relative group animate-scale-in h-[60px]">
                          <input 
                            type="file" 
                            onChange={handleFileChange} 
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            required 
                          />
                          <div className="w-full h-full px-5 flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 group-hover:border-indigo-500 transition-colors shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            {fileBase64 ? 'Document selected' : 'Upload PDF/Image'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                      <button type="button" onClick={() => setIsUploading(false)} className="px-8 py-4 text-slate-500 font-bold hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">Cancel</button>
                      <button type="submit" className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all">Submit Claim</button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certificates.filter(c => c.studentId === user.id).map((cert, i) => (
                    <div key={cert.id} className={`p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm flex justify-between items-center group hover:border-indigo-200 hover:shadow-md transition-all animate-list-roll stagger-${Math.min(i+2, 7)}`}>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{cert.title}</p>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider mt-1">{cert.category}</p>
                        <p className="text-xs text-slate-400 mt-2">{cert.date} • {cert.pointsClaimed} Points</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transform transition-transform group-hover:scale-110 ${cert.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : cert.status === 'REJECTED' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
                        {cert.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === 'backlogs' ? (
              <div className="space-y-8">
                <div className="flex justify-between items-center animate-list-roll stagger-1">
                  <h4 className="text-xl font-bold">Re-exam Registrations</h4>
                  <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl text-[10px] font-black uppercase text-indigo-600 tracking-widest">
                    Registration Window: OPEN
                  </div>
                </div>

                <div className="space-y-12">
                  <section>
                    <h5 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Available for Re-exam</h5>
                    <div className="space-y-4">
                      {pendingRegistrations.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 italic bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">No active backlogs. Keep up the good work!</div>
                      ) : (
                        pendingRegistrations.map((backlog, i) => (
                          <div key={backlog.id} className={`p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-list-roll stagger-${Math.min(i+2, 7)} hover:border-indigo-200 transition-all group`}>
                            <div>
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-black text-indigo-600 group-hover:scale-110 transition-transform">{backlog.subjectCode}</span>
                                <span className="font-bold text-slate-900 dark:text-white">{backlog.subjectName}</span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1">Originally Semester {backlog.semester} • Arrear Status: <span className="uppercase font-bold text-rose-500">PENDING</span></p>
                            </div>
                            <button onClick={() => setApplyingBacklogId(backlog.id)} className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/10 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all">Register for Re-exam</button>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  {activeRegistrations.length > 0 && (
                    <section className="animate-fade-in stagger-3">
                      <h5 className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-6 flex items-center">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                        Active Re-exam Schedule
                      </h5>
                      <div className="space-y-4">
                        {activeRegistrations.map((backlog, i) => (
                          <div key={backlog.id} className="p-6 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-800/30 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-black text-emerald-600">{backlog.subjectCode}</span>
                                <span className="font-bold text-slate-900 dark:text-white">{backlog.subjectName}</span>
                              </div>
                              <p className="text-xs text-emerald-600/60 mt-1 font-bold">Hall Ticket will be generated 3 days before the re-exam.</p>
                            </div>
                            <span className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-emerald-500/20">
                              Registered
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            ) : activeTab === 'fees' ? (
              <div className="space-y-8">
                <h4 className="text-xl font-bold animate-list-roll stagger-1">Finance Portal</h4>
                <div className="space-y-4">
                  {fees.map((fee, i) => (
                    <div key={fee.id} className={`p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-list-roll stagger-${Math.min(i+2, 7)} hover:border-indigo-200 transition-all`}>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{fee.description}</p>
                        <p className="text-xs text-slate-400 mt-1">Due: {fee.dueDate} • Amount: ₹{fee.amount.toLocaleString()}</p>
                      </div>
                      {fee.status === 'UNPAID' ? (
                        <button onClick={() => handlePayment(fee.id)} disabled={payingFeeId === fee.id} className="relative overflow-hidden px-8 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all min-w-[140px]">
                          {payingFeeId === fee.id ? (
                            <>
                              <span className="relative z-10">Processing... {paymentProgress}%</span>
                              <div className="absolute inset-0 bg-emerald-500 transition-all duration-300" style={{ width: `${paymentProgress}%`, opacity: 0.3 }}></div>
                            </>
                          ) : 'Pay Now'}
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2 text-emerald-500 animate-scale-in">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-black uppercase">Transaction Paid</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === 'results' ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-list-roll stagger-1">
                  <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 p-8 rounded-[2rem] border border-indigo-100 dark:border-slate-700 shadow-sm">
                    <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">Semester Performance</h4>
                    <p className="text-4xl font-black text-slate-900 dark:text-white">{results[results.length-1]?.sgpa || 0}</p>
                    <span className="text-sm font-bold text-slate-400">SGPA (Current)</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Cumulative Average</h4>
                    <p className="text-4xl font-black text-slate-900 dark:text-white">{cgpa}</p>
                    <span className="text-sm font-bold text-slate-400">CGPA</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {results.slice().reverse().map((semResult, i) => (
                    <div key={semResult.semester} className={`bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm animate-list-roll stagger-${Math.min(i+2, 7)}`}>
                      <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-100 dark:border-slate-700">
                        <span className="text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Semester {semResult.semester}</span>
                        <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase">SGPA: {semResult.sgpa}</span>
                      </div>
                      <div className="p-0">
                        <table className="w-full text-left">
                          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {semResult.subjects.map((sub) => (
                              <tr key={sub.code} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                <td className="px-8 py-5">
                                  <p className="font-bold text-slate-900 dark:text-white">{sub.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">{sub.code}</p>
                                </td>
                                <td className="px-8 py-5 text-right">
                                  <span className={`inline-block w-8 h-8 leading-8 text-center rounded-lg font-black text-xs ${
                                    ['S', 'A+', 'A'].includes(sub.grade) ? 'bg-emerald-50 text-emerald-600' : 
                                    ['B+', 'B'].includes(sub.grade) ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {sub.grade}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
                <div className="space-y-8 max-w-2xl mx-auto">
                    <div className="flex justify-between items-center animate-list-roll stagger-1">
                        <h4 className="text-xl font-black tracking-tight">Alert Center</h4>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{notifications.length} Total Alerts</span>
                    </div>
                    <div className="space-y-4">
                        {notifications.length === 0 ? (
                            <div className="py-20 text-center text-slate-400 italic bg-slate-50 dark:bg-slate-950 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 animate-scale-in">
                                <p>No notifications yet. You're all caught up!</p>
                            </div>
                        ) : (
                            notifications.map((n, i) => (
                                <div 
                                    key={n.id} 
                                    onClick={() => onMarkAsRead(n.id)}
                                    className={`p-6 rounded-[2rem] border transition-all cursor-pointer group animate-list-roll stagger-${Math.min(i+2, 7)} ${n.isRead ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60' : 'bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-800 shadow-lg shadow-indigo-500/5'}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${n.type === 'FEE' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${n.type === 'FEE' ? 'text-rose-500' : 'text-indigo-500'}`}>{n.type} Alert</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400">{n.timestamp}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed group-hover:text-indigo-600 transition-colors">
                                        {n.message}
                                    </p>
                                    {!n.isRead && (
                                        <div className="mt-4 flex justify-end">
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Mark as Read</span>
                                        </div>
                                    )}
                                </div>
                            ))
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
