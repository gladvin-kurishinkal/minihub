
import React, { useState, useRef } from 'react';

interface SmoothInputProps {
  value: string;
  onChange: (val: string) => void;
  isPassword?: boolean;
  showPassword?: boolean;
  placeholder?: string;
  className?: string;
  fontSans?: boolean;
  required?: boolean;
  autoComplete?: string;
  onBlur?: () => void;
}

export const SmoothInput: React.FC<SmoothInputProps> = ({ 
  value, onChange, isPassword, showPassword, placeholder, className, fontSans, required, autoComplete, onBlur 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const charWidth = fontSans ? 0.7 : 1.1;

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  return (
    <div 
      className={`relative w-full h-14 rounded-xl bg-white dark:bg-slate-800 border transition-all px-5 flex items-center cursor-text ${
        isFocused ? 'ring-4 ring-indigo-500/10 border-indigo-500 shadow-lg scale-[1.01]' : 'border-slate-200 dark:border-slate-700'
      } ${className}`}
      onClick={() => inputRef.current?.focus()}
    >
      <input
        ref={inputRef}
        type={isPassword && !showPassword ? "password" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        required={required}
        autoComplete={autoComplete}
        className="absolute inset-0 opacity-0 z-10 w-full cursor-text"
      />
      <div className={`relative flex items-center w-full overflow-hidden h-full pointer-events-none ${fontSans ? 'font-sans' : 'font-mono text-lg tracking-widest'}`}>
        {!value && (
          <span className="text-slate-400 dark:text-slate-500 font-sans tracking-normal animate-placeholder-flow">
            {placeholder}
          </span>
        )}
        <div className="flex relative items-center h-full">
          {value.split('').map((char, i) => (
            <span 
              key={i} 
              className="animate-char-pop text-slate-900 dark:text-white" 
              style={{ width: `${charWidth}em` }}
            >
              {isPassword && !showPassword ? '•' : char}
            </span>
          ))}
          <div 
            className={`h-5 w-[2px] bg-indigo-500 shadow-xl transition-all ${isFocused ? 'opacity-100' : 'opacity-0'}`} 
            style={{ marginLeft: '2px' }} 
          />
        </div>
      </div>
    </div>
  );
};
