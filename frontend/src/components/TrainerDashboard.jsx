import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, BookOpen, FileText, LogOut, Shield, Sparkles, Play, CheckCircle, ChevronRight, Award, AlertTriangle, Cpu, Pencil, Save, X, RefreshCw } from 'lucide-react';
import VRSimulatorModal from './VRSimulatorModal';
import { fetchTrainerDashboard } from '../services/dashboardService';
import { fetchScenarios } from '../services/scenarioService';
import { assignScenarioToTrainee, fetchMyAssignments, updateTraineeAssignmentDeadline } from '../services/trainingService';
import ThemeToggle from './ThemeToggle';

export default function TrainerDashboard({ user, onLogout, onNavigate, theme, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [trainees, setTrainees] = useState([]);
  const [authorizedScenarios, setAuthorizedScenarios] = useState([]);
  const [trainingAssignments, setTrainingAssignments] = useState([]);
  const [traineeSearch, setTraineeSearch] = useState('');
  const [selectedTraineeId, setSelectedTraineeId] = useState('');
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [assignmentDueAt, setAssignmentDueAt] = useState('');
  const [assignmentMessage, setAssignmentMessage] = useState('');
  const [assignmentError, setAssignmentError] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState('');
  const [editingDueAt, setEditingDueAt] = useState('');
  const [deadlineMessage, setDeadlineMessage] = useState('');
  const [deadlineError, setDeadlineError] = useState('');
  const [isUpdatingDeadline, setIsUpdatingDeadline] = useState(false);
  const [trainerStats, setTrainerStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    async function loadTrainerData() {
      try {
        const [trainerData, scenarioList, assignments] = await Promise.all([
          fetchTrainerDashboard(),
          fetchScenarios(),
          fetchMyAssignments()
        ]);

        setTrainerStats(trainerData);
        setTrainingAssignments(Array.isArray(assignments) ? assignments : []);
        setTrainees((Array.isArray(trainerData?.assignedTrainees) ? trainerData.assignedTrainees : []).map(t => ({
            id: t.uid || t.id,
            name: t.name,
            email: t.email,
            dept: t.dept,
            overallScore: t.overallScore,
            trend: t.trend,
            skillTwin: t.skillTwin,
            latestFeedback: t.latestFeedback
          })));
        setAuthorizedScenarios((Array.isArray(scenarioList) ? scenarioList : []).map(s => ({
            ...s,
            id: s.id,
            title: s.title,
            category: s.category || s.disasterType?.toUpperCase(),
            type: s.disasterType
          })));
      } catch (err) {
        console.warn("TrainerDashboard live fetch error:", err);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadTrainerData();
  }, []);

  const filteredScenarios = authorizedScenarios.filter(sc => {
    return Array.isArray(user.allowedScenarios) && (user.allowedScenarios.includes('*') || user.allowedScenarios.includes(sc.type));
  });
  const trainerScenarios = trainingAssignments.filter(assignment => !assignment.traineeId);
  const matchingTrainees = trainees.filter(trainee =>
    `${trainee.name || ''} ${trainee.email || ''}`.toLowerCase().includes(traineeSearch.trim().toLowerCase())
  );

  const handleAssignScenarioToTrainee = async event => {
    event.preventDefault();
    setAssignmentMessage('');
    setAssignmentError('');
    setIsAssigning(true);
    try {
      const result = await assignScenarioToTrainee({
        scenarioId: selectedScenarioId,
        traineeId: selectedTraineeId,
        dueAt: new Date(assignmentDueAt).toISOString()
      });
      setAssignmentMessage(result.message || 'Scenario assignment saved.');
      setTrainingAssignments(await fetchMyAssignments());
    } catch (error) {
      setAssignmentError(error.message || 'Could not assign this scenario.');
    } finally {
      setIsAssigning(false);
    }
  };

  const toDateTimeLocal = value => {
    const date = value?._seconds
      ? new Date(value._seconds * 1000)
      : value?.toDate
        ? value.toDate()
        : new Date(value);
    if (!value || Number.isNaN(date.getTime())) return '';
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const handleUpdateAssignmentDeadline = async (event, assignment) => {
    event.preventDefault();
    setDeadlineMessage('');
    setDeadlineError('');
    setIsUpdatingDeadline(true);
    try {
      const updatedAssignment = await updateTraineeAssignmentDeadline(
        assignment.assignmentId || assignment.id,
        new Date(editingDueAt).toISOString()
      );
      setTrainingAssignments(current => current.map(item =>
        (item.assignmentId || item.id) === (assignment.assignmentId || assignment.id)
          ? updatedAssignment
          : item
      ));
      setEditingAssignmentId('');
      setEditingDueAt('');
      setDeadlineMessage('Training deadline updated.');
    } catch (error) {
      setDeadlineError(error.message || 'Could not update the training deadline.');
    } finally {
      setIsUpdatingDeadline(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0910] text-slate-100 relative z-10">
      {/* Sidebar */}
      <aside className="dashboard-sidebar w-64 bg-[#13111c] border-r border-[#27213b]">
        <div>
          <div className="p-4 border-b border-[#27213b]">
            <button type="button" onClick={() => onNavigate('/')} aria-label="ResQVerse home" className="w-full flex items-center gap-3 rounded-lg text-left hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400">
            <div className="w-10 h-10 shrink-0 overflow-hidden rounded-xl shadow-lg shadow-purple-600/30">
              <img src="/images/VRlogo.jpeg" alt="ResQVerse logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="font-black tracking-tight text-white flex items-center gap-1.5 text-base">
                ResQVerse <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </h1>
              <p className="text-[10px] uppercase font-semibold text-cyan-300 tracking-wider">Trainer Portal</p>
            </div>
            </button>
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
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <div className="w-9 h-9 rounded-full bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-300 text-sm">
              {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'TR'}
            </div>
            <span className="text-sm font-medium text-white hidden sm:inline">{user.name}</span>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8 flex-1">
          {isLoading && <p role="status" className="py-12 text-sm text-slate-400">Loading assigned trainees...</p>}
          {!isLoading && loadError && <p role="alert" className="py-12 text-sm text-red-300">Trainer data could not be loaded. Check your connection and refresh the page.</p>}
          {!isLoading && !loadError && <>
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6">
                  <span className="text-xs text-slate-400 block mb-1">My Assigned Trainees</span>
                  <h3 className="text-3xl font-bold text-white">{trainees.length}</h3>
                </div>
                <div className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6">
                  <span className="text-xs text-slate-400 block mb-1">Assigned Group Avg Score</span>
                  <h3 className="text-3xl font-bold text-emerald-400">{trainerStats?.averagePerformance ?? '—'}</h3>
                </div>
                <div className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6">
                  <span className="text-xs text-slate-400 block mb-1">Authorized Scenarios</span>
                  <h3 className="text-3xl font-bold text-purple-400">{filteredScenarios.length}</h3>
                </div>
              </div>

              <div className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4">Assign a Scenario to a Trainee</h3>
                <form onSubmit={handleAssignScenarioToTrainee} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="text-xs font-semibold text-slate-300">
                    Find trainee by name or email
                    <input
                      type="search"
                      value={traineeSearch}
                      onChange={event => {
                        setTraineeSearch(event.target.value);
                        setSelectedTraineeId('');
                      }}
                      placeholder="Search name or email"
                      className="mt-1.5 w-full bg-[#0a0910] border border-[#27213b] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500"
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-300">
                    Trainee
                    <select
                      required
                      value={selectedTraineeId}
                      onChange={event => setSelectedTraineeId(event.target.value)}
                      className="mt-1.5 w-full bg-[#0a0910] border border-[#27213b] rounded-lg px-3 py-2 text-sm text-white"
                    >
                      <option value="">Select a trainee</option>
                      {matchingTrainees.map(trainee => (
                        <option key={trainee.id} value={trainee.id}>{trainee.name || 'Name unavailable'} — {trainee.email || 'Email unavailable'}</option>
                      ))}
                    </select>
                    {matchingTrainees.length === 0 && <span className="mt-1 block text-slate-400">No assigned trainees match that search.</span>}
                  </label>
                  <label className="text-xs font-semibold text-slate-300">
                    Scenario
                    <select
                      required
                      value={selectedScenarioId}
                      onChange={event => setSelectedScenarioId(event.target.value)}
                      className="mt-1.5 w-full bg-[#0a0910] border border-[#27213b] rounded-lg px-3 py-2 text-sm text-white"
                    >
                      <option value="">Select an admin-assigned scenario</option>
                      {trainerScenarios.map(scenario => (
                        <option key={scenario.scenarioId} value={scenario.scenarioId}>
                          {scenario.simulationType}{scenario.fireLocation ? ` — ${scenario.fireLocation}` : ''}
                        </option>
                      ))}
                    </select>
                    {trainerScenarios.length === 0 && <span className="mt-1 block text-slate-400">No scenarios have been assigned to you by an admin.</span>}
                  </label>
                  <label className="text-xs font-semibold text-slate-300">
                    Complete by
                    <input
                      required
                      type="datetime-local"
                      min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                      value={assignmentDueAt}
                      onChange={event => setAssignmentDueAt(event.target.value)}
                      className="mt-1.5 w-full bg-[#0a0910] border border-[#27213b] rounded-lg px-3 py-2 text-sm text-white"
                    />
                  </label>
                  <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={isAssigning || trainerScenarios.length === 0 || matchingTrainees.length === 0 || !selectedTraineeId || !selectedScenarioId || !assignmentDueAt}
                      className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                    >
                      {isAssigning ? 'Assigning...' : 'Assign Scenario'}
                    </button>
                    {assignmentMessage && <p role="status" className="text-sm text-emerald-300">{assignmentMessage}</p>}
                    {assignmentError && <p role="alert" className="text-sm text-red-300">{assignmentError}</p>}
                  </div>
                </form>
                <h3 className="text-lg font-bold text-white mb-4">Assigned Trainings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trainingAssignments.map(assignment => (
                    <div key={assignment.assignmentId || assignment.id} className="p-4 rounded-xl bg-[#0a0910] border border-[#27213b]">
                      <p className="text-xs text-cyan-400 font-semibold uppercase">{assignment.simulationType}</p>
                      <h4 className="mt-1 font-semibold text-white">{assignment.simulationType}</h4>
                      {assignment.fireLocation && <p className="mt-1 text-xs text-slate-400">Location: {assignment.fireLocation}</p>}
                      {assignment.traineeId && <p className="mt-2 text-xs text-slate-300">Assigned to: {trainees.find(trainee => trainee.id === assignment.traineeId)?.name || assignment.traineeId}</p>}
                      {assignment.traineeId && editingAssignmentId === (assignment.assignmentId || assignment.id) ? (
                        <form onSubmit={event => handleUpdateAssignmentDeadline(event, assignment)} className="mt-3 space-y-2">
                          <label className="block text-xs font-semibold text-slate-300">
                            New deadline
                            <input
                              required
                              type="datetime-local"
                              min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                              value={editingDueAt}
                              onChange={event => setEditingDueAt(event.target.value)}
                              className="mt-1.5 w-full rounded-lg border border-[#27213b] bg-[#13111c] px-3 py-2 text-sm text-white"
                            />
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="submit"
                              disabled={isUpdatingDeadline || !editingDueAt}
                              className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isUpdatingDeadline ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                              {isUpdatingDeadline ? 'Saving...' : 'Save deadline'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAssignmentId('');
                                setEditingDueAt('');
                                setDeadlineError('');
                              }}
                              disabled={isUpdatingDeadline}
                              className="flex items-center gap-1.5 rounded-lg border border-[#3b354d] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-50"
                            >
                              <X className="h-3.5 w-3.5" />Cancel
                            </button>
                          </div>
                          {deadlineError && <p role="alert" className="text-xs text-red-300">{deadlineError}</p>}
                        </form>
                      ) : (
                        <>
                          {assignment.dueAt && <p className="mt-1 text-xs text-slate-400">Due: {new Date(assignment.dueAt._seconds ? assignment.dueAt._seconds * 1000 : assignment.dueAt).toLocaleString()}</p>}
                          {assignment.traineeId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAssignmentId(assignment.assignmentId || assignment.id);
                                setEditingDueAt(toDateTimeLocal(assignment.dueAt));
                                setDeadlineMessage('');
                                setDeadlineError('');
                              }}
                              className="mt-3 flex items-center gap-1.5 rounded-lg border border-purple-500/40 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/10"
                            >
                              <Pencil className="h-3.5 w-3.5" />Edit deadline
                            </button>
                          )}
                        </>
                      )}
                      <p className="mt-3 text-xs text-slate-400">Status: {assignment.status}</p>
                    </div>
                  ))}
                  {trainingAssignments.length === 0 && <p className="text-sm text-slate-400">No scenarios have been assigned to you.</p>}
                  {deadlineMessage && <p role="status" className="col-span-full text-sm text-emerald-300">{deadlineMessage}</p>}
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
                          <td className="py-4 text-emerald-400 font-bold">{typeof t.overallScore === 'number' ? `${t.overallScore}%` : '—'}</td>
                          <td className="py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {t.trend || 'Unavailable'}
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
                      {trainees.length === 0 && <tr><td colSpan="5" className="py-8 text-center text-slate-400">No trainees are assigned to this trainer.</td></tr>}
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
                        <span className="text-2xl font-bold text-emerald-400">{typeof t.overallScore === 'number' ? `${t.overallScore}%` : '—'}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-purple-300 flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5" /> 5-Axis Digital Skill Breakdown
                      </span>
                      {Object.entries(t.skillTwin || {}).map(([key, val]) => (
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
                      {Object.keys(t.skillTwin || {}).length === 0 && <p className="text-xs text-slate-400">No Skill Twin metrics are available.</p>}
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0a0910] border border-[#27213b] text-xs">
                      <span className="font-semibold text-purple-400 block mb-1">Latest AI Feedback:</span>
                      <p className="text-slate-300">{t.latestFeedback || 'No feedback is available.'}</p>
                    </div>
                  </div>
                ))}
                {trainees.length === 0 && <p className="col-span-full py-8 text-center text-sm text-slate-400">No trainees are assigned to this trainer.</p>}
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
                      <span className="text-xs text-cyan-400 font-semibold uppercase">{sc.category || 'Category unavailable'}</span>
                      <h4 className="font-bold text-white text-lg mt-1 mb-2">{sc.title}</h4>
                      {sc.description && <p className="text-xs text-slate-400 mb-6">{sc.description}</p>}
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
                {filteredScenarios.length === 0 && <p className="col-span-full py-8 text-center text-sm text-slate-400">No authorized scenarios are available.</p>}
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
                      <p className="text-slate-400">AI Feedback: {t.latestFeedback || 'Unavailable'}</p>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {typeof t.overallScore === 'number' ? `Score: ${t.overallScore}%` : 'Score unavailable'}
                    </span>
                  </div>
                ))}
                {trainees.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No assigned trainee reports are available.</p>}
              </div>
            </div>
          )}
          </>}
        </div>

        <footer className="px-8 py-4 border-t border-[#27213b] text-center text-xs text-slate-500">
          © 2026 ResQVerse. Trainer Control & Trainee Skill Twin Portal.
        </footer>
      </main>

      {activeSimulation && (
        <VRSimulatorModal
          simulation={activeSimulation}
          onClose={() => setActiveSimulation(null)}
          onComplete={() => undefined}
        />
      )}
    </div>
  );
}
