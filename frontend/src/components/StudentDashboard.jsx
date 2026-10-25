import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, ClipboardList, FileText, User as UserIcon, LogOut, Flame, Droplets, Wind, Play, ChevronRight, Shield, Sparkles, Lock, Cpu, Brain, AlertCircle, RefreshCw, Download, Printer } from 'lucide-react';
import VRSimulatorModal from './VRSimulatorModal';
import SkillTwinPanel from './SkillTwinPanel';
import { fetchTraineeDashboard } from '../services/dashboardService';
import { fetchScenarios } from '../services/scenarioService';
import { fetchAllMySessions, fetchAssignmentsForMe, fetchMySessions } from '../services/trainingService';
import { analyzeTrainingSession } from '../services/aiService';
import { fetchMySkillTwin } from '../services/skillTwinService';
import { fetchAllMyFeedback } from '../services/feedbackService';
import ThemeToggle from './ThemeToggle';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function formatReportDate(value) {
  const timestamp = value?._seconds
    ? value._seconds * 1000
    : typeof value?.toDate === 'function'
      ? value.toDate().getTime()
      : value;
  const date = new Date(timestamp);
  return value && !Number.isNaN(date.getTime()) ? date.toLocaleString() : 'Date unavailable';
}

function csvCell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export default function StudentDashboard({ user, onLogout, onNavigate, theme, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [reports, setReports] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [allScenarios, setAllScenarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reportAction, setReportAction] = useState('');
  const [reportError, setReportError] = useState('');
  const [aiAnalyses, setAiAnalyses] = useState({});
  const [analyzingSessionId, setAnalyzingSessionId] = useState('');
  const [analysisErrors, setAnalysisErrors] = useState({});

  useEffect(() => {
    async function loadData() {
      try {
        const [scenarioCatalog, sessionList, assignmentList] = await Promise.all([
          fetchScenarios(),
          fetchMySessions(),
          fetchAssignmentsForMe()
        ]);
        const dashData = await fetchTraineeDashboard();
        setLiveMetrics(dashData);
        setReports(Array.isArray(sessionList) ? sessionList : []);
        setAssignments(Array.isArray(assignmentList) ? assignmentList : []);
        setAllScenarios((Array.isArray(scenarioCatalog) ? scenarioCatalog : []).map(s => ({
            ...s,
            title: s.title,
            icon: s.disasterType === 'fire' ? Flame : s.disasterType === 'flood' ? Droplets : s.disasterType === 'earthquake' ? Wind : Shield,
            type: s.disasterType
          })));
      } catch (err) {
        console.warn("StudentDashboard live fetch error:", err);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const isScenarioAllowed = (type) => {
    return Array.isArray(user.allowedScenarios) && (user.allowedScenarios.includes('*') || user.allowedScenarios.includes(type));
  };

  const getSessionTitle = (session) => allScenarios.find(scenario => scenario.id === session.scenarioId)?.title || session.scenario || session.scenarioId || 'Scenario unavailable';
  const startAssignedTraining = item => {
    const assignmentId = item.assignmentId || item.id;
    if (!assignmentId || !item.scenarioId) return;
    setActiveSimulation({
      id: item.scenarioId,
      assignmentId,
      title: `${item.simulationType || 'Assigned training'}${item.fireLocation ? ` — ${item.fireLocation}` : ''}`,
      type: item.simulationType?.toLowerCase().includes('fire') ? 'fire' : item.simulationType?.toLowerCase().includes('flood') ? 'flood' : 'earthquake'
    });
  };
  const formatAssignmentDate = value => {
    const timestamp = value?._seconds ? value._seconds * 1000 : value;
    const date = new Date(timestamp);
    return value && !Number.isNaN(date.getTime()) ? date.toLocaleString() : 'Not specified';
  };
  const getSessionDate = (session) => {
    const value = session.completedAt || session.createdAt;
    const date = value?._seconds ? new Date(value._seconds * 1000) : new Date(value);
    return value && !Number.isNaN(date.getTime()) ? date.toLocaleString() : 'Date unavailable';
  };

  const getAllSessionsForReport = async () => {
    const allSessions = await fetchAllMySessions();
    return allSessions.sort((a, b) => {
      const dateA = new Date(a.completedAt?._seconds ? a.completedAt._seconds * 1000 : a.completedAt || a.createdAt || 0);
      const dateB = new Date(b.completedAt?._seconds ? b.completedAt._seconds * 1000 : b.completedAt || b.createdAt || 0);
      return dateB - dateA;
    });
  };

  const getPersistedAIAnalyses = feedbackRecords => new Map(
    feedbackRecords
      .filter(record => record.type === 'AI' && record.sessionId)
      .map(record => [record.sessionId, record])
  );

  const handleDownloadReport = async () => {
    setReportAction('csv');
    setReportError('');
    try {
      const [allSessions, skillTwin, feedbackRecords] = await Promise.all([
        getAllSessionsForReport(),
        fetchMySkillTwin(),
        fetchAllMyFeedback()
      ]);
      const savedAnalyses = getPersistedAIAnalyses(feedbackRecords);
      const rows = [
        ['Trainee', user.name || '', 'Email', user.email || ''],
        ['Overall Skill Twin Score', skillTwin.overallScore ?? 'Unavailable', 'Training Sessions', allSessions.length],
        [],
        ['Scenario', 'Fire Location', 'Completed / Created', 'Status', 'Score', 'Total Response (seconds)', 'Power Isolation (seconds)', 'Pin Removal (seconds)', 'Extinguishing (seconds)', 'Objectives Completed', 'Safety Violations', 'Procedure Violation', 'AI Risk Level', 'AI Strengths', 'AI Areas to Improve', 'AI Recommendations']
      ];
      allSessions.forEach(session => {
        const analysis = aiAnalyses[session.id] || savedAnalyses.get(session.id) || {};
        rows.push([
          getSessionTitle(session),
          session.fireLocation || 'Unavailable',
          formatReportDate(session.completedAt || session.createdAt),
          session.status || 'Unavailable',
          session.score ?? 'Unavailable',
          session.unityMetrics?.totalResponseTime ?? session.duration ?? 'Unavailable',
          session.unityMetrics?.powerIsolationTime ?? 'Unavailable',
          session.unityMetrics?.pinRemovalTime ?? 'Unavailable',
          session.unityMetrics?.extinguishingTime ?? 'Unavailable',
          session.objectivesCompleted ?? 'Unavailable',
          session.safetyViolations ?? 'Unavailable',
          session.procedureViolation === true ? 'Yes' : session.procedureViolation === false ? 'No' : 'Unavailable',
          analysis.riskLevel || 'Not generated',
          (analysis.strengths || []).join('; '),
          (analysis.weaknesses || []).join('; '),
          (analysis.recommendations || []).join('; ')
        ]);
      });
      Object.entries(skillTwin.skills || {}).forEach(([skill, score]) => rows.push([`Skill: ${skill}`, score]));

      const csv = rows.map(row => row.map(csvCell).join(',')).join('\r\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `resqverse-training-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setReportError(error.message || 'Could not generate your training report.');
    } finally {
      setReportAction('');
    }
  };

  const handlePrintReport = async () => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      setReportError('Allow pop-ups to open the printable report.');
      return;
    }

    reportWindow.opener = null;
    setReportAction('pdf');
    setReportError('');
    try {
      const [allSessions, skillTwin, feedbackRecords] = await Promise.all([
        getAllSessionsForReport(),
        fetchMySkillTwin(),
        fetchAllMyFeedback()
      ]);
      const savedAnalyses = getPersistedAIAnalyses(feedbackRecords);
      const sessionRows = allSessions.map(session => {
        const analysis = aiAnalyses[session.id] || savedAnalyses.get(session.id) || {};
        const feedback = [
          ...(analysis.strengths || []).map(item => `<li><strong>Strength:</strong> ${escapeHtml(item)}</li>`),
          ...(analysis.weaknesses || []).map(item => `<li><strong>Improve:</strong> ${escapeHtml(item)}</li>`),
          ...(analysis.recommendations || []).map(item => `<li><strong>Next step:</strong> ${escapeHtml(item)}</li>`)
        ].join('');
        return `<article><h2>${escapeHtml(getSessionTitle(session))}</h2>
          <p>${escapeHtml(formatReportDate(session.completedAt || session.createdAt))} · ${escapeHtml(session.status || 'Status unavailable')} · Score: ${escapeHtml(session.score ?? 'Unavailable')}</p>
          <p>Location: ${escapeHtml(session.fireLocation || 'Unavailable')} · Objectives completed: ${escapeHtml(session.objectivesCompleted ?? 'Unavailable')} · Safety violations: ${escapeHtml(session.safetyViolations ?? 'Unavailable')} · Procedure violation: ${session.procedureViolation === true ? 'Yes' : session.procedureViolation === false ? 'No' : 'Unavailable'}</p>
          <p>Total response: ${escapeHtml(session.unityMetrics?.totalResponseTime ?? 'Unavailable')} sec · Power isolation: ${escapeHtml(session.unityMetrics?.powerIsolationTime ?? 'Unavailable')} sec · Pin removal: ${escapeHtml(session.unityMetrics?.pinRemovalTime ?? 'Unavailable')} sec · Extinguishing: ${escapeHtml(session.unityMetrics?.extinguishingTime ?? 'Unavailable')} sec</p>
          ${feedback ? `<ul>${feedback}</ul>` : '<p>AI feedback has not been generated for this session.</p>'}</article>`;
      }).join('');
      const skills = Object.entries(skillTwin.skills || {}).map(([name, score]) =>
        `<tr><td>${escapeHtml(name.replace(/([A-Z])/g, ' $1'))}</td><td>${escapeHtml(score)} / 100</td></tr>`
      ).join('');
      reportWindow.document.open();
      reportWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>ResQVerse Training Report</title>
        <style>
          body{font:14px Arial,sans-serif;color:#172033;max-width:900px;margin:36px auto;padding:0 24px}
          h1{color:#9a3412}h2{font-size:18px;margin-bottom:6px}p{line-height:1.5;color:#475569}
          article{border-top:1px solid #cbd5e1;padding:16px 0}table{border-collapse:collapse;width:100%}
          td,th{border:1px solid #cbd5e1;padding:8px;text-align:left}ul{line-height:1.6}
          @media print{body{margin:0 auto}article{break-inside:avoid}}
        </style></head><body>
        <h1>ResQVerse Training Report</h1><p>Trainee: ${escapeHtml(user.name || 'Trainee')} · ${escapeHtml(user.email || '')}</p>
        <p>Generated: ${escapeHtml(new Date().toLocaleString())} · Overall Skill Twin: ${escapeHtml(skillTwin.overallScore ?? 'Unavailable')} / 100 · Sessions: ${allSessions.length}</p>
        <h2>Digital Skill Twin</h2><table><thead><tr><th>Skill</th><th>Score</th></tr></thead><tbody>${skills || '<tr><td colspan="2">No Skill Twin scores available.</td></tr>'}</tbody></table>
        <h2>Training history</h2>${sessionRows || '<p>No training sessions are available.</p>'}
        </body></html>`);
      reportWindow.document.close();
      reportWindow.focus();
      reportWindow.setTimeout(() => reportWindow.print(), 250);
    } catch (error) {
      reportWindow.close();
      setReportError(error.message || 'Could not generate your printable report.');
    } finally {
      setReportAction('');
    }
  };

  const handleGenerateAIAnalysis = async sessionId => {
    setAnalyzingSessionId(sessionId);
    setAnalysisErrors(current => ({ ...current, [sessionId]: '' }));
    try {
      const analysis = await analyzeTrainingSession(sessionId);
      setAiAnalyses(current => ({ ...current, [sessionId]: analysis }));
    } catch (error) {
      setAnalysisErrors(current => ({ ...current, [sessionId]: error.message || 'AI feedback could not be generated.' }));
    } finally {
      setAnalyzingSessionId('');
    }
  };

  const handleSimulationComplete = async () => {
    try {
      const sessionList = await fetchMySessions();
      const dashboardData = await fetchTraineeDashboard();
      setReports(Array.isArray(sessionList) ? sessionList : []);
      setLiveMetrics(dashboardData);
    } catch (err) {
      console.warn('Could not refresh training history:', err);
      setLoadError(true);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0910] text-slate-100 relative z-10">
      <aside className="dashboard-sidebar w-64 bg-[#13111c] border-r border-[#27213b]">
        <div>
          <div className="p-4 border-b border-[#27213b]">
            <button type="button" onClick={() => onNavigate('/')} aria-label="ResQVerse home" className="w-full flex items-center gap-3 rounded-lg text-left hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400">
            <div className="w-10 h-10 shrink-0 overflow-hidden rounded-xl shadow-lg shadow-purple-600/30">
              <img src="/images/VRlogo.jpeg" alt="ResQVerse logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="font-black tracking-tight text-white flex items-center gap-1.5">
                ResQVerse <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </h1>
              <p className="text-[10px] uppercase font-semibold text-purple-300 tracking-wider">VR Disaster Training</p>
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
              onClick={() => setActiveTab('trainings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'trainings' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-[#27213b]/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>My Trainings</span>
            </button>

            <button
              onClick={() => setActiveTab('skilltwin')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'skilltwin' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-[#27213b]/50'
              }`}
            >
              <Brain className="w-4 h-4 text-cyan-400" />
              <span>AI Skill Twin</span>
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
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <div className="w-9 h-9 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 text-sm">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="text-sm font-medium text-white hidden sm:inline">{user.name}</span>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8 flex-1">
          {isLoading && <div role="status" className="flex items-center gap-2 py-12 text-sm text-slate-400"><RefreshCw className="h-4 w-4 animate-spin" />Loading trainee data...</div>}
          {!isLoading && loadError && <div role="alert" className="flex items-center gap-3 py-12 text-sm text-red-300"><AlertCircle className="h-4 w-4" />Training data could not be loaded. Check your connection and refresh the page.</div>}
          {!isLoading && !loadError && <>
          {activeTab === 'dashboard' && (
            <>
              <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#13111c] border border-[#27213b] rounded-xl p-5"><span className="text-xs text-slate-400">Overall score</span><p className="mt-2 text-2xl font-bold text-white">{liveMetrics?.overallScore ?? '—'}</p></div>
                <div className="bg-[#13111c] border border-[#27213b] rounded-xl p-5"><span className="text-xs text-slate-400">Completed sessions</span><p className="mt-2 text-2xl font-bold text-white">{liveMetrics?.summary?.completedSessions ?? '—'}</p></div>
                <div className="bg-[#13111c] border border-[#27213b] rounded-xl p-5"><span className="text-xs text-slate-400">Average score</span><p className="mt-2 text-2xl font-bold text-white">{liveMetrics?.summary?.averageScore ?? '—'}</p></div>
              </section>
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">My Trainings</h3>
                  <button onClick={() => setActiveTab('trainings')} className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {allScenarios.filter(s => isScenarioAllowed(s.type)).map((t) => {
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
                          {typeof t.progress === 'number' && <div className="mb-5"><div className="mb-2 flex justify-between text-xs font-semibold"><span className="text-slate-400">Progress</span><span className="text-purple-400">{t.progress}%</span></div><div className="h-2 w-full overflow-hidden rounded-full bg-[#0a0910]"><div className="h-full rounded-full bg-purple-600" style={{ width: `${Math.max(0, Math.min(100, t.progress))}%` }} /></div></div>}
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
                  {allScenarios.filter(s => isScenarioAllowed(s.type)).length === 0 && <p className="col-span-full py-8 text-center text-sm text-slate-400">No additional scenarios are available. Start an assigned training below.</p>}
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
                    {assignments.map(item => (
                      <div key={item.assignmentId || item.id} className="p-4 rounded-xl bg-[#0a0910] border border-[#27213b] flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm text-white mb-0.5">{item.simulationType}{item.fireLocation ? ` — ${item.fireLocation}` : ''}</h4>
                          <p className="text-xs text-slate-400">Assigned by trainer • Due: {formatAssignmentDate(item.dueAt)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            {item.status}
                          </span>
                          {item.status !== 'completed' && item.status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => startAssignedTraining(item)}
                              disabled={!(item.assignmentId || item.id) || !item.scenarioId}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Play className="h-3.5 w-3.5" />Start Training
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {assignments.length === 0 && <p className="text-sm text-slate-400">No scenarios have been assigned to you yet.</p>}
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
                            <h4 className="font-semibold text-sm text-white mb-0.5">{getSessionTitle(rep)}</h4>
                            <p className="text-xs text-slate-400">{getSessionDate(rep)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            typeof rep.score === 'number' && rep.score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700/40 text-slate-300 border border-slate-600'
                          }`}>
                            {typeof rep.score === 'number' ? `Score ${rep.score}%` : 'Score unavailable'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {reports.length === 0 && <p className="py-4 text-sm text-slate-400">No training sessions are available yet.</p>}
                  </div>
                </section>
              </div>
            </>
          )}
          {activeTab === 'trainings' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">All VR Disaster Simulations</h2>
              <p className="text-xs text-slate-400 mb-6">Access available scenarios or request permissions for locked modules from your Admin/Trainer.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {allScenarios.filter(s => isScenarioAllowed(s.type)).map((t) => {
                  const Icon = t.icon;
                  const allowed = isScenarioAllowed(t.type);
                  return (
                    <div key={t.id} className={`bg-[#13111c] border rounded-2xl p-6 flex flex-col justify-between transition-all ${allowed ? 'border-[#27213b] hover:border-purple-500/50' : 'border-[#27213b]/40 opacity-70'}`}>
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${allowed ? 'bg-purple-600/10 border border-purple-500/20 text-purple-400' : 'bg-slate-800/40 text-slate-500'}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          {!allowed && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Locked
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">{t.category}</span>
                        <h4 className="font-bold text-white text-lg mt-1 mb-2">{t.title}</h4>
                        <p className="text-xs text-slate-400 mb-6 leading-relaxed">{t.description}</p>
                      </div>
                      {allowed ? (
                        <button
                          onClick={() => setActiveSimulation(t)}
                          className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          <span>Launch VR Simulation</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-[#27213b]/40 text-slate-500 flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Permission Required</span>
                        </button>
                      )}
                    </div>
                  );
                })}
                {allScenarios.filter(s => isScenarioAllowed(s.type)).length === 0 && <p className="col-span-full py-8 text-center text-sm text-slate-400">No authorized scenarios are available.</p>}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Assigned Trainings</h2>
              <div className="space-y-4">
                {assignments.map(item => (
                  <div key={item.assignmentId || item.id} className="p-5 rounded-xl bg-[#0a0910] border border-[#27213b] flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h4 className="font-bold text-base text-white mb-1">{item.simulationType}{item.fireLocation ? ` — ${item.fireLocation}` : ''}</h4>
                      <p className="text-xs text-slate-400">Assigned by trainer • Due: <span className="text-purple-400 font-medium">{formatAssignmentDate(item.dueAt)}</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        Status: {item.status}
                      </span>
                      {item.status !== 'completed' && item.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => startAssignedTraining(item)}
                          disabled={!(item.assignmentId || item.id) || !item.scenarioId}
                          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Play className="h-4 w-4" />Start Training
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {assignments.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No scenarios have been assigned to you yet.</p>}
              </div>
            </div>
          )}

          {activeTab === 'skilltwin' && (
            <div className="space-y-6">
              <SkillTwinPanel user={user} />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Detailed VR Performance Reports</h2>
                  <p className="mt-1 text-sm text-slate-400">Generate AI feedback for completed sessions or export your full training history.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadReport}
                    disabled={Boolean(reportAction)}
                    className="inline-flex items-center gap-2 rounded-lg border border-purple-500/40 px-4 py-2 text-sm font-semibold text-purple-200 hover:bg-purple-500/10 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    {reportAction === 'csv' ? 'Preparing CSV…' : 'Download CSV'}
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintReport}
                    disabled={Boolean(reportAction)}
                    className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
                  >
                    <Printer className="h-4 w-4" />
                    {reportAction === 'pdf' ? 'Preparing report…' : 'Print / Save PDF'}
                  </button>
                </div>
              </div>
              {reportError && <p role="alert" className="text-sm text-red-300">{reportError}</p>}
              <div className="space-y-4">
                {reports.map((rep) => {
                  const analysis = aiAnalyses[rep.id];
                  const isCompleted = rep.status?.toLowerCase() === 'completed';
                  return (
                  <div key={rep.id} className="bg-[#13111c] border border-[#27213b] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#27213b] flex-wrap gap-2">
                      <div>
                        <h3 className="font-bold text-lg text-white">{getSessionTitle(rep)}</h3>
                        <p className="text-xs text-slate-400">{getSessionDate(rep)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">Status: <strong className="text-white">{rep.status || 'Unavailable'}</strong></span>
                        <span className="px-3 py-1.5 rounded-xl text-sm font-bold bg-slate-700/40 text-slate-200 border border-slate-600">
                          {typeof rep.score === 'number' ? `Score: ${rep.score}%` : 'Score unavailable'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleGenerateAIAnalysis(rep.id)}
                          disabled={!isCompleted || analyzingSessionId === rep.id}
                          className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {analyzingSessionId === rep.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                          {analyzingSessionId === rep.id ? 'Analyzing…' : analysis ? 'Refresh AI Feedback' : 'Generate AI Feedback'}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-[#0a0910] border border-[#27213b]">
                        <span className="font-semibold text-slate-400 block mb-1">Training Time</span>
                        <p className="text-white font-semibold">
                          {typeof rep.unityMetrics?.totalResponseTime === 'number'
                            ? `${rep.unityMetrics.totalResponseTime.toFixed(2)} sec`
                            : 'Unavailable'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#0a0910] border border-[#27213b]">
                        <span className="font-semibold text-slate-400 block mb-1">Power Isolation</span>
                        <p className="text-white font-semibold">
                          {typeof rep.unityMetrics?.powerIsolationTime === 'number'
                            ? `${rep.unityMetrics.powerIsolationTime.toFixed(2)} sec`
                            : 'Unavailable'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#0a0910] border border-[#27213b]">
                        <span className="font-semibold text-slate-400 block mb-1">Extinguisher Pin Removal</span>
                        <p className="text-white font-semibold">
                          {typeof rep.unityMetrics?.pinRemovalTime === 'number'
                            ? `${rep.unityMetrics.pinRemovalTime.toFixed(2)} sec`
                            : 'Unavailable'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#0a0910] border border-[#27213b]">
                        <span className="font-semibold text-slate-400 block mb-1">Extinguishing Time</span>
                        <p className="text-white font-semibold">
                          {typeof rep.unityMetrics?.extinguishingTime === 'number'
                            ? `${rep.unityMetrics.extinguishingTime.toFixed(2)} sec`
                            : 'Unavailable'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#0a0910] border border-[#27213b]">
                        <span className="font-semibold text-slate-400 block mb-1">Objectives Completed</span>
                        <p className="text-white font-semibold">
                          {rep.objectivesCompleted ?? 'Unavailable'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#0a0910] border border-[#27213b]">
                        <span className="font-semibold text-slate-400 block mb-1">Safety Violations</span>
                        <p className="text-white font-semibold">
                          {rep.safetyViolations ?? 'Unavailable'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#0a0910] border border-[#27213b]">
                        <span className="font-semibold text-slate-400 block mb-1">Procedure Violation</span>
                        <p className="text-white font-semibold">
                          {rep.procedureViolation === true
                            ? 'Yes'
                            : rep.procedureViolation === false
                              ? 'No'
                              : 'Unavailable'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#0a0910] border border-[#27213b] sm:col-span-2 lg:col-span-3">
                        <span className="font-semibold text-slate-400 block mb-1">Fire Location</span>
                        <p className="text-white font-semibold">
                          {rep.fireLocation || 'Unavailable'}
                        </p>
                      </div>
                    </div>
                    {analysis && (
                      <section className="mt-5 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4" aria-label="AI session feedback">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-semibold text-cyan-200">AI feedback</h4>
                          <span className="text-xs text-slate-300">Risk: {analysis.riskLevel || 'Unavailable'} · Score: {analysis.performanceScore ?? 'Unavailable'}</span>
                        </div>
                        <div className="grid gap-4 text-sm sm:grid-cols-3">
                          {[
                            ['Strengths', analysis.strengths, 'text-emerald-300'],
                            ['Areas to improve', analysis.weaknesses, 'text-amber-300'],
                            ['Recommendations', analysis.recommendations, 'text-cyan-200']
                          ].map(([title, items, color]) => (
                            <div key={title}>
                              <h5 className={`mb-1 font-medium ${color}`}>{title}</h5>
                              {Array.isArray(items) && items.length > 0
                                ? <ul className="list-disc space-y-1 pl-5 text-slate-300">{items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul>
                                : <p className="text-slate-400">No details provided.</p>}
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                    {analysisErrors[rep.id] && <p role="alert" className="mt-3 text-sm text-red-300">{analysisErrors[rep.id]}</p>}
                  </div>
                );})}
                {reports.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No training history is available yet.</p>}
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
                  <input type="text" defaultValue={user.department || ''} className="w-full bg-[#0a0910] border border-[#27213b] rounded-xl px-4 py-3 text-white" />
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
          </>}
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
