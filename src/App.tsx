import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import DashboardPage from './pages/DashboardPage';
import MCQPage from './pages/MCQPage';
import CaseLawsPage from './pages/CaseLawsPage';
import NotesPage from './pages/NotesPage';
import DoubtsPage from './pages/DoubtsPage';
import ChatbotPage from './pages/ChatbotPage';
import ExpertPage from './pages/ExpertPage';
import AudioPage from './pages/AudioPage';
import LibraryPage from './pages/LibraryPage';
import AnswersPage from './pages/AnswersPage';
import AudioPlayer from './components/AudioPlayer';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mcq"
        element={
          <ProtectedRoute>
            <MCQPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases"
        element={
          <ProtectedRoute>
            <CaseLawsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <NotesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doubts"
        element={
          <ProtectedRoute>
            <DoubtsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chatbot"
        element={
          <ProtectedRoute>
            <ChatbotPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expert"
        element={
          <ProtectedRoute>
            <ExpertPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audio"
        element={
          <ProtectedRoute>
            <AudioPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audio-player/:id"
        element={
          <ProtectedRoute>
            <AudioPlayer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/library"
        element={
          <ProtectedRoute>
            <LibraryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/answers"
        element={
          <ProtectedRoute>
            <AnswersPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
