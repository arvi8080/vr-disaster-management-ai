import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, BookOpen, ClipboardList, FileText, LogOut, Plus, Shield, Sparkles, CheckCircle, UserCheck } from 'lucide-react';
import { fetchAdminDashboard } from '../services/dashboardService';
import { adminService } from '../services/adminService';

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminStats, setAdminStats] = useState({ totalUsers: 3, totalTrainees: 2, totalTrainers: 1, totalScenarios: 3, totalSessions: 5 });
  const [trainees, setTrainees] = useState([
    { id: 'usr-01', uid: 'usr-01', name: 'Manav Vartak', email: 'manav@ResQVerse.vr', role: 'trainee', dept: 'CS Lab', completed: 3, avgScore: '83%', allowedScenarios: ['fire', 'flood', 'earthquake'] },
    { id: 'usr-02', uid: 'usr-02', name: 'Priya Sharma', email: 'priya@ResQVerse.vr', role: 'trainee', dept: 'Electronics', completed: 2, avgScore: '91%', allowedScenarios: ['fire', 'earthquake'] }
  ]);

  const [simulations] = useState([
    { id: 1, title: 'Fire in Classroom', category: 'Fire Safety', difficulty: 'Intermediate' },
    { id: 2, title: 'Flood in Building', category: 'Water Hazard', difficulty: 'Advanced' },
    { id: 3, title: 'Earthquake Drill', category: 'Seismic', difficulty: 'Beginner' }
  ]);

  const [assignments] = useState([
    { id: 1, training: 'Fire in Computer Lab', trainee: 'Manav Vartak', dueDate: '10 Sep 2026', status: 'Pending' },
    { id: 2, training: 'Flood in Office Building', trainee: 'Priya Sharma', dueDate: '15 Sep 2026', status: 'Pending' }
  ]);

  const [newAssignModal, setNewAssignModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [statsData, userList] = await Promise.all([
          fetchAdminDashboard(),
          adminService.fetchUsers()
        ]);
        if (statsData) setAdminStats(statsData);
        if (userList && userList.length > 0) {
          const mappedUsers = userList.map((u, idx) => ({
            id: u.uid || `usr-${idx}`,
            uid: u.uid,
            name: u.name || 'ResQVerse User',
            email: u.email || '',
            role: u.role || 'trainee',
            dept: u.dept || 'Department',
            completed: u.completed || 2,
            avgScore: u.avgScore || '85%',
            allowedScenarios: u.allowedScenarios || ['fire', 'flood', 'earthquake'],
            assignedTrainerId: u.assignedTrainerId || null,
            trainerAccessStatus: u.trainerAccessStatus || 'none'
          }));
          setTrainees(mappedUsers);
        }
      } catch (err) {
        console.warn("AdminDashboard live fetch error:", err);
      }
    }
    loadAdminData();
  }, []);

  const handleApproveTrainer = async (uid, approve = true) => {
    try {
      await adminService.approveTrainer(uid, approve);
      setSuccessMsg(`Trainer access request ${approve ? 'approved' : 'declined'}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.warn("Approve trainer error:", err);
    }
  };

  const handleAssignTrainer = async (traineeId, trainerId) => {
    try {
      await adminService.assignTrainer(traineeId, trainerId);
      setSuccessMsg('Trainer assignment updated on backend.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.warn("Assign trainer error:", err);
    }
  };

  const handleUpdatePermissions = async (uid, scenario, isChecked) => {
    try {
      const targetUser = trainees.find(t => t.uid === uid || t.id === uid);
      const currentAllowed = targetUser ? targetUser.allowedScenarios || ['fire', 'flood', 'earthquake'] : ['fire', 'flood', 'earthquake'];
      let updatedScenarios;
      if (isChecked) {
        updatedScenarios = Array.from(new Set([...currentAllowed, scenario]));
      } else {
        updatedScenarios = currentAllowed.filter(s => s !== scenario);
      }
      await adminService.updatePermissions(uid, updatedScenarios);
      setTrainees(trainees.map(t => (t.uid === uid || t.id === uid) ? { ...t, allowedScenarios: updatedScenarios } : t));
      setSuccessMsg(`Updated scenario permissions for ${targetUser?.name || 'user'}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.warn("Update permissions error:", err);
    }
  };

  const handleAssignTraining = (e) => {
    e.preventDefault();
    setNewAssignModal(false);
    setSuccessMsg('Training successfully assigned to student!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="min-h-screen flex bg-[#0a0910] text-slate-100 relative z-10">
      <aside className="w-64 bg-[#13111c] border-r border-[#27213b] flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-[#27213b]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black tracking-tight text-white flex items-center gap-1.5">
                ResQVerse <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h1>
              <p className="text-[10px] uppercase font-semibold text-amber-300 tracking-wider">Admin Control</p>
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
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'users' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-[#27213b]/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users</span>
            </button>

            <button
              onClick={() => setActiveTab('trainings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'trainings' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-[#27213b]/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Trainings</span>
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
              <span>Reports</span>
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
            <h2 className="text-xl font-bold text-white">Admin Portal — {user.name}</h2>
            <p className="text-xs text-slate-400">Manage simulations, user assignments, and trainee performance.</p>
          </div>
          <button
            onClick={() => setNewAssignModal(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-purple-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Training</span>
          </button>
        </header>

        {successMsg && (
          <div className="mx-8 mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="p-8 space-y-8 flex-1">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6">
                  <span className="text-xs text-slate-400 block mb-1">Total Registered Trainees</span>
                  <h3 className="text-3xl font-bold text-white">{trainees.length}</h3>
                </div>
                <div className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6">
                  <span className="text-xs text-slate-400 block mb-1">Active VR Simulations</span>
                  <h3 className="text-3xl font-bold text-white">{simulations.length}</h3>
                </div>
                <div className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6">
                  <span className="text-xs text-slate-400 block mb-1">Active Assignments</span>
                  <h3 className="text-3xl font-bold text-white">{assignments.length}</h3>
                </div>
              </div>

              <div className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Trainee Performance Overview</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#27213b] text-slate-400">
                        <th className="pb-3 font-semibold">Name</th>
                        <th className="pb-3 font-semibold">Department</th>
                        <th className="pb-3 font-semibold">Completed Simulations</th>
                        <th className="pb-3 font-semibold">Avg Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27213b]">
                      {trainees.map((t) => (
                        <tr key={t.id} className="hover:bg-[#0a0910]/50">
                          <td className="py-4 font-medium text-white">{t.name}</td>
                          <td className="py-4 text-slate-400">{t.dept}</td>
                          <td className="py-4 text-slate-400">{t.completed} Modules</td>
                          <td className="py-4 text-emerald-400 font-semibold">{t.avgScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Manage Users, Roles & Scenario Permissions</h2>
                  <p className="text-xs text-slate-400 mt-1">Assign trainees to trainers, grant/revoke disaster scenario access, and approve trainer access requests.</p>
                </div>
              </div>

              {/* Pending Trainer Access Requests Section */}
              <div className="p-5 rounded-2xl bg-[#0a0910] border border-amber-500/30 space-y-3">
                <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4" /> Pending Trainer Access Requests
                </h3>
                <div className="p-3.5 rounded-xl bg-[#13111c] border border-[#27213b] flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h4 className="font-bold text-white text-xs">Vikram Singh</h4>
                    <p className="text-[11px] text-slate-400">vikram@ResQVerse.vr • Requested Trainer Access</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSuccessMsg('Trainer access approved for Vikram Singh!');
                        setTimeout(() => setSuccessMsg(''), 3000);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all"
                    >
                      Approve Trainer
                    </button>
                    <button
                      onClick={() => {
                        setSuccessMsg('Trainer access request declined.');
                        setTimeout(() => setSuccessMsg(''), 3000);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#27213b] hover:bg-red-500/20 text-slate-300 hover:text-red-300 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {trainees.map((t) => {
                  const allowedScenarios = t.allowedScenarios || ['fire', 'flood', 'earthquake'];
                  return (
                    <div key={t.id} className="p-5 rounded-2xl bg-[#0a0910] border border-[#27213b] space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#27213b] pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-white">{t.name}</h4>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-600/20 text-purple-300 border border-purple-500/30">
                              {t.role || 'trainee'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{t.email} • Dept: {t.dept}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400">Avg Performance: <strong className="text-emerald-400">{t.avgScore}</strong></span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Trainer Assignment Control */}
                        <div className="p-3.5 rounded-xl bg-[#13111c] border border-[#27213b]">
                          <label className="block font-semibold text-slate-300 mb-1.5">Assigned Trainer</label>
                          <select
                            defaultValue={t.assignedTrainerId || 'trainer-official'}
                            onChange={(e) => {
                              setSuccessMsg(`Assigned ${t.name} to trainer.`);
                              setTimeout(() => setSuccessMsg(''), 3000);
                            }}
                            className="w-full bg-[#0a0910] border border-[#27213b] rounded-xl px-3 py-2 text-xs text-white"
                          >
                            <option value="none">Unassigned</option>
                            <option value="trainer-official">Trainer Official (trainer@ResQVerse.vr)</option>
                            <option value="trainer-senior">Senior Disaster Trainer (senior@ResQVerse.vr)</option>
                          </select>
                        </div>

                        {/* Scenario Permission Checkboxes */}
                        <div className="p-3.5 rounded-xl bg-[#13111c] border border-[#27213b]">
                          <label className="block font-semibold text-slate-300 mb-2">Scenario Permissions (Grant / Revoke)</label>
                          <div className="flex items-center gap-4 flex-wrap">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                              <input type="checkbox" defaultChecked={allowedScenarios.includes('fire')} className="rounded accent-purple-600" />
                              <span>Fire</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                              <input type="checkbox" defaultChecked={allowedScenarios.includes('flood')} className="rounded accent-purple-600" />
                              <span>Flood</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                              <input type="checkbox" defaultChecked={allowedScenarios.includes('earthquake')} className="rounded accent-purple-600" />
                              <span>Earthquake</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'trainings' && (
            <div className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Manage VR Simulations</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {simulations.map((s) => (
                  <div key={s.id} className="p-5 rounded-2xl bg-[#0a0910] border border-[#27213b]">
                    <span className="text-xs text-purple-400 font-semibold uppercase">{s.category}</span>
                    <h4 className="font-bold text-white text-base mt-1 mb-2">{s.title}</h4>
                    <p className="text-xs text-slate-400 mb-4">Difficulty: {s.difficulty}</p>
                    <button className="w-full py-2 bg-[#27213b] hover:bg-purple-600/30 text-white rounded-xl text-xs font-semibold transition-colors">
                      Configure Scenario
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Manage Assignments</h2>
              <div className="space-y-3">
                {assignments.map((a) => (
                  <div key={a.id} className="p-4 rounded-xl bg-[#0a0910] border border-[#27213b] flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">{a.training}</h4>
                      <p className="text-xs text-slate-400">Assigned to: <span className="text-white">{a.trainee}</span> • Due: {a.dueDate}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Generate / View Reports</h2>
              <p className="text-sm text-slate-400 mb-6">Export comprehensive trainee AI evaluation logs for institutional compliance.</p>
              <button className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-6 rounded-xl text-xs shadow-lg shadow-purple-600/30">
                Export All Reports (CSV / PDF)
              </button>
            </div>
          )}
        </div>

        {newAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-md bg-[#13111c] border border-[#27213b] rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Assign VR Training</h3>
              <form onSubmit={handleAssignTraining} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Select Trainee</label>
                  <select className="w-full bg-[#0a0910] border border-[#27213b] rounded-xl px-4 py-3 text-sm text-white">
                    {trainees.map(t => <option key={t.id}>{t.name} ({t.dept})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Select Simulation Module</label>
                  <select className="w-full bg-[#0a0910] border border-[#27213b] rounded-xl px-4 py-3 text-sm text-white">
                    {simulations.map(s => <option key={s.id}>{s.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Due Date</label>
                  <input type="date" defaultValue="2026-09-20" className="w-full bg-[#0a0910] border border-[#27213b] rounded-xl px-4 py-3 text-sm text-white" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setNewAssignModal(false)}
                    className="flex-1 bg-[#27213b] hover:bg-[#322b4d] text-white py-3 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/30"
                  >
                    Confirm Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <footer className="px-8 py-4 border-t border-[#27213b] text-center text-xs text-slate-500">
          © 2026 ResQVerse Admin Control Panel. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
