import { motion } from 'framer-motion';
import { Target, Users, Eye, Scale, ArrowRight, ShieldCheck, Heart, Zap } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import { Link } from 'react-router-dom';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-50">
      <PublicNavbar transparentOnTop={true} />
      
      <div className="flex-1 pb-20">
        {/* ── Hero Section ────────────────────────────────────────── */}
        <section className="bg-brand-900 pt-36 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-sm font-bold tracking-wider uppercase mb-6">
                Our Story
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                Democratizing <span className="text-gold-400">Legal Education</span> for India
              </h1>
              <p className="text-lg sm:text-xl text-brand-300 leading-relaxed max-w-3xl mx-auto">
                LegalPadhai.ai is an AI-first legal education platform built for India's vast and underserved community of law aspirants — students preparing for judiciary services, UGC NET Law, APO, and competitive legal examinations.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── The Problem & Mission ─────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
          <div className="bg-white rounded-3xl shadow-xl border border-brand-100 p-8 sm:p-12 md:p-16 mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-50 text-red-600 rounded-xl mb-6">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold text-brand-900 mb-6">The Problem</h2>
                <p className="text-brand-600 leading-relaxed text-lg mb-6">
                  Legal education in India is structurally inequitable. Aspirants from Tier 2 and Tier 3 cities have historically been locked out of the coaching ecosystems, libraries, and faculty access concentrated in metropolitan hubs like Delhi, Mumbai, and Bangalore.
                </p>
                <p className="text-brand-600 leading-relaxed text-lg">
                  The result is a talent pool whose preparation quality is determined by geography and household income rather than ability or effort. Simultaneously, differently-abled and neurodivergent students — those with visual impairments, ADHD, or dyslexia — find traditional dense legal texts cognitively inaccessible, with no mainstream solution serving their needs.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-brand-900 mb-8">Mission and Core Values</h2>
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-brand-900 mb-2">Democratizing AI for Tier 2 & 3 Cities</h3>
                      <p className="text-brand-600 leading-relaxed">Committed to bridging the educational divide by delivering the same AI-powered study tools and legal databases to students in smaller cities that are available at elite Tier 1 institutions.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-brand-900 mb-2">Absolute Affordability</h3>
                      <p className="text-brand-600 leading-relaxed">High-quality exam preparation should not be a luxury good. Our model is engineered to ensure that financial constraints never prevent a dedicated student from realizing their potential.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-brand-900 mb-2">Inclusivity for Neurodivergent Learners</h3>
                      <p className="text-brand-600 leading-relaxed">Human-quality neural audiobooks and distraction-minimized interface designed with intentional empathy for students with visual impairments, ADHD, dyslexia, and learning differences.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-brand-900 mb-2">Scientific Approach to Learning</h3>
                      <p className="text-brand-600 leading-relaxed">We reject rote memorization. We embed evidence-based frameworks — active recall and spaced repetition — directly into our product so students retain more in less time.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Founding Team ─────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="text-center mb-16">
            <span className="section-badge">Leadership</span>
            <h2 className="section-heading mt-4">Founding Team</h2>
            <p className="section-subtext">
              Uniting deep doctrinal scholarship, product engineering, elite legal-academic credentials, and policy-grade strategic acumen.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-8 border border-brand-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-2xl font-bold text-brand-900 mb-2">Harshdeep Singh Dahiya</h3>
              <p className="text-gold-600 font-semibold mb-6">Co-Founder, Growth & Institutional Partnerships</p>
              <div className="text-brand-600 space-y-4 leading-relaxed">
                <p>
                  Harshdeep stewards the growth, market strategy, and institutional partnership functions of LegalPadhai.ai, with a mandate to embed the platform structurally within India's legal education ecosystem. A graduate of the National Law School of India University (NLSIU), Bangalore, he brings institutional fluency, intellectual rigour, and an expansive alumni network.
                </p>
                <p>
                  Working professionally as a legal and policy consultant, he carries that discipline into the company's strategic planning. His principal focus is institutional onboarding — working in direct partnership with law universities and academic administrations to integrate the platform into their curricular frameworks.
                </p>
                <p>
                  Grounded in Hindu philosophy and a disciplined meditation practice, Harshdeep's leadership style pairs commercial ambition with composure — ensuring growth velocity is matched by integrity.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl p-8 border border-brand-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-2xl font-bold text-brand-900 mb-2">Dronvir Sirohi</h3>
              <p className="text-gold-600 font-semibold mb-6">Co-Founder, Legal and Technical Lead</p>
              <div className="text-brand-600 space-y-4 leading-relaxed">
                <p>
                  Dronvir sits at the rare intersection of doctrinal legal scholarship and applied artificial intelligence engineering. With a B.A. LL.B. (magna cum laude) and an LL.M. concentrated on bail and remand jurisprudence, his academic breadth informs both the substance and the pedagogy embedded in the platform.
                </p>
                <p>
                  On the technical side, Dronvir directs the engineering and product architecture. He designs and operationalises the platform's core AI systems, including RAG pipelines trained on 200,000+ pages of Indian legal material, structural digitisation of Bare Acts via OCR, and the neural text-to-speech infrastructure.
                </p>
                <p>
                  His ambition is to translate his own experience of preparing for law in non-metropolitan India into a product that dissolves the geographic and economic barriers separating aspirants from world-class preparation.
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-brand-900 rounded-2xl p-8 sm:p-12 text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Complementary Strengths</h3>
            <p className="text-brand-300 leading-relaxed max-w-4xl mx-auto">
              The founding team unites deep doctrinal scholarship and product engineering on one side with elite legal-academic credentials and policy-grade strategic acumen on the other. This pairing — a scholar-engineer extending his expertise into AI infrastructure, and an NLSIU-trained consultant directing institutional reach — reflects the dual capabilities required to build a credible AI-first legal education platform for India's expansive and historically underserved aspirant base.
            </p>
          </motion.div>
        </section>

        {/* ── Future Vision ─────────────────────────────────────── */}
        <section className="bg-white py-24 border-t border-brand-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="section-badge">Looking Ahead</span>
              <h2 className="section-heading mt-4">Future Vision</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 bg-brand-50 rounded-2xl border border-brand-100"
              >
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                  <Scale className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-brand-900 mb-4">Cost Discipline as a Strategic Imperative</h3>
                <p className="text-brand-600 leading-relaxed">
                  Low cost is not merely a pricing strategy but the structural condition that makes democratisation operationally real. We aim to drive unit economics to a point where a permanent free tier covering core libraries can be sustained indefinitely for the lowest-income segments.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-8 bg-brand-50 rounded-2xl border border-brand-100"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-brand-900 mb-4">Scaling Reach Across India</h3>
                <p className="text-brand-600 leading-relaxed">
                  Over the next three years, we aim to evolve into the default digital companion for legal aspirants across India, covering every state judiciary examination, the AIBE, UGC NET Law, and CLAT-PG entrance preparation.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="p-8 bg-brand-50 rounded-2xl border border-brand-100"
              >
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-brand-900 mb-4">Linguistic & Accessibility Expansion</h3>
                <p className="text-brand-600 leading-relaxed">
                  We will progressively extend into Hindi, Punjabi, Marathi, Tamil, Telugu, Bengali, Kannada, and Gujarati. We treat accessibility not as a regulatory checkbox but as the core experience that defines the product.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="p-8 bg-brand-50 rounded-2xl border border-brand-100"
              >
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-brand-900 mb-4">Deepening the Career Arc</h3>
                <p className="text-brand-600 leading-relaxed">
                  Our longer-term vision is to accompany a law student through their entire career — from entrances through graduation to early-career practitioner tools, including AI-driven moot courts and drafting assistants.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-brand-950 py-16 border-t border-white/10 mt-auto">
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
                India's first AI-empowered law education platform. We are dedicated to helping law students crack judiciary exams with cutting-edge technology and expert-led curriculum.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://www.linkedin.com/company/legapadhai-ai/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-brand-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
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
                    <svg className="w-3 h-3 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
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
