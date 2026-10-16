import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const themeContext = useTheme();

  if (!themeContext) {
    console.error('ThemeToggle is not wrapped in ThemeProvider');
    return null;
  }

  const { theme, toggleTheme } = themeContext;

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-all duration-300 active:scale-95"
    >
      <span className="text-lg transition-transform duration-500" style={{ transform: theme === 'dark' ? 'rotate(0deg)' : 'rotate(180deg)' }}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
    </button>
  );
};

export default ThemeToggle;