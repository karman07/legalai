import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale, BookOpen, HelpCircle, BookMarked, MessageSquare, Brain, Volume2,
  FileText, ArrowRight, Users, Award, LogOut, GraduationCap, Shield,
  Sparkles, Star, Library, ChevronDown, Play, Pause, VolumeX, Volume2 as VolumeOn,
  UserPlus, TrendingUp, CheckCircle2, Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { motion } from 'framer-motion';

const VideoTestimonial = ({ src, name, subtitle, index }: { src: string; name: string; subtitle: string; index: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex flex-col items-center"
    >
      <div
        className="relative w-full rounded-2xl overflow-hidden bg-black cursor-pointer shadow-xl hover:shadow-2xl transition-shadow group"
        style={{ aspectRatio: '9/16' }}
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover"
          playsInline
          loop
          muted
          preload="metadata"
          onEnded={() => setPlaying(false)}
        />

        {/* Play/Pause centre overlay — visible when paused, fades on hover when playing */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 bg-black/30 ${playing ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
          <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
            {playing
              ? <Pause className="w-5 h-5 text-brand-900" />
              : <Play className="w-5 h-5 text-brand-900 ml-1" />
            }
          </div>
        </div>

        {/* Mute toggle — bottom-right */}
        <button
          onClick={toggleMute}
          className="absolute bottom-14 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
        >
          {muted
            ? <VolumeX className="w-4 h-4" />
            : <VolumeOn className="w-4 h-4" />
          }
        </button>

        {/* Bottom gradient + name */}
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        <div className="absolute bottom-3 left-4 right-12 pointer-events-none">
          <p className="text-white font-bold text-sm leading-tight">{name}</p>
          <p className="text-white/70 text-xs">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
};

const FaqItem = ({ question, answer, index }: { question: string, answer: string, index: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="border border-brand-200 rounded-2xl mb-4 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-brand-50 focus:outline-none"
      >
        <span className="text-brand-900 font-bold pr-4">{question}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? 'bg-gold-50 text-gold-600' : 'bg-brand-50 text-brand-500'}`}>
          <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-gold-600' : ''}`} />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 px-6 pb-6' : 'max-h-0 px-6'}`}>
        <p className="text-brand-600 text-sm leading-relaxed">{answer}</p>
      </div>
    </motion.div>
  );
};

export default function LandingPage() {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    window.location.reload();
  };

  const features = [
    {
      icon: MessageSquare, title: 'AI-Powered Legal Assistant',
      description: 'A 24/7 intelligent tutor trained on comprehensive Indian legal material — Bare Acts, case law, and expert commentary — to clarify doctrine and resolve doubts.',
      path: '/chatbot', bg: 'bg-cyan-50', iconColor: 'text-cyan-600',
    },
    {
      icon: Volume2, title: 'Audiobooks',
      description: 'Navigate exact statutory texts with an audiobook mode powered by ultra-realistic neural voices for hands-free learning.',
      path: '/audio', bg: 'bg-amber-50', iconColor: 'text-amber-600',
    },
    {
      icon: Scale, title: 'Case Law Library',
      description: 'A searchable repository of Indian Supreme Court and High Court judgments with integrated text-to-speech for audio consumption.',
      path: '/cases', bg: 'bg-blue-50', iconColor: 'text-blue-600',
    },
    {
      icon: Brain, title: 'Smart Flashcards',
      description: 'Anki-style flashcards built on spaced repetition, optimized for section numbers, landmark cases, and legal maxims.',
      path: '/flashcards', bg: 'bg-emerald-50', iconColor: 'text-emerald-600',
    },
    {
      icon: BookMarked, title: 'Expert-Curated Notes',
      description: 'Structured notes built by legal experts and top-ranking qualifiers to distill overwhelming syllabi into high-yield revision material.',
      path: '/notes', bg: 'bg-violet-50', iconColor: 'text-violet-600',
    },
    {
      icon: BookOpen, title: 'Adaptive MCQ Practice',
      description: 'Curated multiple-choice questions with adaptive difficulty, aligned with judicial and competitive examination patterns across all major law subjects.',
      path: '/mcq', bg: 'bg-teal-50', iconColor: 'text-teal-600',
    },
    {
      icon: FileText, title: 'Mains Answer Evaluation',
      description: 'Submit written answers and receive actionable, structured feedback on legal reasoning, articulation, and structure.',
      path: '/answers', bg: 'bg-pink-50', iconColor: 'text-pink-600',
    },
  ];

  const stats = [
    { icon: BookOpen,      label: 'Study Tools',        value: '8+'   },
    { icon: Scale,         label: 'Law Subjects',        value: '10+'  },
    { icon: MessageSquare, label: 'AI-Powered Support',  value: '24/7' },
    { icon: GraduationCap, label: 'Exam-Focused',        value: '100%' },
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
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]' 
          : 'bg-transparent border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow-sm">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className={`text-[17px] font-bold tracking-tight transition-colors ${
                isScrolled ? 'text-slate-900' : 'text-white'
              }`}>
                LegalPadhai<span className="text-amber-500">.ai</span>
              </span>
            </Link>

            {/* Centre nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {[
                { label: 'Home',       to: '/'       },
                { label: 'About',      to: '/about'  },
                { label: 'Features',   to: '#features' },
                { label: 'Blogs',      to: '/blogs'  },
                { label: 'Contact',    to: '/contact' },
              ].map(({ label, to }) => (
                to.startsWith('#') ? (
                  <a
                    key={to}
                    href={to}
                    className={`relative px-3.5 py-2 text-[13.5px] font-semibold rounded-lg transition-all duration-150 ${
                      isScrolled
                        ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </a>
                ) : (
                  <Link
                    key={to}
                    to={to}
                    className={`relative px-3.5 py-2 text-[13.5px] font-semibold rounded-lg transition-all duration-150 ${
                      isScrolled
                        ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </Link>
                )
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <span className={`hidden md:block text-[13px] truncate max-w-[150px] transition-colors ${
                    isScrolled ? 'text-slate-400' : 'text-white/70'
                  }`}>
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
                    className={`p-2 rounded-xl transition-colors ${
                      isScrolled 
                        ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className={`hidden sm:block px-4 py-2 text-[13.5px] font-semibold rounded-xl transition-colors ${
                      isScrolled
                        ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/auth"
                    className={`px-4 py-2 text-[13.5px] font-bold rounded-xl transition-colors shadow-sm ${
                      isScrolled
                        ? 'bg-slate-900 hover:bg-slate-800 text-white'
                        : 'bg-white hover:bg-gray-100 text-slate-900'
                    }`}
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gold-500/10 border border-gold-500/25 rounded-full mb-8"
          >
            <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
            <span className="text-xs font-bold text-gold-300 tracking-widest uppercase">
              AI-Powered Legal Education for India
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.06] tracking-tight mb-6"
          >
            Master Indian Law<br />
            <span className="text-gold-400">with AI-Powered</span><br />
            Education
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-brand-300 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            The most comprehensive legal education platform. Practice MCQs, explore case laws,
            get expert AI guidance, and ace your judiciary exams.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
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
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10 bg-white/5 rounded-2xl border border-white/10 max-w-3xl mx-auto overflow-hidden"
          >
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
          </motion.div>
        </div>
      </section>

      {/* ── Trust Bar ──────────────────────────────────────── */}
      <section className="py-5 bg-white border-b border-brand-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {[
            { icon: <GraduationCap className="w-4 h-4 text-brand-400" />, label: 'Expert-Curated Content'    },
            { icon: <Scale className="w-4 h-4 text-brand-400" />,         label: 'Judiciary Exam Focused'    },
            { icon: <Zap className="w-4 h-4 text-brand-400" />,           label: 'Available 24 × 7'          },
            { icon: <BookOpen className="w-4 h-4 text-brand-400" />,      label: '10+ Law Subjects Covered'  },
            { icon: <MessageSquare className="w-4 h-4 text-brand-400" />, label: 'AI Study Assistance'       },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm font-medium text-brand-700">
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── About Us Snippet ───────────────────────────────────────── */}
      <section className="py-24 bg-brand-50 border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-badge mb-4 inline-block">About LegalPadhai.ai</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-900 leading-tight mb-6">
                Democratizing <span className="text-gold-600">Legal Education</span> for India
              </h2>
              <p className="text-brand-600 text-lg leading-relaxed mb-6">
                LegalPadhai.ai is an AI-powered legal education platform built for India's growing community of law aspirants — students preparing for judiciary services, UGC NET Law, APO, and competitive legal examinations.
              </p>
              <p className="text-brand-600 text-lg leading-relaxed mb-8">
                We combine AI study assistants, neural-voice audiobooks of Bare Acts, and an extensive case law repository into a single, affordable, accessible platform.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-900 hover:bg-brand-800 text-white font-semibold rounded-xl transition-colors shadow-sm"
              >
                <span>Read Our Full Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="aspect-video bg-brand-900 p-8 sm:p-12 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3" />
                
                <h3 className="text-2xl font-bold text-white mb-6 relative z-10">Our Core Mission</h3>
                <ul className="space-y-4 relative z-10">
                  <li className="flex items-start gap-3 text-brand-200">
                    <Shield className="w-5 h-5 text-gold-400 mt-0.5 flex-shrink-0" />
                    <span>Democratizing AI for Tier 2 & 3 Cities</span>
                  </li>
                  <li className="flex items-start gap-3 text-brand-200">
                    <Scale className="w-5 h-5 text-gold-400 mt-0.5 flex-shrink-0" />
                    <span>Absolute Affordability for Every Student</span>
                  </li>
                  <li className="flex items-start gap-3 text-brand-200">
                    <Users className="w-5 h-5 text-gold-400 mt-0.5 flex-shrink-0" />
                    <span>Inclusivity for Neurodivergent Learners</span>
                  </li>
                  <li className="flex items-start gap-3 text-brand-200">
                    <Brain className="w-5 h-5 text-gold-400 mt-0.5 flex-shrink-0" />
                    <span>Scientific Approach to Learning</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="section-badge">Features</span>
            <h2 className="section-heading">Everything You Need to Succeed</h2>
            <p className="section-subtext">
              A complete toolkit for modern legal education — from AI assistants to curated case law libraries.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <Link
                    to={feature.path}
                    className="group block h-full bg-white border border-brand-200 rounded-2xl p-6 hover:border-gold-400 hover:shadow-elevated transition-all duration-300"
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
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section className="py-24 bg-brand-50 border-t border-brand-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="section-badge">Simple Setup</span>
            <h2 className="section-heading mt-3">Start Learning in 3 Steps</h2>
            <p className="section-subtext">No steep learning curve. You'll be studying in under a minute.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.6%+2rem)] right-[calc(16.6%+2rem)] h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent pointer-events-none" />

            {[
              {
                step: '01', Icon: UserPlus,
                title: 'Create Free Account',
                desc: 'Sign up in 30 seconds with email or Google. No credit card needed, ever.',
                iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
              },
              {
                step: '02', Icon: BookOpen,
                title: 'Choose Your Subject',
                desc: 'Pick from Constitution, BNS, IPC, CPC and more. Start exactly where you need help.',
                iconBg: 'bg-amber-50', iconColor: 'text-amber-600',
              },
              {
                step: '03', Icon: TrendingUp,
                title: 'Learn & Track Progress',
                desc: 'Practice MCQs, listen to Bare Acts, get AI guidance, and watch your rank improve.',
                iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="relative mb-6">
                  <div className={`w-20 h-20 rounded-2xl ${s.iconBg} flex items-center justify-center shadow-sm border border-white`}>
                    <s.Icon className={`w-8 h-8 ${s.iconColor}`} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-brand-900 text-white text-xs font-extrabold flex items-center justify-center shadow">
                    {s.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-brand-900 mb-2">{s.title}</h3>
                <p className="text-sm text-brand-500 leading-relaxed max-w-xs">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ───────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="section-badge">Why LegalPadhai</span>
            <h2 className="section-heading">Built for Serious Law Students</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-8 border border-brand-200 shadow-card hover:shadow-elevated transition-all duration-300"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${b.bg} rounded-xl mb-5`}>
                    <Icon className={`w-6 h-6 ${b.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-brand-900 mb-3">{b.title}</h3>
                  <p className="text-brand-500 leading-relaxed text-sm">{b.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Video Testimonials ─────────────────────────────── */}
      <section className="py-24 bg-white border-t border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="section-badge">Student Reviews</span>
            <h2 className="section-heading">Hear It From Our Students</h2>
            <p className="section-subtext">Real reviews from real students who cracked their exams with LegalPadhai.ai.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <VideoTestimonial
              index={0}
              src="/testimonial_bhavreen.mp4"
              name="Bhavreen Arora"
              subtitle="CLAT Coaching Review"
            />
            <VideoTestimonial
              index={1}
              src="/testimonial_lawex.mp4"
              name="Law Ex Academy"
              subtitle="Chandigarh Campus"
            />
            <VideoTestimonial
              index={2}
              src="/testimonial_parneet.mp4"
              name="Parneet Dhillon"
              subtitle="CLAT 2025 Student"
            />
          </div>
        </div>
      </section>

      {/* ── FAQ Section ──────────────────────────────────────── */}
      <section className="py-24 bg-brand-50 border-t border-brand-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="section-badge">Got Questions?</span>
            <h2 className="section-heading mt-4">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-4">
            {[
              {
                question: "Is there a usage limit on the case law text-to-speech service?",
                answer: "No. The text-to-speech functionality for the case law library is offered without listening caps, daily quotas, or per-judgment restrictions. A subscribed student can stream the entire 25,000-plus judgment repository in audio form for as long as they wish."
              },
              {
                question: "How do the flashcards work?",
                answer: "The platform's flashcards are built on a spaced-repetition engine. Each card is shown to the student at progressively widening intervals calibrated to the moment just before the brain is statistically likely to forget the underlying material. The system continuously adapts to the student's recall accuracy on each card."
              },
              {
                question: "Does the platform support speed reading?",
                answer: "Yes. Every native document on the platform — Bare Acts, case judgments, expert notes, and curated commentary — can be opened in a built-in speed-reading mode. The feature serially presents one or a small cluster of words at a time at a user-controlled pace."
              },
              {
                question: "How frequently is the legal content updated?",
                answer: "The platform maintains a continuous ingestion pipeline that tracks amendments to Bare Acts, newly notified rules, and reportable judgments from the Supreme Court, High Courts, and tribunals on a rolling basis."
              },
              {
                question: "Can the platform be used on mobile devices?",
                answer: "Yes. LegalPadhai.ai is built as a responsive web application that adapts to phones, tablets, and desktops with full feature parity across form factors."
              },
              {
                question: "Can students create their own notes, highlights, and flashcards within the platform?",
                answer: "Yes. Students can highlight passages, attach private annotations, bookmark sections of Bare Acts and judgments, and convert any highlighted excerpt into a personal flashcard that automatically enters the spaced-repetition rotation."
              },
              {
                question: "How is the accuracy of the AI study assistant ensured on legal questions?",
                answer: "The assistant operates on a retrieval-augmented architecture rather than relying purely on a base language model's parametric memory. Every substantive response is grounded in retrieved passages from the platform's curated legal corpus with citations surfaced alongside the answer wherever applicable."
              },
              {
                question: "Is the platform useful for practising advocates, or only for students?",
                answer: "While the primary user base is examination aspirants, the platform's structured access to Bare Acts, case law, and audio-enabled research is increasingly used by junior advocates, law graduates preparing for the AIBE, and academicians."
              },
              {
                question: "Are institutional and bulk subscriptions available for law colleges?",
                answer: "Yes. LegalPadhai.ai offers institutional licences that allow law universities, colleges, and coaching institutions to provide platform access to their entire student body under a single agreement at a substantial discount."
              },
              {
                question: "How is student data handled?",
                answer: "Student data is treated as a custodial responsibility. Personal information is stored on encrypted cloud infrastructure, access is restricted, and the platform does not sell or share user data with third parties. Students retain the right to export or delete their data at any time."
              }
            ].map((faq, index) => (
              <FaqItem key={index} question={faq.question} answer={faq.answer} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section className="py-20 bg-brand-900 relative overflow-hidden hero-pattern">
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-gold-500/8 rounded-full blur-3xl pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gold-500/15 border border-gold-500/25 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-xs font-bold text-gold-300 tracking-wide uppercase">Trusted by Law Students Across India</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Ready to Excel in Law?
          </h2>
          <p className="text-lg text-brand-300 mb-8">
            Start free. No credit card required. Join thousands already cracking judiciary exams.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              to={user ? '/dashboard' : '/auth'}
              className="flex items-center gap-2 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-glow-gold active:scale-[0.98] text-base"
            >
              <span>Start Learning Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-4 bg-white/8 hover:bg-white/14 text-white font-semibold rounded-xl border border-white/20 transition-all text-base"
            >
              See All Features
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-brand-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free to start</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> No credit card needed</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cancel anytime</span>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-brand-950 py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Brand Column */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Scale className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">
                  LegalPadhai<span className="text-gold-400">.ai</span>
                </span>
              </div>
              <p className="text-brand-400 text-sm leading-relaxed mb-6 max-w-md">
                A product by <strong className="text-white">LegaPadhai AI</strong>.<br />
                An AI-powered law education platform dedicated to helping students crack judiciary exams with cutting-edge technology and expert-led curriculum.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://www.linkedin.com/company/legapadhai-ai/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-brand-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="https://www.instagram.com/lawexacademy/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-brand-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>

            {/* Links Column */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-sm text-brand-400 hover:text-gold-400 transition-colors">About Us</Link></li>
                <li><Link to="/blogs" className="text-sm text-brand-400 hover:text-gold-400 transition-colors">Blogs</Link></li>
                <li><Link to="/contact" className="text-sm text-brand-400 hover:text-gold-400 transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy-policy" className="text-sm text-brand-400 hover:text-gold-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-and-conditions" className="text-sm text-brand-400 hover:text-gold-400 transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/cookie-policy" className="text-sm text-brand-400 hover:text-gold-400 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded bg-brand-800/50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <span className="text-sm text-brand-400 leading-relaxed">
                    M/S LEGAL PADHAI<br />
                    3001/2, Pearl City, Sector 104,<br />
                    Mohali, S.A.S Nagar, Punjab - 140307
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-brand-800/50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <span className="text-sm text-brand-400 flex flex-col">
                    <span>+91 6387734370</span>
                    <span>+91 9316110502</span>
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-brand-800/50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <span className="text-sm text-brand-400">
                    info@aiforjob.ai
                  </span>
                </li>
              </ul>
            </div>

          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-brand-500 text-sm">
              © {new Date().getFullYear()} LegaPadhai AI. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-brand-500">
              Made with <span className="text-red-500">♥</span> in India
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

