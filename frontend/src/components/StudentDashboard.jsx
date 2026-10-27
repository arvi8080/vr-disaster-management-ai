import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, ClipboardList, FileText, User as UserIcon, LogOut, Flame, Droplets, Wind, Play, ChevronRight, Shield, Sparkles, Lock, Cpu, Brain, AlertCircle, RefreshCw, Download, Printer } from 'lucide-react';
import VRSimulatorModal from './VRSimulatorModal';
import SkillTwinPanel from './SkillTwinPanel';
import { fetchTraineeDashboard } from '../services/dashboardService';
import { fetchScenarios } from '../services/scenarioService';
import { fetchAllMySessions, fetchAssignmentsForMe, fetchMySessions } from '../services/trainingService';
import { analyzeTrainingSession } from '../services/aiService';
import ThemeToggle from './ThemeToggle';
import { formatEventDate, formatReportDate, reportDate, timestampMillis } from '../utils/reportDate';
import { getSafetyPracticeObjective, getSafetyViolationDetail, getUnityEventLabel, getUnitySequence, getUnityTiming } from '../utils/unityReportEvidence';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function csvCell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function formatSeconds(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? `${value.toFixed(2)} s`
    : 'N/A';
}

function MetaQuestInstallLink() {
  return (
    <a
      href="https://www.meta.com/s/bN5WqMkD4"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-purple-500/40 px-3 py-2 text-xs font-semibold text-purple-200 hover:bg-purple-500/10"
    >
      <Download className="h-4 w-4" />
      Install on Meta Quest
    </a>
  );
}

function formatUnityTiming(timing, actionResult) {
  if (actionResult === 'Not completed') return 'Not completed';
  if (timing.seconds === null) {
    return actionResult === 'Completed' ? 'Completed; duration unavailable' : 'Unavailable';
  }
  return formatSeconds(timing.seconds);
}

function getUnityEvents(session) {
  return Array.isArray(session.performanceFeatures?.events)
    ? session.performanceFeatures.events
    : [];
}

function getActionResult(session, flag, eventType) {
  const value = session[flag] ?? session.performanceFeatures?.objectiveFlags?.[flag];
  if (typeof value === 'boolean') return value ? 'Completed' : 'Not completed';
  return getUnityEvents(session).some(event => event.eventType === eventType)
    ? 'Completed'
    : 'Unknown / not assessed';
}

function getAttemptNumber(sessions, session) {
  const sessionDate = timestampMillis(session.completedAt || session.createdAt);
  const sameScenario = sessions.filter(item =>
    (item.scenarioId || item.simulationType) === (session.scenarioId || session.simulationType)
  );
  const ordered = sameScenario
    .slice()
    .sort((a, b) => timestampMillis(a.completedAt || a.createdAt) - timestampMillis(b.completedAt || b.createdAt));
  const index = ordered.findIndex(item => item.id === session.id);
  if (index >= 0) return index + 1;
  return sameScenario.filter(item => timestampMillis(item.completedAt || item.createdAt) <= sessionDate).length || 1;
}

function getSessionStatus(session) {
  const status = String(session.status || session.completionStatus || '').toLowerCase();
  if (status === 'completed') return 'Completed';
  if (status === 'abandoned' || status === 'cancelled') return 'Abandoned';
  return 'Incomplete';
}

