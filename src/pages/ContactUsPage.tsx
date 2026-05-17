import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-50">
      <PublicNavbar />
      <div className="flex-1 pt-12 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="section-badge">Get In Touch</span>
          <h1 className="section-heading mt-2">Contact Us</h1>
          <p className="section-subtext">
            Have questions about LegalPadhai AI? We're here to help. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-white rounded-2xl p-8 border border-brand-200 shadow-card hover:shadow-elevated transition-shadow">
              <div className="w-12 h-12 bg-gold-50 text-gold-600 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-brand-900 mb-2">Our Office</h3>
              <p className="text-brand-500 leading-relaxed text-sm">
                <strong>M/S LEGAL PADHAI</strong><br />
                3001/2, Pearl City, Sector 104,<br />
                Mohali, S.A.S Nagar – Punjab, 140307<br />
                <br />
                <strong>Registration Details:</strong><br />
                Reg No: 0227 of 2026-2027<br />
                Date: 24 Apr, 2026<br />
                Duration: AT WILL<br />
                Authority: Registrar of Firms & Societies, Punjab, Chandigarh<br />
                PIN: 260412297 | App Id: 2604424022
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-brand-200 shadow-card hover:shadow-elevated transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-brand-900 mb-2">Call Us</h3>
              <p className="text-brand-500 leading-relaxed text-sm">
                <strong>Dronvir Sirohi:</strong> +91 6387734370<br />
                <strong>Harshdeep Singh Dahiya:</strong> +91 9316110502<br />
                Mon-Fri from 9am to 6pm
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-brand-200 shadow-card hover:shadow-elevated transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-brand-900 mb-2">Email Us</h3>
              <p className="text-brand-500 leading-relaxed">
                info@aiforjob.ai
              </p>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl p-8 sm:p-12 border border-brand-200 shadow-card">
              <h2 className="text-2xl font-bold text-brand-900 mb-8">Send us a Message</h2>
              
              {status === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center"
                >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-800 mb-2">Message Sent Successfully!</h3>
                  <p className="text-emerald-600">Thank you for reaching out. Our team will get back to you shortly.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="label">Your Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                        className="input-field" 
                        placeholder="John Doe" 
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="label">Email Address</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        className="input-field" 
                        placeholder="john@example.com" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="label">Subject</label>
                    <input 
                      type="text" 
                      id="subject" 
                      name="subject" 
                      value={formData.subject} 
                      onChange={handleChange} 
                      required 
                      className="input-field" 
                      placeholder="How can we help you?" 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="label">Message</label>
                    <textarea 
                      id="message" 
                      name="message" 
                      rows={5} 
                      value={formData.message} 
                      onChange={handleChange} 
                      required 
                      className="input-field resize-none" 
                      placeholder="Write your message here..." 
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={status === 'submitting'}
                    className="w-full btn-primary py-3 text-base flex justify-center items-center gap-2 disabled:opacity-70"
                  >
                    {status === 'submitting' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
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
