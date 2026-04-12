import { Link } from 'react-router-dom';
import {
  Scale, BookOpen, HelpCircle, BookMarked, MessageSquare, Brain, Volume2,
  FileText, ArrowRight, Users, Award, LogOut, GraduationCap, Shield,
  Sparkles, Star, Library,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function LandingPage() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    window.location.reload();
  };

  const features = [
    {
      icon: BookOpen, title: 'MCQ Quiz',
      description: 'Practice with thousands of multiple-choice questions covering all subjects of Indian law.',
      path: '/mcq', bg: 'bg-blue-50', iconColor: 'text-blue-600',
    },
    {
      icon: Scale, title: 'Case Laws',
      description: 'Browse comprehensive judgments organized by year, court, and category.',
      path: '/cases', bg: 'bg-gold-50', iconColor: 'text-gold-600',
    },
    {
      icon: BookMarked, title: 'My Notes',
      description: 'Create and organize personal study notes with tags and categories.',
      path: '/notes', bg: 'bg-emerald-50', iconColor: 'text-emerald-600',
    },
    // HIDDEN: Ask a Doubt
    // {
    //   icon: HelpCircle, title: 'Ask a Doubt',
    //   description: 'Get your questions answered by experienced legal educators.',
    //   path: '/doubts', bg: 'bg-red-50', iconColor: 'text-red-600',
    // },
    {
      icon: MessageSquare, title: 'Study Assistant',
      description: 'AI-powered chatbot to help with your legal studies and exam preparation.',
      path: '/chatbot', bg: 'bg-cyan-50', iconColor: 'text-cyan-600',
    },
    // HIDDEN: Legal Expert Bot
    // {
    //   icon: Brain, title: 'Legal Expert Bot',
    //   description: 'Advanced AI assistant for complex legal analysis and case discussions.',
    //   path: '/expert', bg: 'bg-violet-50', iconColor: 'text-violet-600',
    // },
    {
      icon: Volume2, title: 'Bare Act Reader',
      description: 'Read and listen to Indian laws with audio narration and simplified explanations.',
      path: '/audio', bg: 'bg-gold-50', iconColor: 'text-gold-600',
    },
    {
      icon: FileText, title: 'Answer Evaluation',
      description: 'Submit written answers and get detailed AI feedback from educators.',
      path: '/answers', bg: 'bg-pink-50', iconColor: 'text-pink-600',
    },
    // HIDDEN: My Library
    // {
    //   icon: Library, title: 'My Library',
    //   description: 'A curated space to save case laws, notes, and study resources.',
    //   path: '/library', bg: 'bg-teal-50', iconColor: 'text-teal-600',
    // },
  ];

  const stats = [
    { icon: Users,    label: 'Active Students',    value: '10,000+' },
    { icon: BookOpen, label: 'Practice Questions', value: '50,000+' },
    { icon: Scale,    label: 'Case Laws',          value: '25,000+' },
    { icon: Award,    label: 'Success Rate',       value: '95%'     },
  ];

  const benefits = [
    {
      icon: Sparkles, iconColor: 'text-violet-500', bg: 'bg-violet-50',
      title: 'AI-Powered Learning',
      description: 'Leverage advanced AI for personalized learning, instant doubt resolution, and intelligent recommendations tailored to your exam goals.',
    },
    {
      icon: GraduationCap, iconColor: 'text-emerald-500', bg: 'bg-emerald-50',
      title: 'Expert-Led Content',
      description: 'Learn from content curated by experienced legal educators. Get personalized feedback on your answers and guidance from domain experts.',
    },
    {
      icon: Shield, iconColor: 'text-gold-600', bg: 'bg-gold-50',
      title: 'Proven Results',
      description: 'Join thousands of successful law students who have cracked judiciary exams and bar council tests using our comprehensive platform.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow-sm">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="text-[17px] font-bold text-slate-900 tracking-tight">
                LegalPadhai<span className="text-amber-500">.ai</span>
              </span>
            </Link>

            {/* Centre nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {[
                { label: 'Home', to: '/' },
                { label: 'Blogs', to: '/blogs' },
                { label: 'Privacy', to: '/privacy-policy' },
                { label: 'Terms', to: '/terms-and-conditions' },
                { label: 'Cookies', to: '/cookie-policy' },
              ].map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="relative px-3.5 py-2 text-[13.5px] font-semibold text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-all duration-150"
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <span className="hidden md:block text-[13px] text-slate-400 truncate max-w-[150px]">
                    {user.email}
                  </span>
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[13.5px] font-bold rounded-xl transition-colors shadow-sm"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="hidden sm:block px-4 py-2 text-[13.5px] font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/auth"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[13.5px] font-bold rounded-xl transition-colors shadow-sm"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="min-h-screen bg-brand-900 pt-16 flex items-center relative overflow-hidden hero-pattern">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/5 w-80 h-80 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gold-500/10 border border-gold-500/25 rounded-full mb-8">
            <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
            <span className="text-xs font-bold text-gold-300 tracking-widest uppercase">
              India's #1 AI Law Education Platform
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.06] tracking-tight mb-6">
            Master Indian Law<br />
            <span className="text-gold-400">with AI-Powered</span><br />
            Education
          </h1>

          <p className="text-lg sm:text-xl text-brand-300 max-w-2xl mx-auto leading-relaxed mb-10">
            The most comprehensive legal education platform. Practice MCQs, explore case laws,
            get expert AI guidance, and ace your judiciary exams.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              to={user ? '/dashboard' : '/auth'}
              className="flex items-center gap-2 px-8 py-3.5 bg-gold-500 hover:bg-gold-400 active:bg-gold-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-glow-gold active:scale-[0.98] text-base"
            >
              <span>Start Learning Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-3.5 bg-white/8 hover:bg-white/14 text-white font-semibold rounded-xl border border-white/20 transition-all text-base"
            >
              Explore Features
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10 bg-white/5 rounded-2xl border border-white/10 max-w-3xl mx-auto overflow-hidden">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="px-6 py-5 text-center">
                  <Icon className="w-5 h-5 text-gold-400 mx-auto mb-2" />
                  <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                  <div className="text-xs text-brand-400 mt-0.5">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge">Features</span>
            <h2 className="section-heading">Everything You Need to Succeed</h2>
            <p className="section-subtext">
              A complete toolkit for modern legal education — from AI assistants to curated case law libraries.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={idx}
                  to={feature.path}
                  className="group bg-white border border-brand-200 rounded-2xl p-6 hover:border-gold-400 hover:shadow-elevated transition-all duration-300"
                >
                  <div className={`inline-flex items-center justify-center w-11 h-11 ${feature.bg} rounded-xl mb-4`}>
                    <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-sm font-bold text-brand-900 mb-2 group-hover:text-gold-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-brand-500 leading-relaxed mb-4">{feature.description}</p>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${feature.iconColor} group-hover:gap-2 transition-all duration-200`}>
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Benefits ───────────────────────────────────────── */}
      <section className="py-24 bg-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge">Why LegalPadhai</span>
            <h2 className="section-heading">Built for Serious Law Students</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-8 border border-brand-200 shadow-card hover:shadow-elevated transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${b.bg} rounded-xl mb-5`}>
                    <Icon className={`w-6 h-6 ${b.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-brand-900 mb-3">{b.title}</h3>
                  <p className="text-brand-500 leading-relaxed text-sm">{b.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section className="py-20 bg-brand-900 relative overflow-hidden hero-pattern">
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-gold-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Ready to Excel in Law?
          </h2>
          <p className="text-lg text-brand-300 mb-8">
            Join 10,000+ law students already using LegalPadhai.ai to prepare smarter.
          </p>
          <Link
            to={user ? '/dashboard' : '/auth'}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-glow-gold active:scale-[0.98] text-base"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-brand-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="w-7 h-7 bg-gold-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Scale className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-white">
              LegalPadhai<span className="text-gold-400">.ai</span>
            </span>
          </div>
          <p className="text-brand-500 text-xs max-w-xs mx-auto mb-3">
            India's first AI-empowered law education platform. Helping students crack judiciary exams since 2026.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-4 text-xs">
            <Link to="/blogs" className="text-brand-400 hover:text-gold-400 transition-colors">Blogs</Link>
            <Link to="/privacy-policy" className="text-brand-400 hover:text-gold-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="text-brand-400 hover:text-gold-400 transition-colors">Terms & Conditions</Link>
            <Link to="/cookie-policy" className="text-brand-400 hover:text-gold-400 transition-colors">Cookie Policy</Link>
          </div>
          <p className="text-brand-600 text-xs">
            © {new Date().getFullYear()} LegalPadhai.ai · All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}