function getEvidenceFeedback(session) {
  const events = getUnityEvents(session);
  const strengths = [];
  const improvements = [];
  const practice = [];

  for (const [flag, label] of [
    ['powerWasTurnedOff', 'Power isolation'],
    ['pinWasRemoved', 'Extinguisher pin removal']
  ]) {
    const result = getActionResult(session, flag, flag === 'powerWasTurnedOff' ? 'POWER_ISOLATED' : 'EXTINGUISHER_PIN_REMOVED');
    if (result === 'Completed') strengths.push(`${label} was recorded as completed.`);
    if (result === 'Not completed') {
      improvements.push(`${label} was recorded as not completed.`);
      practice.push(`Practice the ${label.toLowerCase()} step in the next fire-safety run.`);
    }
  }

  const fireWasExtinguished = session.fireWasExtinguished ?? session.performanceFeatures?.fireWasExtinguished;
  if (fireWasExtinguished === true || events.some(event => event.eventType === 'FIRE_EXTINGUISHED')) {
    strengths.push('Unity recorded that the fire was extinguished.');
  } else if (fireWasExtinguished === false) {
    improvements.push('Unity did not record the fire as extinguished.');
    practice.push('Practice extinguisher operation until the fire-extinguished objective is recorded.');
  }

  const violations = events.filter(event => event.eventType === 'SAFETY_VIOLATION');
  if (violations.length > 0 || session.procedureViolation === true) {
    improvements.push('A procedural violation was recorded.');
    practice.push('Review the recorded procedure event with a trainer before repeating the simulation.');
  } else if (session.procedureViolation === false || session.safetyViolations === 0) {
    strengths.push('Unity recorded no procedural violations.');
  }

  return { strengths, improvements, practice };
}

