import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, BookOpen, ClipboardList, FileText, LogOut, Shield, Sparkles, CheckCircle, UserCheck, Menu, X, AlertCircle, Search } from 'lucide-react';
import { fetchAdminDashboard } from '../services/dashboardService';
import { adminService } from '../services/adminService';
import { fetchScenarios, fetchUnityScenarios } from '../services/scenarioService';
import ThemeToggle from './ThemeToggle';

export default function AdminDashboard({ user, onLogout, onNavigate, theme, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminStats, setAdminStats] = useState(null);
  const [trainees, setTrainees] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [unityScenarios, setUnityScenarios] = useState([]);
  const [unityScenarioError, setUnityScenarioError] = useState('');
  const [selectedTrainerId, setSelectedTrainerId] = useState('');
  const [pendingAssignmentId, setPendingAssignmentId] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [pendingPermissionIds, setPendingPermissionIds] = useState(() => new Set());
  const [showReportPreview, setShowReportPreview] = useState(false);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [statsData, userList, scenarioList] = await Promise.all([
          fetchAdminDashboard(),
          adminService.fetchUsers(),
          fetchScenarios()
        ]);
        setAdminStats(statsData);
        setSimulations(Array.isArray(scenarioList) ? scenarioList : []);
        setTrainees((Array.isArray(userList) ? userList : []).map(u => ({
            id: u.uid || u.email,
            uid: u.uid,
            name: u.name,
            email: u.email || '',
            role: u.role,
            dept: u.dept,
            completed: u.completed,
            avgScore: u.avgScore,
            allowedScenarios: Array.isArray(u.allowedScenarios) ? u.allowedScenarios : [],
            assignedTrainerId: u.assignedTrainerId || null,
            trainerAccessStatus: u.trainerAccessStatus || null
          })));
        try {
          setUnityScenarios(await fetchUnityScenarios());
        } catch (error) {
          setUnityScenarioError(error.message || 'Unity scenarios could not be loaded.');
        }
      } catch (err) {
        console.warn("AdminDashboard live fetch error:", err);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const handleApproveTrainer = async (uid, approve = true) => {
    setErrorMsg('');
    try {
      await adminService.approveTrainer(uid, approve);
      setTrainees(current => current.map(t => t.uid === uid
        ? { ...t, role: approve ? 'trainer' : t.role, trainerAccessStatus: approve ? 'approved' : 'rejected' }
        : t));
      setSuccessMsg(`Trainer access request ${approve ? 'approved' : 'declined'}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.warn("Approve trainer error:", err);
      setErrorMsg(err.message || 'Could not update trainer access. Please try again.');
    }
  };

  const handleAssignTrainer = async (traineeId, trainerId) => {
    setErrorMsg('');
    try {
      await adminService.assignTrainer(traineeId, trainerId);
      setTrainees(current => current.map(t => (t.uid === traineeId || t.id === traineeId)
        ? { ...t, assignedTrainerId: trainerId || null }
        : t));
      setSuccessMsg('Trainer assignment updated.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.warn("Assign trainer error:", err);
      setErrorMsg(err.message || 'Could not assign the trainer. Please try again.');
    }
  };

  const handleAssignScenario = async (scenario) => {
    setErrorMsg('');
    setSuccessMsg('');
    setPendingAssignmentId(scenario.scenarioId);
    try {
      const result = await adminService.assignScenarioToTrainer(scenario.scenarioId, selectedTrainerId);
      setSuccessMsg(result.message || 'Scenario assignment saved.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Could not assign the scenario. Please try again.');
    } finally {
      setPendingAssignmentId('');
    }
  };

  const handleUpdatePermissions = async (uid, scenario, isChecked) => {
    setErrorMsg('');
    setPendingPermissionIds(current => new Set(current).add(uid));
    try {
      const targetUser = trainees.find(t => t.uid === uid || t.id === uid);
      const currentAllowed = targetUser?.allowedScenarios || [];
      let updatedScenarios;
      if (isChecked) {
        updatedScenarios = Array.from(new Set([...currentAllowed, scenario]));
      } else {
        updatedScenarios = currentAllowed.filter(s => s !== scenario);
      }
      await adminService.updatePermissions(uid, updatedScenarios);
      setTrainees(current => current.map(t => (t.uid === uid || t.id === uid) ? { ...t, allowedScenarios: updatedScenarios } : t));
      setSuccessMsg(`Updated scenario permissions for ${targetUser?.name || 'user'}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.warn("Update permissions error:", err);
      setErrorMsg(err.message || 'Could not update scenario permissions. Please try again.');
    } finally {
      setPendingPermissionIds(current => {
        const next = new Set(current);
        next.delete(uid);
        return next;
      });
    }
  };

  const handleExportUsers = () => {
    const rows = [
      ['Name', 'Email', 'Role', 'Department'],
      ...trainees.map(t => [t.name, t.email, t.role, t.dept])
    ];
    const csv = rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resqverse-users.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const pendingTrainerRequests = trainees.filter(t => t.trainerAccessStatus === 'pending' || t.trainerRequestStatus === 'pending');
  const visibleUsers = trainees.filter(t => `${t.name} ${t.email} ${t.role} ${t.dept}`.toLowerCase().includes(userSearch.toLowerCase()));
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { id: 'users', label: 'Users', Icon: Users },
    { id: 'trainings', label: 'Trainings', Icon: BookOpen },
    { id: 'assignments', label: 'Assignments', Icon: ClipboardList },
    { id: 'reports', label: 'Reports', Icon: FileText }
  ];

  return (
    <div className="min-h-screen flex bg-[#0b1220] text-slate-100 relative z-10">
      <aside className={`${mobileNavOpen ? 'flex' : 'hidden'} md:flex fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#111827] border-r border-[#334155] flex-col justify-between`}>
        <div>
          <div className="p-4 flex items-center justify-between gap-2 border-b border-[#334155]">
            <button type="button" onClick={() => onNavigate('/')} aria-label="ResQVerse home" className="min-w-0 flex items-center gap-3 rounded-lg text-left hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400">
            <div className="w-10 h-10 shrink-0 overflow-hidden rounded-lg shadow-lg shadow-orange-500/20">
              <img src="/images/VRlogo.jpeg" alt="ResQVerse logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="font-black tracking-tight text-white flex items-center gap-1.5">
                ResQVerse <Sparkles className="w-3.5 h-3.5 text-orange-300" />
              </h1>
              <p className="text-[10px] uppercase font-semibold text-orange-300 tracking-wider">Admin Control</p>
            </div>
            </button>
            <button type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" className="md:hidden ml-auto p-2 text-slate-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-1.5">
            {navItems.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => { setActiveTab(id); setMobileNavOpen(false); }} aria-current={activeTab === id ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === id ? 'bg-[#f95738] text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
                <Icon className="w-4 h-4" /><span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-[#334155]">
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
        <header className="px-4 md:px-8 py-4 border-b border-[#334155] bg-[#111827]/95 backdrop-blur-md flex items-center justify-between gap-3 sticky top-0 z-30">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-white">Welcome back, {user.name || 'Administrator'}</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-300">
                <Shield className="h-3 w-3" /> Administrator
              </span>
            </div>
            <p className="text-xs text-slate-400">Manage simulations, user assignments, and trainee performance.</p>
          </div>
          <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button type="button" onClick={() => setMobileNavOpen(open => !open)} aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'} className="md:hidden p-2 text-slate-300 hover:text-white">
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('assignments')}
            className="bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2.5 px-4 rounded-lg text-xs flex items-center gap-2"
          >
            <span>Assign Training</span>
          </button>
          </div>
        </header>

        {successMsg && (
          <div className="mx-8 mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && <div role="alert" className="mx-4 md:mx-8 mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /><span>{errorMsg}</span></div>}

        <div className="p-4 md:p-8 space-y-8 flex-1">
          {isLoading && <div role="status" className="py-12 text-center text-sm text-slate-400">Loading admin dashboard...</div>}
          {!isLoading && loadError && <div role="alert" className="py-12 text-center text-sm text-red-300">Admin data could not be loaded. Check your connection and try again.</div>}
          {!isLoading && !loadError && <>
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-[#111827] border border-[#334155] rounded-lg p-6">
                  <span className="text-xs text-slate-400 block mb-1">Registered Users</span>
                  <h3 className="text-3xl font-bold text-white">{adminStats?.totalUsers ?? '—'}</h3>
                </div>
                <div className="bg-[#111827] border border-[#334155] rounded-lg p-6">
                  <span className="text-xs text-slate-400 block mb-1">Trainees</span>
                  <h3 className="text-3xl font-bold text-white">{adminStats?.totalTrainees ?? '—'}</h3>
                </div>
                <div className="bg-[#111827] border border-[#334155] rounded-lg p-6">
                  <span className="text-xs text-slate-400 block mb-1">Trainers</span>
                  <h3 className="text-3xl font-bold text-white">{adminStats?.totalTrainers ?? '—'}</h3>
                </div>
                <div className="bg-[#111827] border border-[#334155] rounded-lg p-6">
                  <span className="text-xs text-slate-400 block mb-1">Scenarios</span>
                  <h3 className="text-3xl font-bold text-white">{adminStats?.totalScenarios ?? '—'}</h3>
                </div>
                <div className="bg-[#111827] border border-[#334155] rounded-lg p-6">
                  <span className="text-xs text-slate-400 block mb-1">Training Sessions</span>
                  <h3 className="text-3xl font-bold text-white">{adminStats?.totalSessions ?? '—'}</h3>
                </div>
              </div>

              <div className="bg-[#111827] border border-[#334155] rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Trainee Performance Overview</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#334155] text-slate-400">
                        <th className="pb-3 font-semibold">Name</th>
                        <th className="pb-3 font-semibold">Department</th>
                        <th className="pb-3 font-semibold">Completed Simulations</th>
                        <th className="pb-3 font-semibold">Avg Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#334155]">
                      {trainees.filter(t => t.role === 'trainee').map((t) => (
                        <tr key={t.id} className="hover:bg-slate-800/50">
                          <td className="py-4 font-medium text-white">{t.name || 'Name unavailable'}</td>
                          <td className="py-4 text-slate-400">{t.dept || '—'}</td>
                          <td className="py-4 text-slate-400">{t.completed ?? '—'}</td>
                          <td className="py-4 text-emerald-400 font-semibold">{t.avgScore ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-[#111827] border border-[#334155] rounded-lg p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Manage Users, Roles & Scenario Permissions</h2>
                  <p className="text-xs text-slate-400 mt-1">Assign trainees to trainers, grant/revoke disaster scenario access, and approve trainer access requests.</p>
                </div>
              </div>

              {/* Pending Trainer Access Requests Section */}
              <div className="p-5 rounded-lg bg-[#0b1220] border border-amber-500/30 space-y-3">
                <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4" /> Pending Trainer Access Requests <span className="text-slate-400">({pendingTrainerRequests.length})</span>
                </h3>
                {pendingTrainerRequests.length === 0 && <p className="text-xs text-slate-400">There are no pending requests.</p>}
                {pendingTrainerRequests.map(request => <div key={request.uid || request.id} className="p-3.5 rounded-lg bg-[#111827] border border-[#334155] flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h4 className="font-bold text-white text-xs">{request.name}</h4>
                    <p className="text-[11px] text-slate-400">{request.email} • Requested Trainer Access</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveTrainer(request.uid || request.id, true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all"
                    >
                      Approve Trainer
                    </button>
                    <button
                      onClick={() => handleApproveTrainer(request.uid || request.id, false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-red-500/20 text-slate-200 hover:text-red-300 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>)}
              </div>

              <div className="space-y-4">
                <label className="relative block max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users by name, email, role, or department" className="w-full bg-[#0b1220] border border-[#334155] rounded-lg py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
                </label>
                {visibleUsers.map((t) => {
                  const allowedScenarios = t.allowedScenarios ?? [];
                  return (
                    <div key={t.id} className="p-5 rounded-lg bg-[#0b1220] border border-[#334155] space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#334155] pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-white">{t.name || 'Name unavailable'}</h4>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-300 border border-orange-500/30">
                              {t.role || 'trainee'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{t.email || 'Email unavailable'} • {t.dept || 'Department not set'}</p>
                        </div>
                        {t.avgScore !== undefined && <div className="flex items-center gap-3"><span className="text-xs text-slate-400">Avg Performance: <strong className="text-emerald-400">{t.avgScore}</strong></span></div>}
                      </div>

                      {t.role === 'trainee' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="p-3.5 rounded-lg bg-[#111827] border border-[#334155]">
                            <label className="block font-semibold text-slate-300 mb-1.5">Assigned Trainer</label>
                            <select
                              value={t.assignedTrainerId || 'none'}
                              onChange={(e) => handleAssignTrainer(t.uid || t.id, e.target.value === 'none' ? null : e.target.value)}
                              className="w-full bg-[#0b1220] border border-[#334155] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-400"
                            >
                              <option value="none">Unassigned</option>
                              {trainees.filter(candidate => candidate.role === 'trainer').map(trainer => (
                                <option key={trainer.uid || trainer.id} value={trainer.uid || trainer.id}>{trainer.name || trainer.email}</option>
                              ))}
                            </select>
                            {trainees.every(candidate => candidate.role !== 'trainer') && <p className="mt-2 text-slate-400">No trainer accounts are available.</p>}
                          </div>

                          <div className="p-3.5 rounded-lg bg-[#111827] border border-[#334155]">
                            <label className="block font-semibold text-slate-300 mb-2">Scenario Permissions</label>
                            <div className="flex items-center gap-4 flex-wrap">
                              {['fire', 'flood', 'earthquake'].map(scenario => (
                                <label key={scenario} className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                                  <input type="checkbox" checked={allowedScenarios.includes(scenario)} disabled={pendingPermissionIds.has(t.uid || t.id)} onChange={e => handleUpdatePermissions(t.uid || t.id, scenario, e.target.checked)} className="rounded accent-[#f95738] disabled:cursor-wait disabled:opacity-50" />
                                  <span className="capitalize">{scenario}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-[#334155] bg-[#111827] px-4 py-3 text-xs text-slate-300">
                          {t.role === 'trainer'
                            ? `Trainer account • Access ${t.trainerAccessStatus || 'status unavailable'}`
                            : 'Administrator account • Trainee assignment and scenario controls do not apply.'}
                        </div>
                      )}
                    </div>
                  );
                })}
                {visibleUsers.length === 0 && <p className="py-8 text-center text-sm text-slate-400">{trainees.length === 0 ? 'No users were returned by the API.' : 'No users match that search.'}</p>}
              </div>
            </div>
          )}

          {activeTab === 'trainings' && (
            <div className="bg-[#111827] border border-[#334155] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Manage VR Simulations</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {simulations.map((s) => (
                  <div key={s.id} className="p-5 rounded-lg bg-[#0b1220] border border-[#334155]">
                    <span className="text-xs text-orange-300 font-semibold uppercase">{s.category}</span>
                    <h4 className="font-bold text-white text-base mt-1 mb-2">{s.title}</h4>
                    <p className="text-xs text-slate-400 mb-4">Difficulty: {s.difficulty}</p>
                    <p className="text-xs text-slate-500">Training assignment is not supported by the current API.</p>
                  </div>
                ))}
                {simulations.length === 0 && <p className="col-span-full py-8 text-center text-sm text-slate-400">No scenarios were returned by the API.</p>}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="bg-[#111827] border border-[#334155] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-2">Assign Scenarios to Trainers</h2>
              <p className="text-sm text-slate-400 mb-6">Scenarios below are discovered from Unity simulation results and grouped by their scenario type and location.</p>
              {unityScenarioError && <p role="alert" className="mb-4 text-sm text-red-300">{unityScenarioError}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unityScenarios.map(scenario => (
                  <div key={scenario.scenarioId} className="p-5 rounded-lg bg-[#0b1220] border border-[#334155] space-y-4">
                    <div>
                      <p className="text-xs text-orange-300 font-semibold uppercase">{scenario.simulationType}</p>
                      <h3 className="mt-1 text-lg font-bold text-white">{scenario.simulationType}</h3>
                      {scenario.fireLocation && <p className="mt-1 text-sm text-slate-400">Location: {scenario.fireLocation}</p>}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <select
                        aria-label={`Trainer for ${scenario.simulationType}${scenario.fireLocation ? ` at ${scenario.fireLocation}` : ''}`}
                        value={selectedTrainerId}
                        onChange={event => setSelectedTrainerId(event.target.value)}
                        className="flex-1 bg-[#111827] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-400"
                      >
                        <option value="">Select a trainer</option>
                        {trainees.filter(candidate => candidate.role === 'trainer').map(trainer => (
                          <option key={trainer.uid || trainer.id} value={trainer.uid || trainer.id}>{trainer.name || trainer.email}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleAssignScenario(scenario)}
                        disabled={!selectedTrainerId || pendingAssignmentId === scenario.scenarioId}
                        className="bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-semibold py-2 px-4 rounded-lg text-sm disabled:cursor-not-allowed"
                      >
                        {pendingAssignmentId === scenario.scenarioId ? 'Assigning...' : 'Assign'}
                      </button>
                    </div>
                    {trainees.every(candidate => candidate.role !== 'trainer') && <p className="text-xs text-slate-400">No trainer accounts are available.</p>}
                  </div>
                ))}
                {!unityScenarioError && unityScenarios.length === 0 && <p className="col-span-full py-8 text-center text-sm text-slate-400">No Unity scenarios are available.</p>}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-[#111827] border border-[#334155] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-2">User Directory Report</h2>
              <p className="text-sm text-slate-400 mb-5">View the users returned by the admin API or download the same report as CSV.</p>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setShowReportPreview(value => !value)} aria-expanded={showReportPreview} className="rounded-lg border border-[#475569] px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700/50 transition-colors">
                  {showReportPreview ? 'Hide report' : 'View report'}
                </button>
                <button type="button" onClick={handleExportUsers} className="bg-[#f95738] hover:bg-[#e04729] text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors">
                  Download CSV
                </button>
              </div>
              {showReportPreview && (
                <div className="mt-5 overflow-x-auto rounded-lg border border-[#334155]" role="region" aria-label="User directory report preview">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#0b1220] text-slate-300">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Name</th>
                        <th className="px-4 py-3 font-semibold">Email</th>
                        <th className="px-4 py-3 font-semibold">Role</th>
                        <th className="px-4 py-3 font-semibold">Department</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#334155]">
                      {trainees.map(t => (
                        <tr key={t.id} className="text-slate-200">
                          <td className="px-4 py-3">{t.name || 'Name unavailable'}</td>
                          <td className="px-4 py-3">{t.email || 'Email unavailable'}</td>
                          <td className="px-4 py-3 capitalize">{t.role || 'Role unavailable'}</td>
                          <td className="px-4 py-3">{t.dept || 'Not set'}</td>
                        </tr>
                      ))}
                      {trainees.length === 0 && <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-400">No users were returned by the API.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          </>}
        </div>

        <footer className="px-8 py-4 border-t border-[#334155] text-center text-xs text-slate-500">
          © 2026 ResQVerse Admin Control Panel. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
