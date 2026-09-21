import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';

export default function Auth({ onLogin, initialMode = 'login', onBackToHome }) {
  const [isRegister, setIsRegister] = useState(initialMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [requestTrainer, setRequestTrainer] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  useEffect(() => {
    setIsRegister(initialMode === 'signup');
  }, [initialMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (isRegister) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    }

    setLoading(true);

    try {
      let userData;
      if (isRegister) {
        // Real Signup with Firebase Auth SDK & profile creation
        userData = await authService.signup(name, email, password, requestTrainer);
        if (requestTrainer) {
          setInfoMsg('Account created as Trainee. Trainer access requested — pending Admin approval.');
        }
      } else {
        // Real Login via Firebase Auth & backend GET /api/auth/me
        userData = await authService.login(email, password);
      }

      onLogin(userData);
    } catch (err) {
      console.error("Authentication error:", err);
      const msg = err.message || 'Authentication failed. Please check your credentials and backend server connection.';
      setError(msg.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md bg-[#13111c]/90 backdrop-blur-xl border border-[#27213b] rounded-3xl p-8 shadow-2xl shadow-purple-950/40 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Back to Home Button */}
        {onBackToHome && (
          <button
            type="button"
            onClick={onBackToHome}
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
        )}

        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/30 mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            ResQVerse <Sparkles className="w-4 h-4 text-purple-400" />
          </h1>
          <p className="text-xs font-medium text-purple-300 uppercase tracking-widest mt-1">
            {isRegister ? 'Create Trainee Account' : 'Unified Secure Portal Access'}
          </p>
        </div>

        {/* Notification Banners */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {infoMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-[#0a0910] border border-[#27213b] rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#0a0910] border border-[#27213b] rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0a0910] border border-[#27213b] rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0a0910] border border-[#27213b] rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Request Trainer Access Checkbox */}
              <div className="p-3.5 rounded-xl bg-[#0a0910] border border-[#27213b] flex items-start gap-3">
                <input
                  type="checkbox"
                  id="trainerReq"
                  checked={requestTrainer}
                  onChange={(e) => setRequestTrainer(e.target.checked)}
                  className="mt-0.5 rounded accent-purple-600 cursor-pointer"
                />
                <label htmlFor="trainerReq" className="text-xs text-slate-300 cursor-pointer leading-relaxed">
                  <strong className="text-white block">Request Trainer Access</strong>
                  Requires Admin approval before your role updates to Trainer.
                </label>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In to ResQVerse'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Toggle Login ↔ Signup */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); setInfoMsg(''); }}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            {isRegister ? 'Already registered? Return to Login' : "Need an account? Sign up as Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