function getFeedbackEvidence(session, text) {
  const lowerText = text.toLowerCase();
  const violations = getUnityEvents(session).filter(event => event.eventType === 'SAFETY_VIOLATION');
  if (lowerText.includes('practice') && violations.length > 0) {
    return violations.map(event =>
      `${getSafetyViolationDetail(session, event)} (${formatEventDate(event.timestamp)})`
    ).join('; ');
  }
  if (lowerText.includes('power')) {
    return `${getActionResult(session, 'powerWasTurnedOff', 'POWER_ISOLATED')}; recorded Unity power flag/event`;
  }
  if (lowerText.includes('pin')) {
    return `${getActionResult(session, 'pinWasRemoved', 'EXTINGUISHER_PIN_REMOVED')}; recorded Unity pin flag/event`;
  }
  if (lowerText.includes('fire') || lowerText.includes('extinguisher')) {
    const result = session.fireWasExtinguished ?? session.performanceFeatures?.fireWasExtinguished;
    return typeof result === 'boolean'
      ? `fireWasExtinguished=${result}`
      : getUnityEvents(session).some(event => event.eventType === 'FIRE_EXTINGUISHED')
        ? 'FIRE_EXTINGUISHED event recorded'
        : 'No fire outcome event recorded';
  }
  if (lowerText.includes('procedur')) {
    return violations.length
      ? violations.map(event => `${getUnityEventLabel(event.eventType)}${event.timestamp !== undefined && event.timestamp !== null ? ` at ${formatEventDate(event.timestamp)}` : ''}: ${getSafetyViolationDetail(session, event)}`).join('; ')
      : `procedureViolation=${session.procedureViolation ?? 'unknown'}`;
  }
  return 'No specific recorded event was available.';
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
    return reportDate(value)?.toLocaleString() || 'Not specified';
  };
  const getSessionDate = (session) => {
    const value = session.completedAt || session.createdAt;
    return formatReportDate(value);
  };

  const getAllSessionsForReport = async () => {
    const allSessions = await fetchAllMySessions();
    return allSessions.sort((a, b) =>
      timestampMillis(b.completedAt ?? b.createdAt) - timestampMillis(a.completedAt ?? a.createdAt)
    );
  };

  const handleDownloadReport = async () => {
    setReportAction('csv');
    setReportError('');
    try {
      const allSessions = await getAllSessionsForReport();
      const rows = [
        ['Trainee name', user.name || 'Unavailable', 'Trainee email', user.email || 'Unavailable'],
        ['Report type', 'Computer Lab Fire Safety evidence report', 'Training sessions', allSessions.length],
        [],
        ['Session number', 'Scenario', 'Date/time', 'Status', 'Duration', 'Power isolation', 'Pin removal', 'Fire extinguished', 'Action sequence', 'Safety violations', 'Recorded events']
      ];
      allSessions.forEach(session => {
        const events = getUnityEvents(session);
        rows.push([
          getAttemptNumber(allSessions, session),
          getSessionTitle(session),
          formatReportDate(session.completedAt || session.createdAt),
          getSessionStatus(session),
          formatSeconds(session.unityMetrics?.totalResponseTime ?? session.duration),
          getActionResult(session, 'powerWasTurnedOff', 'POWER_ISOLATED'),
          getActionResult(session, 'pinWasRemoved', 'EXTINGUISHER_PIN_REMOVED'),
          getActionResult(session, 'fireWasExtinguished', 'FIRE_EXTINGUISHED'),
          getProcedureSequence(session),
          Number.isFinite(session.safetyViolations)
            ? Math.max(session.safetyViolations, events.filter(event => event.eventType === 'SAFETY_VIOLATION').length)
            : events.filter(event => event.eventType === 'SAFETY_VIOLATION').length || 'Unknown',
          events.map(event => `${getUnityEventLabel(event.eventType)}${event.timestamp !== undefined && event.timestamp !== null ? ` @ ${formatEventDate(event.timestamp)}` : ''}`).join('; ') || 'No event history recorded'
        ]);
      });

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
      const allSessions = await getAllSessionsForReport();
      const sessionRows = allSessions.map(session => {
        const attempt = getAttemptNumber(allSessions, session);
        const events = getUnityEvents(session);
        const scenarioSessions = allSessions.filter(item =>
          (item.scenarioId || item.simulationType) === (session.scenarioId || session.simulationType)
        );
        const sessionTime = timestampMillis(session.completedAt || session.createdAt);
        const previousSession = scenarioSessions
          .filter(item => item.id !== session.id && timestampMillis(item.completedAt || item.createdAt) < sessionTime)
          .sort((a, b) => timestampMillis(b.completedAt || b.createdAt) - timestampMillis(a.completedAt || a.createdAt))[0];
        const feedback = getEvidenceFeedback(session);
        const actionResult = (label, result, evidence) => `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(result)}</td><td>${escapeHtml(evidence)}</td></tr>`;
        const powerResult = getActionResult(session, 'powerWasTurnedOff', 'POWER_ISOLATED');
        const pinResult = getActionResult(session, 'pinWasRemoved', 'EXTINGUISHER_PIN_REMOVED');
        const fireFlag = session.fireWasExtinguished ?? session.performanceFeatures?.fireWasExtinguished;
        const fireResult = typeof fireFlag === 'boolean'
          ? fireFlag ? 'Completed' : 'Not completed'
          : events.some(event => event.eventType === 'FIRE_EXTINGUISHED') ? 'Completed' : 'Unknown / not assessed';
        const objectivesCompleted = session.objectivesCompleted ?? session.performanceFeatures?.objectivesCompleted;
        const violations = events.filter(event => event.eventType === 'SAFETY_VIOLATION');
        const violationCount = Number.isFinite(session.safetyViolations)
          ? Math.max(session.safetyViolations, violations.length)
          : violations.length || (session.procedureViolation === true ? 1 : null);
        const sequence = getUnitySequence(session);
        const violationDetails = violations.length > 0
          ? [...new Set(violations.map(event => getSafetyViolationDetail(session, event)))]
          : violationCount > 0
            ? [sequence.detail || 'Unity recorded a safety violation but did not record its specific cause.']
            : [];
        const violationList = violations.map(event => {
          const action = event.metadata?.action || event.action || getUnityEventLabel(event.eventType);
          const time = formatEventDate(event.timestamp);
          const reason = event.metadata?.reason
            || event.reason
            || getSafetyViolationDetail(session, event);
          return `<li>${escapeHtml(action)} — ${escapeHtml(time)}. ${escapeHtml(reason)}</li>`;
        }).join('');
        const objectiveSequence = sequence.result;
        const sequenceEvidence = objectiveSequence === 'Unknown / not assessed'
          ? 'Timestamped power, pin, and extinguisher-start events are required.'
          : sequence.detail || 'Expected order: isolate power, remove pin, then begin extinguisher operation.';
        const renderFeedbackItem = (item, interpretation) => `<li><strong>Observation:</strong> ${escapeHtml(item)} <strong>Evidence:</strong> ${escapeHtml(getFeedbackEvidence(session, item))} <strong>Interpretation:</strong> ${escapeHtml(interpretation)}</li>`;
        const strengthItems = feedback.strengths
          .map(item => renderFeedbackItem(item, 'This action was recorded in this attempt only.'))
          .join('');
        const improvementItems = feedback.improvements
          .filter(item => !item.toLowerCase().includes('procedural violation'))
          .concat(violationDetails.map(detail => `Safety finding: ${detail}`))
          .filter((item, index, items) => items.indexOf(item) === index)
          .map(item => renderFeedbackItem(item, 'This is a recorded gap for this attempt; it is not a long-term competency judgment.'))
          .join('');
        const practiceRecommendations = violationCount > 0
          ? [getSafetyPracticeObjective(session), ...feedback.practice.filter(item => !item.toLowerCase().includes('procedure violation'))]
          : feedback.practice;
        const practiceItems = practiceRecommendations
          .filter((item, index, items) => items.indexOf(item) === index)
          .map(item => `<li><strong>Recommendation:</strong> ${escapeHtml(item)} <strong>Evidence basis:</strong> ${escapeHtml(getFeedbackEvidence(session, item))}</li>`)
          .join('');
        const eventRows = events.map(event => `<li>${escapeHtml(getUnityEventLabel(event.eventType))} — ${escapeHtml(formatEventDate(event.timestamp))}</li>`).join('');
        const totalTiming = getUnityTiming(session, 'totalResponseTime');
        const duration = totalTiming.seconds ?? session.duration;
        const powerTiming = getUnityTiming(session, 'powerIsolationTime');
        const pinTiming = getUnityTiming(session, 'pinRemovalTime');
        const extinguishingTiming = getUnityTiming(session, 'extinguishingTime');
        const timingComparisons = previousSession
          ? [
              ['Power isolation', 'powerIsolationTime'],
              ['Pin removal', 'pinRemovalTime'],
              ['Extinguishing', 'extinguishingTime'],
              ['Total response', 'totalResponseTime']
            ].flatMap(([label, metric]) => {
              const earlier = getUnityTiming(previousSession, metric).seconds;
              const current = getUnityTiming(session, metric).seconds;
              if (earlier === null || current === null) return [];
              const difference = Math.abs(earlier - current);
              const comparison = current < earlier
                ? `faster by ${difference.toFixed(2)} s`
                : current > earlier
                  ? `slower by ${difference.toFixed(2)} s`
                  : 'unchanged';
              return [`${label}: ${comparison}`];
            })
          : [];
        const timingWarnings = [totalTiming, powerTiming, pinTiming, extinguishingTiming]
          .filter(timing => timing.warning)
          .map(timing => `<li>${escapeHtml(timing.warning)}</li>`)
          .join('');
        const initialLabel = attempt === 1 ? 'Initial assessment (first attempt)' : `Attempt ${attempt}`;
        const status = getSessionStatus(session);
        const sessionSummary = `Session ${attempt}: ${getSessionTitle(session)}. ${status}.`;
        const twinProgress = attempt === 1
          ? 'This first attempt establishes an initial baseline only; it does not establish a stable competency profile or long-term trend.'
          : previousSession
            ? `Compared with attempt ${getAttemptNumber(allSessions, previousSession)}: power isolation ${getActionResult(previousSession, 'powerWasTurnedOff', 'POWER_ISOLATED')} → ${powerResult}; pin removal ${getActionResult(previousSession, 'pinWasRemoved', 'EXTINGUISHER_PIN_REMOVED')} → ${pinResult}.${timingComparisons.length ? ` Response times: ${timingComparisons.join('; ')}.` : ' Response-time comparison unavailable because a required time was not recorded.'} This is an attempt-level comparison, not a stable competency trend.`
            : `Attempt ${attempt} is available for comparison with earlier sessions; no stable competency or trend is inferred from a single attempt.`;
        const recurringViolationAttempts = scenarioSessions.filter(item =>
          item.procedureViolation === true
          || (Number.isFinite(item.safetyViolations) && item.safetyViolations > 0)
          || getUnityEvents(item).some(event => event.eventType === 'SAFETY_VIOLATION')
        ).length;
        const nextObjective = objectiveSequence === 'Out of sequence' || violationCount > 0
          ? getSafetyPracticeObjective(session)
          : feedback.practice[0]
            || (attempt === 1
              ? 'Repeat Computer Lab Fire Safety to establish a second attempt and confirm all required actions are recorded.'
              : 'No corrective objective can be selected from the available recorded evidence.');
        return `<article>
          <h2>${escapeHtml(sessionSummary)}</h2>
          <h3>01 — Session overview</h3>
          <table><tbody>
            <tr><th>Simulation</th><td>${escapeHtml(getSessionTitle(session))}</td><th>Attempt type</th><td>${escapeHtml(initialLabel)}</td></tr>
            <tr><th>Fire location</th><td>${escapeHtml(session.fireLocation || 'Not recorded')}</td><th>Session number</th><td>${escapeHtml(attempt)}</td></tr>
            <tr><th>Date/time</th><td>${escapeHtml(formatReportDate(session.completedAt || session.createdAt))}</td><th>Status</th><td>${escapeHtml(status)}</td></tr>
            <tr><th>Total response time</th><td>${escapeHtml(formatSeconds(duration))}</td><th>Recorded objectives completed</th><td>${escapeHtml(objectivesCompleted ?? 'Unknown')}</td></tr>
            <tr><th>Action evidence</th><td colspan="3">Power isolation, pin removal, and extinguisher operation are reported as separate action observations; action completion alone is not a proficiency score.</td></tr>
            <tr><th>Recorded safety violations</th><td colspan="3">${escapeHtml(violationCount ?? 'Unknown')}</td></tr>
            <tr><th>Safety outcome</th><td colspan="3">${escapeHtml(violationCount > 0
              ? `Unsafe completion — ${violationDetails.join('; ')}`
              : violationCount === 0 && status === 'Completed'
                ? 'Completed with no recorded violations'
                : 'Unknown / incomplete')}</td></tr>
          </tbody></table>
          <h3>02 — Required action assessment</h3>
          <table><thead><tr><th>Action</th><th>Result</th><th>Evidence</th></tr></thead><tbody>
            ${actionResult('Power isolation', powerResult, 'Unity action flag or POWER_ISOLATED event')}
            ${actionResult('Extinguisher pin removal', pinResult, 'Unity action flag or EXTINGUISHER_PIN_REMOVED event')}
            ${actionResult('Extinguisher operation', fireResult, 'Unity fire result flag or FIRE_EXTINGUISHED event')}
            ${actionResult('Correct action sequence', objectiveSequence, sequenceEvidence)}
          </tbody></table>
          <h3>03 — Response metrics</h3>
          <table><thead><tr><th>Metric</th><th>Result</th><th>Start → end definition</th></tr></thead><tbody>
            <tr><td>Time to isolate power</td><td>${escapeHtml(formatUnityTiming(powerTiming, powerResult))}</td><td>Scenario started → power isolated (${escapeHtml(powerTiming.source)})</td></tr>
            <tr><td>Time to remove pin</td><td>${escapeHtml(formatUnityTiming(pinTiming, pinResult))}</td><td>Scenario started → pin removed (${escapeHtml(pinTiming.source)})</td></tr>
            <tr><td>Time to extinguish</td><td>${escapeHtml(formatUnityTiming(extinguishingTiming, fireResult))}</td><td>Extinguisher operation started → fire extinguished (${escapeHtml(extinguishingTiming.source)})</td></tr>
            <tr><td>Total response time</td><td>${escapeHtml(status === 'Completed' ? formatSeconds(duration) : 'Not completed')}</td><td>Scenario started → scenario completed (${escapeHtml(totalTiming.source)})</td></tr>
          </tbody></table>
          ${timingWarnings ? `<p><strong>Timing validation:</strong><ul>${timingWarnings}</ul></p>` : ''}
          <h3>04 — Safety events</h3>
          ${violationList ? `<ul>${violationList}</ul>` : violationCount === 0 ? '<p>No procedural violation was recorded.</p>' : `<ul>${violationDetails.map(detail => `<li>${escapeHtml(detail)} (event time unavailable)</li>`).join('')}</ul>`}
          <h3>05 — Evidence-based performance feedback</h3>
          <p>Feedback below is generated only from recorded action flags and events.</p>
          <div class="feedback"><strong>What went well</strong><ul>${strengthItems || '<li>No verified successful action recorded.</li>'}</ul>
          <strong>What needs improvement</strong><ul>${improvementItems || '<li>No specific recorded mistake available.</li>'}</ul>
          <strong>Recommended practice</strong><ul>${practiceItems || '<li>No corrective exercise assigned from the available evidence.</li>'}</ul></div>
          <h3>06 — Attempt-to-attempt progress</h3>
          <p>${escapeHtml(twinProgress)}</p>
          ${recurringViolationAttempts > 1 ? `<p>Recurring evidence: a procedural violation was recorded in ${recurringViolationAttempts} attempts for this scenario.</p>` : '<p>No recurring procedural error is established from the available attempts.</p>'}
          <p><strong>Recommended next training objective:</strong> ${escapeHtml(nextObjective)}</p>
          <p>Actions recorded as completed (not a proficiency rating): ${escapeHtml([
            ...(powerResult === 'Completed' ? ['Power isolation'] : []),
            ...(pinResult === 'Completed' ? ['Extinguisher pin removal'] : []),
            ...(fireResult === 'Completed' ? ['Fire extinguishing'] : [])
          ].join(', ') || 'None established from the available evidence')}</p>
          <p>Session history contains ${allSessions.length} attempt(s). Recurring errors or long-term trends are not claimed unless repeated evidence is available.</p>
          <details><summary>Recorded event history</summary><ul>${eventRows || '<li>No timestamped event history available.</li>'}</ul></details>
        </article>`;
      }).join('');
      reportWindow.document.open();
      reportWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>ResQVerse Training Report</title>
        <style>
          body{font:14px Arial,sans-serif;color:#172033;max-width:900px;margin:36px auto;padding:0 24px}
          h1{color:#9a3412}h2{font-size:20px;margin-bottom:6px}h3{font-size:16px;margin:22px 0 8px;color:#9a3412}p{line-height:1.5;color:#475569}
          article{border-top:2px solid #cbd5e1;padding:16px 0;break-inside:avoid}table{border-collapse:collapse;width:100%;margin:8px 0 16px}
          td,th{border:1px solid #cbd5e1;padding:8px;text-align:left;vertical-align:top}ul{line-height:1.6}
          .feedback{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.feedback ul{padding-left:20px}
          @media print{body{margin:0 auto}article{break-inside:avoid}}
        </style></head><body>
        <h1>ResQVerse Computer Lab Fire Safety Report</h1>
        <p><strong>Trainee:</strong> ${escapeHtml(user.name || 'Unavailable')} · <strong>Email:</strong> ${escapeHtml(user.email || 'Unavailable')}</p>
        <p>Generated: ${escapeHtml(new Date().toLocaleString())} · Reported sessions: ${allSessions.length}</p>
        ${sessionRows || '<p>No training sessions are available.</p>'}
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
                <div className="bg-[#13111c] border border-[#27213b] rounded-xl p-5"><span className="text-xs text-slate-400">Most recently evaluated score</span><p className="mt-2 text-2xl font-bold text-white">{liveMetrics?.summary?.latestScore !== undefined && liveMetrics?.summary?.latestScore !== null ? `${liveMetrics.summary.latestScore}/100` : '—'}</p></div>
                <div className="bg-[#13111c] border border-[#27213b] rounded-xl p-5"><span className="text-xs text-slate-400">Completed sessions</span><p className="mt-2 text-2xl font-bold text-white">{liveMetrics?.summary?.completedSessions ?? '—'}</p></div>
                <div className="bg-[#13111c] border border-[#27213b] rounded-xl p-5">
                  <p className={`text-xs font-semibold ${
                    liveMetrics?.summary?.latestScore === null || liveMetrics?.summary?.latestScore === undefined
                      ? 'text-slate-400'
                      : liveMetrics.summary.latestScore >= 40
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                  }`}>
                    {liveMetrics?.summary?.latestScore === null || liveMetrics?.summary?.latestScore === undefined
                      ? 'Pass mark: 40/100 · Not evaluated'
                      : liveMetrics.summary.latestScore >= 40
                        ? 'Pass mark: 40/100 · Passing'
                        : 'Pass mark: 40/100 ·'}
                  </p>
                </div>
              </section>
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">My Trainings</h3>
                  <div className="flex items-center gap-3">
                    <MetaQuestInstallLink />
                    <button onClick={() => setActiveTab('trainings')} className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                      View all <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-white">All VR Disaster Simulations</h2>
                <MetaQuestInstallLink />
              </div>
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
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-white">Assigned Trainings</h2>
                <MetaQuestInstallLink />
              </div>
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
                        {rep.sourceSystem === 'unity' ? (
  <>
    <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-700/40 text-slate-200 border border-slate-600">
      Evidence report · {typeof rep.score === 'number' ? `Score: ${rep.score}%` : 'score not calculated'}
    </span>

    <button
      type="button"
      onClick={() => handleGenerateAIAnalysis(rep.id)}
      disabled={!isCompleted || analyzingSessionId === rep.id}
      className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {analyzingSessionId === rep.id ? (
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Sparkles className="h-3.5 w-3.5" />
      )}
      {analyzingSessionId === rep.id
        ? 'Analyzing…'
        : analysis
          ? 'Refresh AI Feedback'
          : 'Generate AI Feedback'}
    </button>
  </>
) : (
  <>
    <span className="px-3 py-1.5 rounded-xl text-sm font-bold bg-slate-700/40 text-slate-200 border border-slate-600">
      {typeof rep.score === 'number' ? `Score: ${rep.score}%` : 'Score unavailable'}
    </span>

    <button
      type="button"
      onClick={() => handleGenerateAIAnalysis(rep.id)}
      disabled={!isCompleted || analyzingSessionId === rep.id}
      className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {analyzingSessionId === rep.id ? (
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Sparkles className="h-3.5 w-3.5" />
      )}
      {analyzingSessionId === rep.id
        ? 'Analyzing…'
        : analysis
          ? 'Refresh AI Feedback'
          : 'Generate AI Feedback'}
    </button>
  </>
)}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-[#0a0910] border border-[#27213b]">
                        <span className="font-semibold text-slate-400 block mb-1">Training Time</span>
                        <p className="text-white font-semibold">
                          {typeof rep.unityMetrics?.totalResponseTime === 'number'
                            ? `${rep.unityMetrics.totalResponseTime.toFixed(2)} s`
                            : 'Unavailable'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#0a0910] border border-[#27213b]">
                        <span className="font-semibold text-slate-400 block mb-1">Power Isolation</span>
                        <p className="text-white font-semibold">
                          {typeof rep.unityMetrics?.powerIsolationTime === 'number'
                            ? `${rep.unityMetrics.powerIsolationTime.toFixed(2)} s`
                            : 'Unavailable'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#0a0910] border border-[#27213b]">
                        <span className="font-semibold text-slate-400 block mb-1">Extinguisher Pin Removal</span>
                        <p className="text-white font-semibold">
                          {typeof rep.unityMetrics?.pinRemovalTime === 'number'
                            ? `${rep.unityMetrics.pinRemovalTime.toFixed(2)} s`
                            : 'Unavailable'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#0a0910] border border-[#27213b]">
                        <span className="font-semibold text-slate-400 block mb-1">Extinguishing Time</span>
                        <p className="text-white font-semibold">
                          {typeof rep.unityMetrics?.extinguishingTime === 'number'
                            ? `${rep.unityMetrics.extinguishingTime.toFixed(2)} s`
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
