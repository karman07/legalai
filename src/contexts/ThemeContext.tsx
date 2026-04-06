import { createContext, useContext, useEffect } from 'react';

type Theme = 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Force light mode: remove dark class and clear any stored preference
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  }, []);

  // toggleTheme is a no-op — theme is locked to light
  const toggleTheme = () => {};

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggleTheme, isDark: false }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
