/**
 * Theme Context Provider
 * Manages dark/light mode theme switching
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { THEME_MODES, LOCAL_STORAGE_KEYS } from '../constants/app';
import type { ThemeMode } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME) as ThemeMode;
    return savedTheme || THEME_MODES.LIGHT;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(THEME_MODES.LIGHT, THEME_MODES.DARK);
    root.classList.add(theme);
    localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT));
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
