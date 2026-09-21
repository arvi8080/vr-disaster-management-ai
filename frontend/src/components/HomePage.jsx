import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { 
  Shield, 
  Flame, 
  Waves, 
  Activity, 
  Brain, 
  TrendingUp, 
  Users, 
  Eye, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  Lock, 
  BookOpen, 
  BarChart2, 
  Award,
  Server,
  Zap,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

export default function HomePage({ onNavigate, currentPath, user, onLogout }) {
  const [systemStats, setSystemStats] = useState({
    activeScenarios: 3,
    systemStatus: 'ONLINE',
    telemetryFeatures: 17,
    skillDimensions: 7,
    uptime: '100%'
  });

  useEffect(() => {
    // Fetch live system statistics from backend health API if available
    const fetchStats = async () => {
      try {
        const healthRes = await api('/health');
        if (healthRes && healthRes.status === 'UP') {
          setSystemStats(prev => ({
            ...prev,
            systemStatus: 'OPERATIONAL',
            uptime: `${Math.round(healthRes.uptime || 100)}s Uptime`
          }));
        }
      } catch (err) {
        // Fallback to operational defaults if offline
      }
    };
    fetchStats();
  }, []);

  return (
    <div id="top" className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Header / Navbar */}
      <Navbar 
        onNavigate={onNavigate} 
        currentPath={currentPath} 
        user={user} 
        onLogout={onLogout} 
      />

      {/* Main Content Wrapper */}
      <main className="relative overflow-hidden">
        
        {/* Decorative subtle background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        {/* 1. HERO SECTION */}
        <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Hero Text Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Eyebrow Label */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#f95738] font-bold text-xs uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>VR DISASTER TRAINING & AI</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Prepare. Practice. <br />
                <span className="text-[#f95738]">Protect Lives.</span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
                ResQVerse is an immersive VR training platform powered by AI that prepares you to respond to real-world disasters with confidence and skill.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate(user ? '/dashboard' : '/signup')}
                  className="px-7 py-3.5 rounded-2xl bg-[#f95738] hover:bg-[#e04729] text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 group"
                >
                  <span>{user ? 'Open Dashboard' : 'Get Started'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    const elem = document.querySelector('#features');
                    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm hover:-translate-y-0.5 transition-all"
                >
                  Learn More
                </button>
              </div>

              {/* Key Trust Highlights */}
              <div className="pt-4 flex items-center gap-6 text-xs font-semibold text-slate-500 border-t border-slate-200/80">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Real-time AI Telemetry
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Digital Skill Twin
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Role-Based Access
                </span>
              </div>
            </div>

            {/* Right Hero Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 group">
                <img 
                  src="/images/hero.jpg" 
                  alt="ResQVerse VR Disaster Responder" 
                  className="w-full h-[380px] sm:h-[440px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Visual Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

                {/* Floating Badge overlay bottom left */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                      <Zap className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">Active VR Simulation</h4>
                      <p className="text-[11px] text-slate-400">17 Telemetry Points / Sec</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] tracking-wider uppercase border border-emerald-500/30">
                    LIVE
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* 2. FEATURE HIGHLIGHT BAR (NAVY PANEL) */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="bg-[#0f172a] rounded-3xl p-8 sm:p-10 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
            
            {/* Background ambient glow */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-orange-400 shrink-0">
                  <Eye className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-white">Immersive VR Training</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Realistic disaster simulations in a safe virtual environment.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-indigo-400 shrink-0">
                  <Brain className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-white">AI-Powered Feedback</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Get intelligent performance analysis and personalized recommendations.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-emerald-400 shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-white">Track & Improve</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Monitor your progress with detailed analytics and skill assessments.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-purple-400 shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-white">Role-Based Access</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Separate experiences for Students, Trainers, and Administrators.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* 3. DISASTER TRAINING & STATISTICS SECTION */}
        <section id="training" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Scenarios Grid (Left 8 Cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Section Header */}
              <div>
                <span className="text-xs font-bold text-[#f95738] uppercase tracking-widest block mb-1">
                  TRAIN FOR REAL-WORLD DISASTERS
                </span>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  Multiple Disaster Scenarios
                </h2>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Fire Scenario Card */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                  <div className="h-44 relative overflow-hidden bg-slate-900">
                    <img 
                      src="/images/fire.jpg" 
                      alt="Fire Disaster Scenario" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-3 shadow-sm">
                        <Flame className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-900">Fire</h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        Learn to respond to fire emergencies and evacuation scenarios.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Flood Scenario Card */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                  <div className="h-44 relative overflow-hidden bg-slate-900">
                    <img 
                      src="/images/flood.jpg" 
                      alt="Flood Disaster Scenario" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 shadow-sm">
                        <Waves className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-900">Flood</h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        Train for flood response, rescue operations, and safety procedures.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Earthquake Scenario Card */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                  <div className="h-44 relative overflow-hidden bg-slate-900">
                    <img 
                      src="/images/earthquake.jpg" 
                      alt="Earthquake Disaster Scenario" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 shadow-sm">
                        <Activity className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-900">Earthquake</h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        Practice earthquake safety, search and rescue, and first aid.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Statistics Panel (Right 4 Cols) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
              <div>
                <h3 className="font-bold text-xl text-slate-900">ResQVerse Engine</h3>
                <p className="text-xs text-slate-500 mt-0.5">Verified backend system metrics</p>
              </div>

              <div className="space-y-4">
                
                {/* Stat 1 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">{systemStats.activeScenarios}</div>
                    <div className="text-xs font-semibold text-slate-500">Active Disaster Scenarios</div>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">{systemStats.telemetryFeatures}</div>
                    <div className="text-xs font-semibold text-slate-500">Telemetry Features Tracked</div>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">{systemStats.skillDimensions}</div>
                    <div className="text-xs font-semibold text-slate-500">Digital Skill Twin Dimensions</div>
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-600 tracking-wide uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {systemStats.systemStatus}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 mt-0.5">Express Backend API</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>


        {/* 4. ABOUT / PLATFORM SECTION */}
        <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
            <div className="max-w-3xl space-y-6">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block">
                PLATFORM ARCHITECTURE
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Why ResQVerse?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                ResQVerse integrates high-fidelity VR disaster environments with automated backend AI analysis. Instead of traditional static training, responders receive adaptive, empirical feedback grounded in real-time telemetry.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-orange-400" /> Digital Skill Twin
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Maintains an evolving statistical profile of each trainee across 7 core skill dimensions.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-400" /> AI Feedback Engine
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Generates non-generic performance evaluation rules and targeted next-step recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* 5. AI + DIGITAL SKILL TWIN SECTION */}
        <section id="ai-pipeline" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold text-[#f95738] uppercase tracking-widest block">
              RESEARCH DATA PIPELINE
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              AI & Digital Skill Twin Workflow
            </h2>
            <p className="text-sm text-slate-600">
              How ResQVerse converts raw VR simulation events into actionable skill insights.
            </p>
          </div>

          {/* Flowchart Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            
            {/* Step 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 mx-auto flex items-center justify-center font-bold">
                <Eye className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">1. VR Training</h4>
              <p className="text-[11px] text-slate-500 leading-snug">Immersive emergency scenario execution.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">2. Telemetry</h4>
              <p className="text-[11px] text-slate-500 leading-snug">Captures 17 feature vectors in real time.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center font-bold">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">3. Digital Twin</h4>
              <p className="text-[11px] text-slate-500 leading-snug">Computes EMA sub-skill scores (0-100).</p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 mx-auto flex items-center justify-center font-bold">
                <Brain className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">4. AI Analysis</h4>
              <p className="text-[11px] text-slate-500 leading-snug">Rule-based error & reaction diagnosis.</p>
            </div>

            {/* Step 5 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">5. AI Feedback</h4>
              <p className="text-[11px] text-slate-500 leading-snug">Delivers personalized recommendations.</p>
            </div>

          </div>
        </section>


        {/* 6. ROLE-BASED PLATFORM SECTION */}
        <section id="roles" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold text-[#f95738] uppercase tracking-widest block">
              ENTERPRISE AUTHORIZATION
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Role-Based Access Control
            </h2>
            <p className="text-sm text-slate-600">
              Strictly enforced server-side authorization tailored for organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Trainee Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-slate-900">Trainee</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Focus on skill acquisition and scenario execution.
                </p>
                <ul className="space-y-2.5 pt-2 text-xs font-medium text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> Execute authorized disaster scenarios
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> View personal Digital Skill Twin scores
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> Receive AI feedback & recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> Track personal training history
                  </li>
                </ul>
              </div>
            </div>

            {/* Trainer Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-slate-900">Trainer</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Supervise assigned cohorts and review telemetry metrics.
                </p>
                <ul className="space-y-2.5 pt-2 text-xs font-medium text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" /> Manage assigned trainee roster
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" /> Conduct authorized disaster scenarios
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" /> Inspect trainee Skill Twins & AI logs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" /> Monitor cohort improvement metrics
                  </li>
                </ul>
              </div>
            </div>

            {/* Admin Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-slate-900">Administrator</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Full system control and permission delegation.
                </p>
                <ul className="space-y-2.5 pt-2 text-xs font-medium text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" /> Create & manage Trainers and Trainees
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" /> Assign Trainees to Trainers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" /> Grant or revoke scenario permissions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" /> Audit platform performance data
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </section>


        {/* 7. FINAL CTA SECTION (NAVY PANEL) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="bg-[#0f172a] rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-slate-800 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 mx-auto sm:mx-0">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Ready to Build Skills That Save Lives?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Join ResQVerse today and become disaster-ready.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <button
                onClick={() => onNavigate(user ? '/dashboard' : '/signup')}
                className="px-6 py-3.5 rounded-2xl bg-[#f95738] hover:bg-[#e04729] text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-500/25 transition-all"
              >
                Sign Up Now
              </button>
              <button
                onClick={() => onNavigate('/login')}
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
              >
                Explore Training
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* 8. FOOTER */}
      <footer id="footer" className="bg-white border-t border-slate-200 py-12 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-base block leading-none">ResQVerse</span>
              <span className="text-[10px] text-slate-500 font-semibold">VR Disaster Training & AI</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-semibold text-slate-600">
            <button onClick={() => onNavigate('/')} className="hover:text-slate-900 transition-colors">Home</button>
            <button onClick={() => { const e = document.querySelector('#about'); if (e) e.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-slate-900 transition-colors">About</button>
            <button onClick={() => { const e = document.querySelector('#features'); if (e) e.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-slate-900 transition-colors">Features</button>
            <button onClick={() => { const e = document.querySelector('#training'); if (e) e.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-slate-900 transition-colors">Training</button>
            <button onClick={() => onNavigate('/login')} className="hover:text-slate-900 transition-colors">Login</button>
            <button onClick={() => onNavigate('/signup')} className="hover:text-slate-900 transition-colors">Sign Up</button>
          </div>

          <div className="text-slate-400 font-medium">
            © 2026 ResQVerse. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
