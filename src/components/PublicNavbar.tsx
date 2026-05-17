import { Link, NavLink } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

interface PublicNavbarProps {
  transparentOnTop?: boolean;
}

export default function PublicNavbar({ transparentOnTop = false }: PublicNavbarProps) {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!transparentOnTop) return;
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    // Trigger once on mount to set initial state correctly
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparentOnTop]);

  const isSolid = !transparentOnTop || isScrolled;

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'About Us', to: '/about' },
    { label: 'Blogs', to: '/blogs' },
    { label: 'Contact Us', to: '/contact' },
    { label: 'Privacy', to: '/privacy-policy' },
    { label: 'Terms', to: '/terms-and-conditions' },
    { label: 'Cookies', to: '/cookie-policy' },
  ];

  return (
    <header className={`${transparentOnTop ? 'fixed' : 'sticky'} top-0 inset-x-0 z-50 transition-all duration-300 ${
      isSolid 
        ? 'bg-white/95 backdrop-blur-md border-b border-brand-200/80 shadow-sm' 
        : 'bg-transparent border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <span className={`text-lg font-bold tracking-tight transition-colors ${isSolid ? 'text-brand-900' : 'text-white'}`}>
              LegalPadhai<span className="text-gold-500">.ai</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2 text-sm font-semibold">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl transition-colors ${
                    isSolid 
                      ? (isActive ? 'bg-brand-100 text-brand-900' : 'text-brand-600 hover:text-brand-900 hover:bg-brand-50')
                      : (isActive ? 'bg-white/15 text-white' : 'text-white/80 hover:text-white hover:bg-white/10')
                  }`
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
                <Link to="/auth" className={`hidden sm:block text-sm font-medium transition-colors ${isSolid ? 'text-brand-600 hover:text-brand-900' : 'text-white/80 hover:text-white'}`}>
                  Sign in
                </Link>
                <Link
                  to="/auth"
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    isSolid 
                      ? 'bg-brand-900 hover:bg-brand-800 text-white'
                      : 'bg-white hover:bg-white/90 text-brand-900'
                  }`}
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
