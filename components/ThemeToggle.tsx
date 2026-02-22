
import React from 'react';

interface ThemeToggleProps {
  isDark: boolean;
  toggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggle }) => {
  return (
    <button
      onClick={toggle}
      className="p-3 rounded-2xl bg-white/10 dark:bg-slate-800/50 hover:bg-white/20 dark:hover:bg-slate-700/50 border border-slate-200/50 dark:border-slate-700/50 shadow-sm backdrop-blur-md focus:outline-none group active:scale-90 transition-all duration-300"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className="relative w-6 h-6 overflow-hidden">
        {/* Sun Icon */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-6 w-6 text-yellow-400 absolute inset-0 transform transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isDark ? 'translate-y-0 opacity-100 rotate-0' : 'translate-y-8 opacity-0 -rotate-45'}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 000 14 7 7 0 000-14z" />
        </svg>

        {/* Moon Icon */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-6 w-6 text-slate-700 dark:text-gray-200 absolute inset-0 transform transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${!isDark ? 'translate-y-0 opacity-100 rotate-0' : '-translate-y-8 opacity-0 rotate-45'}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </div>
    </button>
  );
};
