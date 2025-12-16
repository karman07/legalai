import { Link } from 'react-router-dom';
import { Scale, BookOpen, HelpCircle, BookMarked, MessageSquare, Brain, Volume2, FileText, ArrowRight, Users, Award, Zap, LogOut } from 'lucide-react';
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
      icon: BookOpen,
      title: 'MCQ Quiz',
      description: 'Practice with thousands of multiple-choice questions across all subjects of Indian law',
      path: '/mcq',
      color: 'bg-blue-500',
    },
    {
      icon: Scale,
      title: 'Case Laws Database',
      description: 'Browse comprehensive collection of judgments organized by year, court, and category',
      path: '/cases',
      color: 'bg-amber-600',
    },
    {
      icon: BookMarked,
      title: 'My Notes',
      description: 'Create and organize personal study notes with tags and categories',
      path: '/notes',
      color: 'bg-green-500',
    },
    {
      icon: HelpCircle,
      title: 'Ask a Doubt',
      description: 'Get your questions answered by experienced legal educators',
      path: '/doubts',
      color: 'bg-red-500',
    },
    {
      icon: MessageSquare,
      title: 'Study Assistant',
      description: 'AI-powered chatbot to help with your legal studies and exam preparation',
      path: '/chatbot',
      color: 'bg-cyan-500',
    },
    {
      icon: Brain,
      title: 'Legal Expert Bot',
      description: 'Advanced AI assistant for complex legal analysis and case discussions',
      path: '/expert',
      color: 'bg-violet-500',
    },
    {
      icon: Volume2,
      title: 'Immersive Bare Act Reader',
      description: 'Read and listen to Indian laws in government and simplified language with audio narration',
      path: '/audio',
      color: 'bg-orange-500',
    },
    {
      icon: FileText,
      title: 'Answer Evaluation',
      description: 'Submit written answers and get detailed feedback from educators',
      path: '/answers',
      color: 'bg-pink-500',
    },
  ];

  const stats = [
    { icon: Users, label: 'Active Students', value: '10,000+' },
    { icon: BookOpen, label: 'Practice Questions', value: '50,000+' },
    { icon: Scale, label: 'Case Laws', value: '25,000+' },
    { icon: Award, label: 'Success Rate', value: '95%' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Scale className="w-8 h-8 text-amber-600" />
              <div className="ml-2">
                <span className="text-xl font-bold text-slate-900">LegalPadhai.ai</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-slate-700">{user.email}</span>
                  <Link
                    to="/dashboard"
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors shadow-md"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth"
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors shadow-md"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500 rounded-full mb-6 shadow-2xl">
            <Scale className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            India's First AI Empowered
            <span className="text-amber-400"> Law Education Platform</span>
          </h1>

          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            The most comprehensive legal education platform in India. Practice MCQs, explore case laws,
            get expert guidance, and ace your law exams with cutting-edge technology.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <Link
              to={user ? "/dashboard" : "/auth"}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <span>Start Learning Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="#features"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all border-2 border-white/20"
            >
              Explore Features
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Comprehensive Learning Tools</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to excel in your legal education journey, all in one platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={idx}
                  to={feature.path}
                  className="group bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-amber-500 hover:shadow-2xl transition-all transform hover:-translate-y-2"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 ${feature.color} rounded-lg mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 mb-4 leading-relaxed">{feature.description}</p>
                  <div className="flex items-center text-amber-600 font-semibold group-hover:translate-x-2 transition-transform">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-amber-200">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-lg mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">AI-Powered</h3>
              <p className="text-slate-600 leading-relaxed">
                Leverage advanced AI technology for personalized learning, instant doubt resolution,
                and intelligent content recommendations.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-amber-200">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Expert Guidance</h3>
              <p className="text-slate-600 leading-relaxed">
                Learn from experienced legal educators and get personalized feedback on your
                answers and understanding.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-amber-200">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500 rounded-lg mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Proven Results</h3>
              <p className="text-slate-600 leading-relaxed">
                Join thousands of successful law students who have aced their exams using our
                comprehensive platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Excel in Law?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join LegalEdu India today and transform your legal education journey
          </p>
          <Link
            to={user ? "/dashboard" : "/auth"}
            className="inline-flex items-center space-x-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Scale className="w-8 h-8 text-amber-500" />
            <span className="ml-2 text-xl font-bold text-white">LegalEdu India</span>
          </div>
          <p className="text-sm">
            © 2025 LegalEdu India. Empowering legal education across the nation.
          </p>
        </div>
      </footer>
    </div>
  );
}
