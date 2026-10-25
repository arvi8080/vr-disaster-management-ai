import React, { useEffect, useState } from 'react';
import { AlertCircle, Brain, RefreshCw } from 'lucide-react';
import { fetchMySkillTwin, fetchMySkillTwinHistory } from '../services/skillTwinService';
import { fetchMyFeedback } from '../services/feedbackService';
import { fetchMySessions } from '../services/trainingService';

const SKILL_LABELS = {
  decisionMaking: 'Decision Making',
  situationalAwareness: 'Situational Awareness',
  safetyAwareness: 'Safety Awareness',
  evacuationSkill: 'Evacuation Skill',
  emergencyResponse: 'Emergency Response',
  communication: 'Communication',
  teamwork: 'Teamwork'
};

function getTimestamp(value) {
  if (value?._seconds !== undefined) return value._seconds * 1000;
  if (typeof value?.toDate === 'function') return value.toDate().getTime();
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function getUnitySessionObservations(session) {
  if (!session || session.sourceSystem !== 'unity') return [];

  const observations = [];
  const performance = session.performanceFeatures || {};
  const objectiveFlags = performance.objectiveFlags || {
    ...(typeof session.powerWasTurnedOff === 'boolean' ? { powerWasTurnedOff: session.powerWasTurnedOff } : {}),
    ...(typeof session.pinWasRemoved === 'boolean' ? { pinWasRemoved: session.pinWasRemoved } : {})
  };
  const objectiveLabels = {
    powerWasTurnedOff: 'Power isolation',
    pinWasRemoved: 'Fire extinguisher pin removal'
  };

  Object.entries(objectiveLabels).forEach(([key, label]) => {
    if (typeof objectiveFlags[key] === 'boolean') {
      observations.push(`${label}: ${objectiveFlags[key] ? 'completed' : 'not completed'}.`);
    }
  });

  const scoreComponents = performance.scoreComponents || {};
  if (typeof scoreComponents.decisionAccuracy === 'number') {
    const correct = performance.correctDecisions;
    const incorrect = performance.wrongDecisions;
    const total = correct + incorrect;
    observations.push(
      Number.isFinite(total)
        ? `Decision accuracy: ${scoreComponents.decisionAccuracy}% (${correct} of ${total} recorded decisions correct).`
        : `Decision accuracy: ${scoreComponents.decisionAccuracy}%.`
    );
  }

  if (typeof session.procedureViolation === 'boolean') {
    observations.push(`Procedure violation recorded: ${session.procedureViolation ? 'yes' : 'no'}.`);
  }
  if (typeof session.safetyViolations === 'number') {
    observations.push(`Safety violations recorded: ${session.safetyViolations}.`);
  }

  const metricLabels = {
    totalResponseTime: 'Total response time',
    powerIsolationTime: 'Power isolation time',
    pinRemovalTime: 'Pin removal time',
    extinguishingTime: 'Extinguishing time'
  };
  Object.entries(metricLabels).forEach(([key, label]) => {
    const value = session.unityMetrics?.[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      observations.push(`${label}: ${value} sec.`);
    }
  });

  return observations;
}

function ProgressChart({ history }) {
  const points = history
    .map((record, index) => ({
      score: record.overallScore,
      timestamp: getTimestamp(record.createdAt),
      index
    }))
    .filter(point => typeof point.score === 'number' && Number.isFinite(point.score));

  if (points.length === 0) return null;

  const width = 640;
  const height = 220;
  const padding = { top: 20, right: 24, bottom: 42, left: 42 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const xFor = index => padding.left + (points.length === 1 ? chartWidth / 2 : (index / (points.length - 1)) * chartWidth);
  const yFor = score => padding.top + ((100 - Math.max(0, Math.min(100, score))) / 100) * chartHeight;
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index)} ${yFor(point.score)}`).join(' ');
  const labelStep = Math.max(1, Math.ceil((points.length - 1) / 4));
  const gridScores = [0, 50, 100];

  return (
    <div className="mt-5">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">Progress across training sessions</h3>
      <div className="overflow-hidden rounded-xl border border-[#334155] bg-[#0a0910] p-3">
        <svg
          className="h-auto w-full"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Overall Skill Twin score across ${points.length} saved training sessions`}
        >
          {gridScores.map(score => (
            <g key={score}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={yFor(score)}
                y2={yFor(score)}
                stroke="currentColor"
                className="text-slate-700"
                strokeDasharray={score === 0 ? undefined : '4 5'}
              />
              <text x={padding.left - 8} y={yFor(score) + 4} textAnchor="end" className="fill-slate-400" fontSize="11">
                {score}
              </text>
            </g>
          ))}
          <path d={path} fill="none" stroke="var(--theme-brand)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point, index) => (
            <g key={`${point.timestamp ?? point.index}-${index}`}>
              <circle cx={xFor(index)} cy={yFor(point.score)} r="5" fill="var(--theme-brand)" />
              <title>
                {`${point.timestamp === null ? `Session ${point.index + 1}` : new Date(point.timestamp).toLocaleDateString()}: ${point.score}`}
              </title>
              {(points.length <= 10 || index === 0 || index === points.length - 1) && (
                <text x={xFor(index)} y={yFor(point.score) - 10} textAnchor="middle" className="fill-slate-200" fontSize="11">
                  {point.score}
                </text>
              )}
              {(index % labelStep === 0 || index === points.length - 1) && (
                <text x={xFor(index)} y={height - 14} textAnchor="middle" className="fill-slate-400" fontSize="10">
                  {point.timestamp === null ? `Session ${point.index + 1}` : new Date(point.timestamp).toLocaleDateString()}
                </text>
              )}
            </g>
          ))}
        </svg>
        <p className="mt-1 text-right text-[11px] text-slate-400">Score out of 100</p>
      </div>
    </div>
  );
}

