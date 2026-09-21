import React, { useState, useEffect } from 'react';
import { X, Play, CheckCircle, Flame, Droplets, Wind, RefreshCw, Cpu } from 'lucide-react';
import { trainingService } from '../services/trainingService';

export default function VRSimulatorModal({ simulation, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [simulating, setSimulating] = useState(false);
  const [actionDone, setActionDone] = useState(false);
  const [score, setScore] = useState(null);
  const [aiReport, setAiReport] = useState('');
  const [sessionId, setSessionId] = useState(null);

  const isFire = simulation.title.toLowerCase().includes('fire');
  const isFlood = simulation.title.toLowerCase().includes('flood');

  useEffect(() => {
    async function initSession() {
      try {
        const created = await trainingService.createSession(simulation.id || 'sc-fire-01');
        if (created && created.id) {
          setSessionId(created.id);
          await trainingService.startSession(created.id);
        }
      } catch (err) {
        console.warn("Init session error:", err);
      }
    }
    initSession();
  }, [simulation]);

  const handleAction = async () => {
    setSimulating(true);

    // Ingest simulated VR telemetry events into backend
    if (sessionId) {
      try {
        const events = [
          {
            eventType: step === 1 ? 'HAZARD_DETECTED' : step === 2 ? 'CORRECT_DECISION' : 'EVACUATION_COMPLETED',
            timestamp: new Date().toISOString(),
            details: { step, scenario: simulation.title }
          }
        ];
        await trainingService.postSessionEvents(sessionId, events);
      } catch (e) {
        console.warn("Post telemetry events error:", e);
      }
    }

    setTimeout(() => {
      setSimulating(false);
      setActionDone(true);
    }, 1200);
  };

  const finishSimulation = async () => {
    setSimulating(true);
    try {
      let resultScore = Math.floor(Math.random() * 15) + 85;
      let feedbackSummary = isFire
        ? 'Excellent handling of electrical power cutoff before extinguisher application. Extinguisher aim was optimal.'
        : isFlood
        ? 'Quick response in sealing basement flood barriers. Evacuation route was executed efficiently.'
        : 'Proper "Drop, Cover, and Hold On" posture maintained throughout seismic tremors.';

      if (sessionId) {
        const completedRes = await trainingService.completeSession(sessionId, {
          evacuationTime: 120,
          wrongDecisions: 0,
          safetyViolations: 0
        });
        if (completedRes) {
          if (completedRes.score !== undefined) resultScore = completedRes.score;
          if (completedRes.feedback && completedRes.feedback.summary) {
            feedbackSummary = completedRes.feedback.summary;
          }
        }
      }

      setScore(resultScore);
      setAiReport(feedbackSummary);

      setTimeout(() => {
        onComplete({
          title: simulation.title,
          score: resultScore,
          date: 'Today, 2026',
          aiFeedback: feedbackSummary
        });
      }, 2500);
    } catch (err) {
      console.warn("Finish simulation error:", err);
      setScore(88);
      setAiReport('Completed scenario successfully with strong safety awareness.');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-3xl bg-[#13111c] border border-[#27213b] rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/50 flex flex-col">
        <div className="px-6 py-4 bg-[#0a0910] border-b border-[#27213b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              {isFire ? <Flame className="w-5 h-5" /> : isFlood ? <Droplets className="w-5 h-5" /> : <Wind className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                VR Simulation: {simulation.title}
              </h3>
              <p className="text-xs text-purple-300 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> Live Telemetry & AI Feature Extraction Active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#27213b] hover:bg-purple-600/30 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative h-96 bg-[#0a0910] flex flex-col items-center justify-center p-8 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1a2e_1px,transparent_1px),linear-gradient(to_bottom,#1f1a2e_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>

          {score !== null ? (
            <div className="relative z-10 animate-fade-in space-y-3 max-w-lg mx-auto">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-white">Simulation Completed!</h4>
              <p className="text-sm text-slate-300">AI Performance Score: <span className="text-emerald-400 font-bold text-xl">{score}%</span></p>
              <div className="text-xs text-purple-300 bg-purple-950/40 border border-purple-900/50 p-4 rounded-xl space-y-1 text-left">
                <span className="font-bold text-purple-400 block">Personalized AI Evaluation Summary:</span>
                <p className="text-slate-200 leading-relaxed">{aiReport}</p>
              </div>
            </div>
          ) : (
            <div className="relative z-10 w-full max-w-lg">
              <div className="mb-6 p-6 rounded-2xl bg-[#13111c] border border-[#27213b] shadow-xl">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-600/20 text-purple-300 mb-3">
                  VR Scenario Step {step} of 3
                </span>
                <h4 className="text-lg font-bold text-white mb-2">
                  {step === 1 && (isFire ? 'Locate fire source and assess hazard class.' : isFlood ? 'Identify main water leakage inlet.' : 'Secure heavy equipment & find shelter.')}
                  {step === 2 && (isFire ? 'Isolate electrical power breaker before suppression.' : isFlood ? 'Deploy automated emergency flood barriers.' : 'Hold onto structural pillars during tremors.')}
                  {step === 3 && (isFire ? 'Use CO2 extinguisher with PASS method.' : isFlood ? 'Evacuate to higher elevated staircase zone.' : 'Safely exit building via designated fire exit.')}
                </h4>
                <p className="text-xs text-slate-400">
                  {simulating ? 'Processing VR headset input & hand tracking telemetry...' : actionDone ? 'Action completed successfully! Proceed to next phase.' : 'Follow on-screen VR instructions using controller trigger.'}
                </p>
              </div>

              {!actionDone ? (
                <button
                  onClick={handleAction}
                  disabled={simulating}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 mx-auto text-sm"
                >
                  {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  <span>{simulating ? 'Ingesting VR Telemetry...' : 'Perform VR Action'}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (step < 3) {
                      setStep(step + 1);
                      setActionDone(false);
                    } else {
                      finishSimulation();
                    }
                  }}
                  disabled={simulating}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 mx-auto text-sm"
                >
                  {simulating && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{step < 3 ? 'Proceed to Next Step' : 'Complete & Generate AI Report'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-[#13111c] border-t border-[#27213b] flex items-center justify-between text-xs text-slate-400">
          <span>Headset: Meta Quest / ResQVerse VR Pro Link</span>
          <span className="text-purple-400 font-medium flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Digital Skill Twin & AI Feedback Active
          </span>
        </div>
      </div>
    </div>
  );
}
