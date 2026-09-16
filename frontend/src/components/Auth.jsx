import React, { useState } from 'react';
import { Shield, Sparkles, User, Lock, Mail, Building, ArrowRight } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science Lab');

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = {
      name: name || (role === 'admin' ? 'Administrator' : 'Manav Vartak'),
      email: email || (role === 'admin' ? 'admin@ResQVerse.vr' : 'user@ResQVerse.vr'),
      role: role,
      department: department
    };
    onLogin(userData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md bg-[#13111c]/90 backdrop-blur-xl border border-[#27213b] rounded-3xl p-8 shadow-2xl shadow-purple-950/40 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/30 mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            ResQVerse <Sparkles className="w-4 h-4 text-purple-400" />
          </h1>
          <p className="text-xs font-medium text-purple-300 uppercase tracking-widest mt-1">VR Disaster Training & AI</p>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#0a0910] rounded-2xl border border-[#27213b] mb-6">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`py-2.5 text-xs font-semibold rounded-xl transition-all ${
              role === 'student'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Student Portal
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`py-2.5 text-xs font-semibold rounded-xl transition-all ${
              role === 'admin'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Admin Portal
          </button>
        </div>

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
                  placeholder=""
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
                placeholder={role === 'admin' ? 'admin@ResQVerse.vr' : ''}
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
                placeholder=""
                className="w-full bg-[#0a0910] border border-[#27213b] rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {isRegister && role === 'student' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Department / Class</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Computer Science Lab"
                  className="w-full bg-[#0a0910] border border-[#27213b] rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 group"
          >
            <span>{isRegister ? 'Create Account' : `Login as ${role === 'admin' ? 'Admin' : 'Student'}`}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            {isRegister ? 'Already have an account? Login here' : "Don't have an account? Register now"}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-[#27213b] text-center">
          <p className="text-[11px] text-slate-500">
            Demo Mode: Click login directly to explore simulated VR workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