function SkillBarChart({ skills }) {
  const width = 760;
  const rowHeight = 38;
  const padding = { top: 16, right: 48, bottom: 32, left: 190 };
  const plotWidth = width - padding.left - padding.right;
  const height = padding.top + (skills.length * rowHeight) + padding.bottom;
  const ticks = [0, 25, 50, 75, 100];

  return (
    <div className="overflow-x-auto rounded-xl border border-[#334155] bg-[#0a0910] p-3">
      <svg
        className="h-auto min-w-[620px] w-full"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Digital Skill Twin bar chart with ${skills.length} skill scores out of 100`}
      >
        {ticks.map(tick => {
          const x = padding.left + (tick / 100) * plotWidth;
          return (
            <g key={tick}>
              <line
                x1={x}
                x2={x}
                y1={padding.top - 4}
                y2={height - padding.bottom + 2}
                stroke="currentColor"
                className="text-slate-700"
                strokeDasharray={tick === 0 ? undefined : '4 5'}
              />
              <text x={x} y={height - 8} textAnchor="middle" className="fill-slate-400" fontSize="11">
                {tick}
              </text>
            </g>
          );
        })}
        {skills.map(([name, score], index) => {
          const y = padding.top + (index * rowHeight);
          const boundedScore = Math.max(0, Math.min(100, score));
          const label = SKILL_LABELS[name] || name.replace(/([A-Z])/g, ' $1');
          return (
            <g key={name}>
              <text
                x={padding.left - 12}
                y={y + 14}
                textAnchor="end"
                className="fill-slate-300"
                fontSize="12"
              >
                {label}
              </text>
              <rect
                x={padding.left}
                y={y}
                width={plotWidth}
                height="20"
                rx="6"
                fill="currentColor"
                className="text-slate-800"
              />
              <rect
                x={padding.left}
                y={y}
                width={(boundedScore / 100) * plotWidth}
                height="20"
                rx="6"
                fill="var(--theme-brand)"
              >
                <title>{`${label}: ${score} out of 100`}</title>
              </rect>
              <text
                x={width - padding.right + 10}
                y={y + 14}
                textAnchor="start"
                className="fill-slate-200"
                fontSize="12"
                fontWeight="600"
              >
                {score}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-right text-[11px] text-slate-400">Score out of 100</p>
    </div>
  );
}

export default function SkillTwinPanel({ user }) {
  const [skillTwin, setSkillTwin] = useState(null);
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [skillError, setSkillError] = useState(false);
  const [historyError, setHistoryError] = useState(false);
  const [sessionsError, setSessionsError] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);

  useEffect(() => {
    if (!user) return;

    let active = true;
    Promise.allSettled([fetchMySkillTwin(), fetchMySkillTwinHistory(), fetchMyFeedback(), fetchMySessions()]).then(([skillResult, historyResult, feedbackResult, sessionsResult]) => {
      if (!active) return;
      if (skillResult.status === 'fulfilled') setSkillTwin(skillResult.value);
      else setSkillError(true);
      if (historyResult.status === 'fulfilled' && Array.isArray(historyResult.value)) setHistory(historyResult.value);
      else if (historyResult.status === 'rejected') setHistoryError(true);
      if (feedbackResult.status === 'fulfilled') setFeedback(feedbackResult.value);
      else setFeedbackError(true);
      if (sessionsResult.status === 'fulfilled' && Array.isArray(sessionsResult.value)) setTrainingSessions(sessionsResult.value);
      else if (sessionsResult.status === 'rejected') setSessionsError(true);
      setLoading(false);
    });

    return () => { active = false; };
  }, [user]);

  if (!user) {
    return <section className="rounded-lg border border-[#334155] bg-[#111827] p-6 text-sm text-slate-300">Sign in to view your personal Digital Skill Twin and feedback.</section>;
  }

  if (loading) {
    return <div role="status" className="flex items-center gap-2 py-8 text-sm text-slate-400"><RefreshCw className="h-4 w-4 animate-spin" />Loading Skill Twin data...</div>;
  }

  const latestSnapshot = history.length > 0 ? history[history.length - 1] : null;
  const hasStoredProfile = Boolean(
    history.length > 0 ||
    (typeof skillTwin?.trainingCount === 'number' && skillTwin.trainingCount > 0) ||
    skillTwin?.lastUpdated
  );
  const profileSkills = skillTwin?.skills || latestSnapshot?.skills;
  const historyDimensions = [...new Set(history.flatMap(record =>
    Array.isArray(record.observedSkillDimensions) ? record.observedSkillDimensions : []
  ))];
  const observedDimensions = Array.isArray(skillTwin?.observedSkillDimensions) && skillTwin.observedSkillDimensions.length > 0
    ? skillTwin.observedSkillDimensions
    : historyDimensions.length > 0
      ? historyDimensions
      : hasStoredProfile
        ? Object.keys(profileSkills || {})
        : [];
  const skills = hasStoredProfile && profileSkills && typeof profileSkills === 'object'
    ? observedDimensions
      .filter(name => typeof profileSkills[name] === 'number' && Number.isFinite(profileSkills[name]) && profileSkills[name] >= 0 && profileSkills[name] <= 100)
      .map(name => [name, profileSkills[name]])
    : [];
  const overallScore = skillTwin?.overallScore ?? latestSnapshot?.overallScore;
  const feedbackRecord = Array.isArray(feedback) ? feedback[0] : feedback;
  const isUnityFeedback = feedbackRecord?.type === 'UNITY_TELEMETRY' || feedbackRecord?.type === 'UNITY_RULES';
  const feedbackSession = isUnityFeedback
    ? trainingSessions.find(session => session.id === feedbackRecord.sessionId)
    : null;
  const unityObservations = isUnityFeedback
    ? Array.isArray(feedbackRecord.observations) && feedbackRecord.observations.length > 0
      ? feedbackRecord.observations
      : getUnitySessionObservations(feedbackSession)
    : [];
  const strengths = Array.isArray(feedbackRecord?.strengths) ? feedbackRecord.strengths : [];
  const weaknesses = Array.isArray(feedbackRecord?.weaknesses) ? feedbackRecord.weaknesses : [];
  const recommendations = Array.isArray(feedbackRecord?.recommendations) ? feedbackRecord.recommendations : [];
  const hasFeedback = Boolean(feedbackRecord?.aiFeedback || strengths.length || weaknesses.length || recommendations.length);

  return (
    <section className="space-y-6 rounded-lg border border-[#334155] bg-[#111827] p-5 sm:p-6 text-white">
      <header className="flex items-center gap-3 border-b border-[#334155] pb-4">
        <Brain className="h-5 w-5 text-orange-300" />
        <div>
          <h2 className="font-semibold">Digital Skill Twin</h2>
          <p className="text-xs text-slate-400">Scores and feedback returned by ResQVerse services</p>
        </div>
      </header>

      {skillError ? (
        <p role="alert" className="flex items-center gap-2 text-sm text-red-300"><AlertCircle className="h-4 w-4" />Skill Twin data is unavailable. Try again later.</p>
      ) : skills.length === 0 ? (
        <p className="text-sm text-slate-400">No saved Skill Twin metrics yet. Complete a training session to populate your graph.</p>
      ) : (
        <div>
          {overallScore !== undefined && overallScore !== null && <p className="text-sm text-slate-300">Overall score <strong className="ml-2 text-orange-300">{overallScore}</strong></p>}
          {skillTwin?.trend && <p className="text-xs text-slate-400">Trend: {skillTwin.trend}</p>}
          <div className="mt-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-200">Current skill scores</h3>
            <SkillBarChart skills={skills} />
          </div>
          <ProgressChart history={history} />
          {historyError && <p role="alert" className="mt-3 text-xs text-amber-300">Training history is unavailable, so the progress graph could not be loaded.</p>}
        </div>
      )}

      <div className="border-t border-[#334155] pt-4">
        <h3 className="mb-3 text-sm font-semibold text-orange-200">
          {isUnityFeedback ? 'Unity Telemetry Feedback' : 'AI Feedback'}
        </h3>
        {feedbackError ? (
          <p role="alert" className="text-sm text-red-300">Feedback is unavailable. Try again later.</p>
        ) : isUnityFeedback ? (
          <div className="space-y-3 text-sm text-slate-300">
            <p className="text-xs text-slate-400">Recorded results from your Unity simulation. No unobserved events are inferred.</p>
            {unityObservations.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5">
                {unityObservations.map((item, index) => <li key={`observation-${index}`}>{item}</li>)}
              </ul>
            ) : sessionsError ? (
              <p role="alert" className="text-amber-300">Saved Unity session details are unavailable.</p>
            ) : (
              <p className="text-slate-400">No detailed telemetry was saved for this session.</p>
            )}
          </div>
        ) : !hasFeedback ? (
          <p className="text-sm text-slate-400">No feedback is available yet.</p>
        ) : (
          <div className="space-y-3 text-sm text-slate-300">
            {feedbackRecord?.aiFeedback && <p>{feedbackRecord.aiFeedback}</p>}
            {strengths.length > 0 && <div><h4 className="font-medium text-emerald-300">Strengths</h4><ul className="list-disc pl-5">{strengths.map((item, index) => <li key={`strength-${index}`}>{item}</li>)}</ul></div>}
            {weaknesses.length > 0 && <div><h4 className="font-medium text-amber-300">Areas to improve</h4><ul className="list-disc pl-5">{weaknesses.map((item, index) => <li key={`weakness-${index}`}>{item}</li>)}</ul></div>}
            {recommendations.length > 0 && <ul className="list-disc space-y-1 pl-5">{recommendations.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>}
          </div>
        )}
      </div>
    </section>
  );
}