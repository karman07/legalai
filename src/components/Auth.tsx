import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Scale, Mail, Lock, User, Building2, Phone, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import authService from '../services/authService';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [registrationType, setRegistrationType] = useState<'personal' | 'institute'>('personal');
  const [instituteId, setInstituteId] = useState('');
  const [instituteName, setInstituteName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationAction, setShowVerificationAction] = useState(false);

  const { signIn, signUp, firebaseSignIn, googleSignIn, sendVerificationEmail, verifyResetCode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        await authService.forgotPassword(email);
        setSuccess('A themed recovery link has been sent to your email.');
        setIsForgotPassword(false);
      } else if (isResetPassword) {
        await authService.resetPassword(email, newPassword);
        setSuccess('Password updated successfully! You can now log in.');
        setIsResetPassword(false);
        setIsLogin(true);
      } else if (isLogin) {
        try {
          await signIn(email, password);
          navigate('/dashboard');
        } catch (err: any) {
          if (err.message?.toLowerCase().includes('verify your email')) {
            setShowVerificationAction(true);
          }
          throw err;
        }
      } else {
        const result = await signUp(
          email,
          password,
          fullName,
          registrationType,
          instituteName || undefined,
          instituteId || undefined,
          phoneNumber || undefined
        );
        if (result.requiresLogin) {
          setSuccess(result.message);
          setIsLogin(true);
          setPassword('');
          setFullName('');
          setInstituteName('');
          setInstituteId('');
          setPhoneNumber('');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await authService.verifyEmail(email);
      if (result.isVerified) {
        setSuccess('Email verified successfully! You can now log in.');
        setShowVerificationAction(false);
      } else {
        setError('Email is still not verified. Please check your inbox.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check verification status');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await sendVerificationEmail(email, password);
      setSuccess('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await googleSignIn(idToken);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleActionCode = async () => {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      const oobCode = params.get('oobCode');

      if (mode === 'resetPassword' && oobCode) {
        setLoading(true);
        try {
          const verifiedEmail = await verifyResetCode(oobCode);
          setEmail(verifiedEmail);
          setIsResetPassword(true);
          setIsLogin(false);
          setIsForgotPassword(false);
        } catch (err: any) {
          setError('Invalid or expired verification link. Please request a new one.');
        } finally {
          setLoading(false);
        }
      }
    };

    handleActionCode();
  }, [verifyResetCode]);

  useEffect(() => {
    setError('');
    setSuccess('');
  }, [isLogin]);

  return (
    <div className="min-h-screen bg-brand-900 flex flex-col lg:flex-row">

      {/* ── Left: Brand Panel ────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-2/5 flex-col justify-between p-12 xl:p-16 relative overflow-hidden hero-pattern">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900" />
        <div className="absolute top-1/4 -left-16 w-72 h-72 bg-gold-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-blue-600/6 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 bg-gold-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              LegalPadhai<span className="text-gold-400">.ai</span>
            </span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            AI-Powered<br />
            <span className="text-gold-400">Law Education</span><br />
            for India
          </h1>
          <p className="text-brand-300 text-sm leading-relaxed mb-10 max-w-sm">
            Master Indian law with cutting-edge AI. Access case laws, intelligent assistants,
            personalized study notes, and comprehensive MCQ practice.
          </p>

          <div className="space-y-4">
            {[
              'AI-Powered Chatbot for instant legal queries',
              'Access to Indian Bare Acts and Case Laws',
              'Adaptive MCQs with detailed explanations',
              'Expert feedback on written answers',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-gold-500/15 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-gold-400" />
                </div>
                <span className="text-brand-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-brand-600 text-xs mt-auto pt-12">
          © {new Date().getFullYear()} LegalPadhai.ai · All rights reserved
        </p>
      </div>

      {/* ── Right: Form ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 min-h-screen">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gold-500 rounded-xl mb-3 shadow-lg">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              LegalPadhai<span className="text-gold-400">.ai</span>
            </h1>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-brand-200">

            {/* Header */}
            {isResetPassword ? (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-brand-900">Set New Password</h2>
                <p className="text-brand-500 text-sm mt-1">Your identity has been verified. Enter your new password.</p>
              </div>
            ) : isForgotPassword ? (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-brand-900">Recover Account</h2>
                <p className="text-brand-500 text-sm mt-1">Enter your email and we'll send a recovery link.</p>
              </div>
            ) : (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-brand-900">
                  {isLogin ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-brand-500 text-sm mt-1">
                  {isLogin ? 'Sign in to your LegalPadhai account' : 'Start your legal education journey'}
                </p>
              </div>
            )}

            {/* Tab Toggle */}
            {!isForgotPassword && !isResetPassword && (
              <div className="flex mb-6 bg-brand-100 rounded-xl p-1">
                <button
                  onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    isLogin ? 'bg-white text-brand-900 shadow-sm' : 'text-brand-500 hover:text-brand-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    !isLogin ? 'bg-white text-brand-900 shadow-sm' : 'text-brand-500 hover:text-brand-700'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Sign-up extra fields */}
              {!isLogin && !isForgotPassword && !isResetPassword && (
                <>
                  <div>
                    <label className="label">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                        required={!isLogin} className="input-field pl-10" placeholder="Your full name" />
                    </div>
                  </div>

                  <div>
                    <label className="label">Account Type *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['personal', 'institute'] as const).map((type) => (
                        <button key={type} type="button" onClick={() => setRegistrationType(type)}
                          className={`py-2.5 text-sm font-semibold rounded-lg border capitalize transition-all ${
                            registrationType === type
                              ? 'bg-gold-50 border-gold-400 text-gold-700'
                              : 'bg-white border-brand-200 text-brand-600 hover:border-brand-300'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {registrationType === 'institute' && (
                    <>
                      <div>
                        <label className="label">Institute ID *</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                          <input type="text" value={instituteId} onChange={(e) => setInstituteId(e.target.value)}
                            required={registrationType === 'institute'} className="input-field pl-10" placeholder="Your institute ID" />
                        </div>
                      </div>
                      <div>
                        <label className="label">Institute Name</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                          <input type="text" value={instituteName} onChange={(e) => setInstituteName(e.target.value)}
                            className="input-field pl-10" placeholder="Your institute name" />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="label">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                      <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                        className="input-field pl-10" placeholder="+91 9876543210" />
                    </div>
                  </div>


                </>
              )}

              {/* Reset password field */}
              {isResetPassword ? (
                <div>
                  <label className="label">New Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                    <input type={showPassword ? 'text' : 'password'} value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)} required
                      className="input-field pl-10 pr-10" placeholder="Enter new password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-600 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="label">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      required className="input-field pl-10" placeholder="your.email@example.com" />
                  </div>
                </div>
              )}

              {/* Login password */}
              {isLogin && !isForgotPassword && !isResetPassword && (
                <div>
                  <label className="label">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={(e) => setPassword(e.target.value)} required={isLogin}
                      className="input-field pl-10 pr-10" placeholder="Enter your password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-600 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Sign-up password */}
              {!isLogin && !isForgotPassword && !isResetPassword && (
                <div>
                  <label className="label">Create Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={(e) => setPassword(e.target.value)} required={!isLogin}
                      className="input-field pl-10 pr-10" placeholder="Min. 8 characters" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-600 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                  {showVerificationAction && (
                    <div className="pl-6 space-y-1.5">
                      <button type="button" onClick={handleCheckVerification}
                        className="block text-xs font-semibold text-gold-600 hover:underline text-left">
                        I've verified my email — try again
                      </button>
                      <button type="button" onClick={handleResendVerification}
                        className="block text-xs font-semibold text-gold-600 hover:underline text-left">
                        Resend verification email
                      </button>
                      <button type="button" onClick={() => { setIsForgotPassword(true); setError(''); setSuccess(''); setShowVerificationAction(false); }}
                        className="block text-xs text-brand-400 hover:text-brand-600 hover:underline text-left">
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-700">{success}</p>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gold-500 hover:bg-gold-600 active:bg-gold-800 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : isForgotPassword ? 'Send Recovery Link'
                  : isResetPassword ? 'Update Password'
                  : isLogin ? 'Sign In'
                  : 'Create Account'}
              </button>
            </form>

            {/* Google Sign In */}
            {!isForgotPassword && !isResetPassword && (
              <>
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-brand-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-white text-xs text-brand-400 font-medium">or continue with</span>
                  </div>
                </div>
                <button onClick={handleGoogleSignIn} disabled={loading} type="button"
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-brand-50 text-brand-700 text-sm font-semibold rounded-xl border border-brand-200 hover:border-brand-300 transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </>
            )}

            {/* Footer links */}
            <div className="mt-5 text-center text-sm text-brand-500">
              {!isForgotPassword && !isResetPassword && (
                <>
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                    className="text-gold-600 hover:text-gold-700 font-semibold transition-colors">
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </>
              )}
              {isLogin && !isForgotPassword && !isResetPassword && (
                <div className="mt-3">
                  <button onClick={() => { setIsForgotPassword(true); setError(''); setSuccess(''); }}
                    className="text-xs text-brand-400 hover:text-brand-600 transition-colors">
                    Forgot your password?
                  </button>
                </div>
              )}
              {(isForgotPassword || isResetPassword) && (
                <div className="mt-3">
                  <button
                    onClick={() => { setIsForgotPassword(false); setIsResetPassword(false); setIsLogin(true); setError(''); setSuccess(''); }}
                    className="text-xs text-brand-400 hover:text-brand-600 transition-colors">
                    Back to sign in
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
