import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Dashboard } from './pages/Dashboard';
import { QuizAdmin } from './pages/QuizAdmin';
import { MediaManager } from './pages/MediaManager';
import { Login } from './pages/Login';
import { Toaster } from 'sonner';
import { adminService } from './services/adminService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [view, setView] = useState<'dashboard' | 'quizzes' | 'media'>('dashboard');

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      const authenticated = adminService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      {isAuthenticated ? (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <SidebarStateWrapper view={view} setView={setView} onLogout={handleLogout} />
        </div>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        theme="system"
      />
    </ThemeProvider>
  );
}

export default App;

// Small wrapper to reuse existing Sidebar component and switch views
import { Sidebar } from './components/layout/Sidebar';
const SidebarStateWrapper: React.FC<{ view: 'dashboard' | 'quizzes' | 'media'; setView: (v: 'dashboard' | 'quizzes' | 'media') => void; onLogout: () => void }>
  = ({ view, setView, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1024 : true));
  return (
    <>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onLogout={onLogout} onNavigate={(v) => setView(v)} currentView={view} />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-56' : 'lg:pl-0'}`}>
        {view === 'dashboard' ? (
          <Dashboard />
        ) : view === 'quizzes' ? (
          <QuizAdmin />
        ) : (
          <MediaManager />
        )}
      </div>
    </>
  );
};
