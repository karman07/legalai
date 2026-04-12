import { Link, NavLink } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function PublicNavbar() {
  const { user } = useAuth();

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Blogs', to: '/blogs' },
    { label: 'Privacy', to: '/privacy-policy' },
    { label: 'Terms', to: '/terms-and-conditions' },
    { label: 'Cookies', to: '/cookie-policy' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/92 backdrop-blur-md border-b border-brand-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-brand-900 tracking-tight">
              LegalPadhai<span className="text-gold-500">.ai</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2 text-sm font-semibold text-brand-600">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl transition-colors ${isActive ? 'bg-brand-100 text-brand-900' : 'hover:text-brand-900 hover:bg-brand-50'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/auth" className="hidden sm:block text-sm font-medium text-brand-600 hover:text-brand-900 transition-colors">
                  Sign in
                </Link>
                <Link
                  to="/auth"
                  className="px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
