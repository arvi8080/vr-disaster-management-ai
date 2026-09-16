import React, { useState } from 'react';
import { LayoutDashboard, BookOpen, ClipboardList, FileText, User as UserIcon, LogOut, Flame, Droplets, Wind, Play, ChevronRight, Shield, Sparkles } from 'lucide-react';
import VRSimulatorModal from './VRSimulatorModal';

export default function StudentDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [reports, setReports] = useState([
    {
      title: 'Fire in Classroom',
      score: 86,
      date: 'Completed on 28 Aug 2026 • 11:24 AM',
      overall: 'Proficient',
      mistakes: 'Slight delay in power isolation',
      aiFeedback: 'Good extinguisher technique. Remember to pull pin firmly.'
    },
    {
      title: 'Flood in Building',
      score: 78,
      date: 'Completed on 10 Aug 2026 • 09:15 AM',
      overall: 'Satisfactory',
      mistakes: 'Delayed barrier sealing',
      aiFeedback: 'Ensure faster deployment of flood gates in hallway zones.'
    },
    {
      title: 'Earthquake Drill',
      score: 65,
      date: 'Completed on 02 Aug 2026 • 04:30 PM',
      overall: 'Needs Improvement',
      mistakes: 'Hesitation during drop and cover phase',
      aiFeedback: 'Practice immediate drop under sturdy furniture during initial tremors.'
    }
  ]);

  const [trainings, setTrainings] = useState([
    {
      id: 1,
      title: 'Fire in Classroom',
      description: 'Learn how to respond to fire incidents in a lab or classroom.',
      progress: 60,
      icon: Flame,
      category: 'Fire Safety'
    },
    {
      id: 2,
      title: 'Flood in Building',
      description: 'Train for indoor flooding and emergency evacuation procedures.',
      progress: 0,
      icon: Droplets,
      category: 'Water Hazard'
    },
    {
      id: 3,
      title: 'Earthquake Drill',
      description: 'Practice safe evacuation and essential actions during earthquakes.',
      progress: 0,
      icon: Wind,
      category: 'Seismic Safety'
    }
  ]);

  const [assignments, setAssignments] = useState([
    { title: 'Fire in Computer Lab', assignedBy: 'Admin', dueDate: '10 Sep 2026', status: 'Pending' },
    { title: 'Flood in Office Building', assignedBy: 'Admin', dueDate: '15 Sep 2026', status: 'Pending' },
    { title: 'Earthquake in Hostel', assignedBy: 'Admin', dueDate: '20 Sep 2026', status: 'Pending' }
  ]);

  const handleSimulationComplete = (newReportData) => {
    setActiveSimulation(null);
    setTrainings(trainings.map(t => t.title === newReportData.title ? { ...t, progress: 100 } : t));
    setReports([
      {
        title: newReportData.title,
        score: newReportData.score,
        date: `Completed on ${newReportData.date}`,
        overall: newReportData.score > 85 ? 'Excellent' : 'Proficient',
        mistakes: 'Minor timing latency',
        aiFeedback: newReportData.aiFeedback
      },
      ...reports
    ]);
  };

  return (
    <div className="min-h-screen flex bg-[#0a0910] text-slate-100 relative z-10">
      <aside className="w-64 bg-[#13111c] border-r border-[#27213b] flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-[#27213b]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black tracking-tight text-white flex items-center gap-1.5">
                ResQVerse <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </h1>
              <p className="text-[10px] uppercase font-semibold text-purple-300 tracking-wider">VR Disaster Training</p>
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
              onClick={() => setActiveTab('trainings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'trainings' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-[#27213b]/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>My Trainings</span>
            </button>

            <button
              onClick={() => setActiveTab('assignments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'assignments' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-[#27213b]/50'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Assignments</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'reports' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-[#27213b]/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>My Reports</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'profile' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-[#27213b]/50'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile</span>
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

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="px-8 py-5 border-b border-[#27213b] bg-[#13111c]/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
          <div>
            <h2 className="text-xl font-bold text-white">Welcome back, {user.name}</h2>
            <p className="text-xs text-slate-400">Ready to train. Ready to respond.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 text-sm">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="text-sm font-medium text-white hidden sm:inline">{user.name}</span>
          </div>
        </header>

        <div className="p-8 space-y-8 flex-1">
          {activeTab === 'dashboard' && (
            <>
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">My Trainings</h3>
                  <button onClick={() => setActiveTab('trainings')} className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {trainings.map((t) => {
                    const Icon = t.icon;
                    return (
                      <div key={t.id} className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/50 transition-all shadow-lg">
                        <div>
                          <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                            <Icon className="w-6 h-6" />
                          </div>
                          <h4 className="font-bold text-white text-base mb-1">{t.title}</h4>
                          <p className="text-xs text-slate-400 mb-6 leading-relaxed">{t.description}</p>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-2">
                            <span className="text-slate-400">Progress</span>
                            <span className="text-purple-400">{t.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-[#0a0910] rounded-full overflow-hidden mb-5">
                            <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${t.progress}%` }}></div>
                          </div>
                          <button
                            onClick={() => setActiveSimulation(t)}
                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                              t.progress > 0
                                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
                                : 'bg-[#27213b] hover:bg-purple-600/30 text-white'
                            }`}
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>{t.progress > 0 ? 'Continue' : 'Start Training'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Assigned Trainings</h3>
                    <button onClick={() => setActiveTab('assignments')} className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                      View all <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {assignments.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-[#0a0910] border border-[#27213b] flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm text-white mb-0.5">{item.title}</h4>
                          <p className="text-xs text-slate-400">Assigned by: {item.assignedBy} • Due: {item.dueDate}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            {item.status}
                          </span>
                          <button
                            onClick={() => setActiveSimulation({ title: item.title, description: 'Assigned VR disaster module.' })}
                            className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">My Reports</h3>
                    <button onClick={() => setActiveTab('reports')} className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                      View all <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {reports.map((rep, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-[#0a0910] border border-[#27213b] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-purple-400" />
                          <div>
                            <h4 className="font-semibold text-sm text-white mb-0.5">{rep.title}</h4>
                            <p className="text-xs text-slate-400">{rep.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            rep.score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            Score {rep.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}

          {activeTab === 'trainings' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">All VR Disaster Simulations</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trainings.map((t) => {
                  const Icon = t.icon;
                  return (
                    <div key={t.id} className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6 flex flex-col justify-between">
                      <div>
                        <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">{t.category}</span>
                        <h4 className="font-bold text-white text-lg mt-1 mb-2">{t.title}</h4>
                        <p className="text-xs text-slate-400 mb-6 leading-relaxed">{t.description}</p>
                      </div>
                      <button
                        onClick={() => setActiveSimulation(t)}
                        className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>Launch VR Simulation</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Assigned Trainings</h2>
              <div className="space-y-4">
                {assignments.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-[#0a0910] border border-[#27213b] flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h4 className="font-bold text-base text-white mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-400">Assigned by: <span className="text-white font-medium">{item.assignedBy}</span> • Due Date: <span className="text-purple-400 font-medium">{item.dueDate}</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        Status: {item.status}
                      </span>
                      <button
                        onClick={() => setActiveSimulation({ title: item.title, description: 'Assigned VR session.' })}
                        className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/30 flex items-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Detailed VR Performance Reports</h2>
              <div className="space-y-4">
                {reports.map((rep, idx) => (
                  <div key={idx} className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#27213b] flex-wrap gap-2">
                      <div>
                        <h3 className="font-bold text-lg text-white">{rep.title}</h3>
                        <p className="text-xs text-slate-400">{rep.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">Overall Performance: <strong className="text-white">{rep.overall}</strong></span>
                        <span className="px-3 py-1.5 rounded-xl text-sm font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Score: {rep.score}%
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-[#0a0910] border border-[#27213b]">
                        <span className="font-semibold text-amber-400 block mb-1">Mistakes Detected:</span>
                        <p className="text-slate-300">{rep.mistakes}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#0a0910] border border-[#27213b]">
                        <span className="font-semibold text-purple-400 block mb-1">AI Trainer Feedback:</span>
                        <p className="text-slate-300">{rep.aiFeedback}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-xl bg-[#13111c] border border-[#27213b] rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">User Profile Settings</h2>
              <div className="space-y-5 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                  <input type="text" defaultValue={user.name} className="w-full bg-[#0a0910] border border-[#27213b] rounded-xl px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                  <input type="email" defaultValue={user.email} className="w-full bg-[#0a0910] border border-[#27213b] rounded-xl px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Department / Class</label>
                  <input type="text" defaultValue={user.department || 'Computer Science Lab'} className="w-full bg-[#0a0910] border border-[#27213b] rounded-xl px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Change Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-[#0a0910] border border-[#27213b] rounded-xl px-4 py-3 text-white" />
                </div>
                <button className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-purple-600/30 transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="px-8 py-4 border-t border-[#27213b] text-center text-xs text-slate-500">
          © 2026 ResQVerse. All rights reserved. VR Disaster Training & AI System.
        </footer>
      </main>

      {activeSimulation && (
        <VRSimulatorModal
          simulation={activeSimulation}
          onClose={() => setActiveSimulation(null)}
          onComplete={handleSimulationComplete}
        />
      )}
    </div>
  );
}
