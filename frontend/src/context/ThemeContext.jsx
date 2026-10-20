import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * @typedef {'light'|'dark'} ThemeMode
 *
 * @typedef {Object} ThemeContextValue
 * @property {ThemeMode} theme
 * @property {boolean} isDark
 * @property {() => void} toggleTheme
 * @property {(theme: ThemeMode) => void} setTheme
 */

const ThemeContext = createContext(/** @type {ThemeContextValue|null} */ (null));

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('hostel_theme') || 'light';
  });

  // Synchronize with DOM root element attribute and localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hostel_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setThemeState(newTheme);
    }
  }, []);

  const value = {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
