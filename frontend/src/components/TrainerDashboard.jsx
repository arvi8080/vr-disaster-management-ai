import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, BookOpen, FileText, LogOut, Shield, Sparkles, Play, CheckCircle, ChevronRight, Award, AlertTriangle, Cpu } from 'lucide-react';
import VRSimulatorModal from './VRSimulatorModal';
import { fetchTrainerDashboard } from '../services/dashboardService';
import { fetchScenarios } from '../services/scenarioService';

export default function TrainerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [selectedTrainee, setSelectedTrainee] = useState(null);

  const [trainees, setTrainees] = useState([
    {
      id: 'trainee-01',
      name: 'Manav Vartak',
      email: 'manav@ResQVerse.vr',
      dept: 'CS Lab',
      overallScore: 86,
      trend: 'IMPROVING',
      allowedScenarios: ['fire', 'flood', 'earthquake'],
      skillTwin: {
        decisionMaking: 88,
        situationalAwareness: 92,
        safetyAwareness: 85,
        evacuationSkill: 80,
        emergencyResponse: 90
      },
      latestFeedback: 'Demonstrated rapid response during electrical fire drill. Minor delay in power cutoff.'
    },
    {
      id: 'trainee-02',
      name: 'Priya Sharma',
      email: 'priya@ResQVerse.vr',
      dept: 'Electronics',
      overallScore: 91,
      trend: 'STABLE',
      allowedScenarios: ['fire', 'earthquake'],
      skillTwin: {
        decisionMaking: 94,
        situationalAwareness: 90,
        safetyAwareness: 95,
        evacuationSkill: 88,
        emergencyResponse: 92
      },
      latestFeedback: 'Outstanding evacuation speed. 100% compliance with seismic shelter protocol.'
    }
  ]);

  const [authorizedScenarios, setAuthorizedScenarios] = useState([
    { id: 'sc-01', title: 'Fire in Classroom', category: 'Fire Safety', type: 'fire', active: true },
    { id: 'sc-02', title: 'Flood in Building', category: 'Water Hazard', type: 'flood', active: true },
    { id: 'sc-03', title: 'Earthquake Drill', category: 'Seismic Safety', type: 'earthquake', active: true }
  ]);

  useEffect(() => {
    async function loadTrainerData() {
      try {
        const [trainerData, scenarioList] = await Promise.all([
          fetchTrainerDashboard(),
          fetchScenarios()
        ]);

        if (trainerData && trainerData.assignedTrainees && trainerData.assignedTrainees.length > 0) {
          const mappedTrainees = trainerData.assignedTrainees.map(t => ({
            id: t.uid || t.id,
            name: t.name || 'Trainee Student',
            email: t.email || 'trainee@ResQVerse.vr',
            dept: t.dept || 'Safety Training Unit',
            overallScore: t.overallScore || 85,
            trend: t.trend || 'STABLE',
            allowedScenarios: t.allowedScenarios || ['fire', 'flood', 'earthquake'],
            skillTwin: t.skillTwin || {
              decisionMaking: 85,
              situationalAwareness: 88,
              safetyAwareness: 84,
              evacuationSkill: 82,
              emergencyResponse: 86
            },
            latestFeedback: t.latestFeedback || 'Good performance in recent training session.'
          }));
          setTrainees(mappedTrainees);
        }

        if (scenarioList && scenarioList.length > 0) {
          const mappedScenarios = scenarioList.map(s => ({
            id: s.id,
            title: s.title,
            category: s.category || s.disasterType?.toUpperCase() || 'Disaster Drill',
            type: s.disasterType || 'fire',
            active: true
          }));
          setAuthorizedScenarios(mappedScenarios);
        }
      } catch (err) {
        console.warn("TrainerDashboard live fetch error:", err);
      }
    }
    loadTrainerData();
  }, []);

  const filteredScenarios = authorizedScenarios.filter(sc => {
    if (!user.allowedScenarios || user.allowedScenarios.includes('*')) return true;
    return user.allowedScenarios.includes(sc.type);
  });

  return (
    <div className="min-h-screen flex bg-[#0a0910] text-slate-100 relative z-10">
      {/* Sidebar */}
      <aside className="w-64 bg-[#13111c] border-r border-[#27213b] flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-[#27213b]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black tracking-tight text-white flex items-center gap-1.5 text-base">
                ResQVerse <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </h1>
              <p className="text-[10px] uppercase font-semibold text-cyan-300 tracking-wider">Trainer Portal</p>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-[#27213b]/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('trainees')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'trainees' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-[#27213b]/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Assigned Trainees</span>
            </button>

            <button
              onClick={() => setActiveTab('scenarios')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'scenarios' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-[#27213b]/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Conduct VR Scenario</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'reports' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-[#27213b]/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>AI Feedback & Twin</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-[#27213b]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="px-8 py-5 border-b border-[#27213b] bg-[#13111c]/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
          <div>
            <h2 className="text-xl font-bold text-white">Trainer Console — {user.name}</h2>
            <p className="text-xs text-slate-400">Monitoring assigned trainees, Digital Skill Twins, and authorized scenarios.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-300 text-sm">
              {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'TR'}
            </div>
            <span className="text-sm font-medium text-white hidden sm:inline">{user.name}</span>
          </div>
        </header>

        <div className="p-8 space-y-8 flex-1">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6">
                  <span className="text-xs text-slate-400 block mb-1">My Assigned Trainees</span>
                  <h3 className="text-3xl font-bold text-white">{trainees.length}</h3>
                </div>
                <div className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6">
                  <span className="text-xs text-slate-400 block mb-1">Assigned Group Avg Score</span>
                  <h3 className="text-3xl font-bold text-emerald-400">88.5%</h3>
                </div>
                <div className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6">
                  <span className="text-xs text-slate-400 block mb-1">Authorized Scenarios</span>
                  <h3 className="text-3xl font-bold text-purple-400">{filteredScenarios.length}</h3>
                </div>
              </div>

              <div className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4">Assigned Trainees Performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#27213b] text-slate-400">
                        <th className="pb-3 font-semibold">Trainee Name</th>
                        <th className="pb-3 font-semibold">Department</th>
                        <th className="pb-3 font-semibold">Overall Readiness</th>
                        <th className="pb-3 font-semibold">Performance Trend</th>
                        <th className="pb-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27213b]">
                      {trainees.map((t) => (
                        <tr key={t.id} className="hover:bg-[#0a0910]/50">
                          <td className="py-4 font-medium text-white">{t.name}</td>
                          <td className="py-4 text-slate-400">{t.dept}</td>
                          <td className="py-4 text-emerald-400 font-bold">{t.overallScore}%</td>
                          <td className="py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {t.trend}
                            </span>
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => { setSelectedTrainee(t); setActiveTab('trainees'); }}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all flex items-center gap-1"
                            >
                              <span>View Skill Twin</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trainees' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Assigned Trainee Skill Twins</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trainees.map((t) => (
                  <div key={t.id} className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#27213b] pb-4">
                      <div>
                        <h3 className="font-bold text-lg text-white">{t.name}</h3>
                        <p className="text-xs text-slate-400">{t.email} • {t.dept}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Digital Skill Score</span>
                        <span className="text-2xl font-bold text-emerald-400">{t.overallScore}%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-purple-300 flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5" /> 5-Axis Digital Skill Breakdown
                      </span>
                      {Object.entries(t.skillTwin).map(([key, val]) => (
                        <div key={key}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-slate-200 font-semibold">{val}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#0a0910] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" style={{ width: `${val}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0a0910] border border-[#27213b] text-xs">
                      <span className="font-semibold text-purple-400 block mb-1">Latest AI Feedback:</span>
                      <p className="text-slate-300">{t.latestFeedback}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'scenarios' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Authorized VR Training Scenarios</h2>
              <p className="text-xs text-slate-400">You are authorized to conduct and assign the following disaster training drills:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredScenarios.map((sc) => (
                  <div key={sc.id} className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <span className="text-xs text-cyan-400 font-semibold uppercase">{sc.category}</span>
                      <h4 className="font-bold text-white text-lg mt-1 mb-2">{sc.title}</h4>
                      <p className="text-xs text-slate-400 mb-6">Authorized VR scenario for trainee evaluation.</p>
                    </div>
                    <button
                      onClick={() => setActiveSimulation(sc)}
                      className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Conduct / Launch VR Scenario</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Assigned Trainee Performance Reports</h2>
              <div className="space-y-4 text-xs">
                {trainees.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl bg-[#0a0910] border border-[#27213b] flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white mb-0.5">{t.name} — Full Performance Record</h4>
                      <p className="text-slate-400">AI Feedback: {t.latestFeedback}</p>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Score: {t.overallScore}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="px-8 py-4 border-t border-[#27213b] text-center text-xs text-slate-500">
          © 2026 ResQVerse. Trainer Control & Trainee Skill Twin Portal.
        </footer>
      </main>

      {activeSimulation && (
        <VRSimulatorModal
          simulation={activeSimulation}
          onClose={() => setActiveSimulation(null)}
          onComplete={() => setActiveSimulation(null)}
        />
      )}
    </div>
  );
}
