
import React, { useState } from 'react';
import { UserRole, User } from '../types.ts';
import { SmoothInput } from './SmoothInput.tsx';
import { loginUser, registerUser } from '../services/dataService.ts';

interface LoginProps {
  onLogin: (user: User) => void;
}



export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingView, setIsChangingView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const newUser = await registerUser({
        name,
        role,
        ktuid: id.trim(),
        department,
        email,
        password,
      });
      onLogin(newUser);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await loginUser(id.trim(), password);
      // Validate role matches what the user selected
      if (user.role !== role) {
        setError(`Account found but role is ${user.role}. Switch to ${user.role === UserRole.STUDENT ? 'Student' : 'Teacher'} mode.`);
        return;
      }
      onLogin(user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg === 'Invalid credentials' ? 'Incorrect ID or password.' : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);

  const switchView = () => {
    setIsChangingView(true);
    setError('');
    setShowPassword(false);

    setTimeout(() => {
      setView(prev => prev === 'LOGIN' ? 'REGISTER' : 'LOGIN');
      setIsChangingView(false);
    }, 250);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-6 animate-fade-in relative overflow-hidden">
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 ${view === 'LOGIN' ? 'bg-indigo-500/10 dark:bg-indigo-600/5' : 'bg-emerald-500/10 dark:bg-emerald-600/5'
          }`}
      ></div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/50 transform transition-all duration-700 animate-slide-up relative z-10">
        <div className="p-10">
          <div className="flex justify-center mb-8">
            <div className={`p-4 rounded-2xl shadow-xl transform hover:rotate-6 transition-all duration-700 ${view === 'LOGIN' ? 'bg-indigo-600 shadow-indigo-500/20' : 'bg-emerald-600 shadow-emerald-500/20'
              }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
          </div>

          <div className={`transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isChangingView ? 'opacity-0 scale-[0.97] blur-md' : 'opacity-100 scale-100 blur-0'}`}>
            <h2 className="text-3xl font-black text-center text-gray-900 dark:text-white mb-2 tracking-tighter">
              KTU Hub
            </h2>
            <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-10">
              {view === 'LOGIN' ? 'Secure Login for Academic Portal' : 'Register your student/faculty account'}
            </p>

            <div className="relative flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-8">
              <div
                className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-slate-700 rounded-xl shadow-md transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)"
                style={{
                  left: '6px',
                  transform: `translateX(${role === UserRole.STUDENT ? '0' : '100%'})`
                }}
              />

              <button
                type="button"
                onClick={() => setRole(UserRole.STUDENT)}
                className={`relative z-10 flex-1 py-3 text-sm font-bold rounded-xl transition-colors duration-500 ${role === UserRole.STUDENT ? 'text-indigo-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.TEACHER)}
                className={`relative z-10 flex-1 py-3 text-sm font-bold rounded-xl transition-colors duration-500 ${role === UserRole.TEACHER ? 'text-indigo-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Teacher
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm rounded-2xl border border-red-100 dark:border-red-900/50 animate-scale-in">
              {error}
            </div>
          )}

          <form onSubmit={view === 'LOGIN' ? handleLoginSubmit : handleRegister} className="flex flex-col">
            <div className={`form-expand ${view === 'REGISTER' ? 'active mb-4' : ''}`}>
              <div className="flex flex-col gap-4 pb-4">
                <SmoothInput value={name} onChange={setName} placeholder="Full Name" fontSans required={view === 'REGISTER'} className={view === 'REGISTER' ? "animate-reveal-stagger stagger-1" : ""} />
                <SmoothInput value={department} onChange={setDepartment} placeholder="Dept (e.g. CSE)" required={view === 'REGISTER'} className={view === 'REGISTER' ? "animate-reveal-stagger stagger-2" : ""} />
                <SmoothInput value={email} onChange={setEmail} placeholder="Email Address" fontSans required={view === 'REGISTER'} className={view === 'REGISTER' ? "animate-reveal-stagger stagger-3" : ""} />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <SmoothInput
                value={id}
                onChange={setId}
                placeholder={role === UserRole.STUDENT ? "Reg Number (ADR23CD015)" : "Staff ID (staff001)"}
                autoComplete="username"
                required
                className={view === 'LOGIN' ? "animate-reveal-stagger stagger-1" : "animate-reveal-stagger stagger-4"}
              />

              <div className={`relative group/pass ${view === 'LOGIN' ? "animate-reveal-stagger stagger-2" : "animate-reveal-stagger stagger-5"}`}>
                <SmoothInput
                  value={password}
                  onChange={setPassword}
                  isPassword={true}
                  showPassword={showPassword}
                  onBlur={() => setShowPassword(false)}
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 focus:outline-none active:scale-75 z-20"
                >
                  <div className="relative w-5 h-5 overflow-hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 absolute inset-0 transform transition-all duration-500 ease-out ${showPassword ? 'translate-y-0 rotate-0 opacity-100' : 'translate-y-8 rotate-45 opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 absolute inset-0 transform transition-all duration-500 ease-out ${!showPassword ? 'translate-y-0 rotate-0 opacity-100' : '-translate-y-8 -rotate-45 opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  </div>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 text-white font-bold rounded-2xl transition-all duration-700 shadow-xl transform hover:scale-[1.02] active:scale-[0.98] animate-reveal-stagger stagger-3 disabled:opacity-60 disabled:cursor-not-allowed ${view === 'REGISTER' ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-indigo-600 shadow-indigo-500/20'
                  }`}
              >
                {isLoading ? 'Please wait…' : view === 'LOGIN' ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center animate-reveal-stagger stagger-5">
            <button
              type="button"
              onClick={switchView}
              className={`text-sm font-bold transition-all duration-500 ${view === 'LOGIN' ? 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-500' : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-500'
                }`}
            >
              {view === 'LOGIN' ? "New here? Register your ID" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
