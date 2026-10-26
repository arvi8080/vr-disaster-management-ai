const { AI_SERVICE_URL } = require("../config/env");
const { db } = require("../config/firebase");
const { FieldValue } = require("firebase-admin/firestore");
const trainingService = require("./trainingService");
const eventService = require("./eventService");
const performanceFeatureService = require("./performanceFeatureService");
const skillTwinService = require("./skillTwinService");
const feedbackService = require("./feedbackService");
const logger = require("../utils/logger");

/**
 * Built-in fallback scoring engine that mirrors the Python XGBoost algorithmic path.
 * Used automatically when the external FastAPI ML service is unavailable (502/503/timeout).
 * This ensures analysis ALWAYS completes successfully — even without the ML container running.
 *
 * @param {Object} pf - validated performanceFeatures object
 * @returns {Object} - AnalyzeResponse-compatible result
 */
function localFallbackAnalysis(pf) {
    const evacuationTime   = typeof pf.evacuationTime      === "number" ? pf.evacuationTime      : 300;
    const reactionTime     = typeof pf.averageReactionTime === "number" ? pf.averageReactionTime : 5000;
    const correct          = typeof pf.correctDecisions    === "number" ? pf.correctDecisions    : 0;
    const wrong            = typeof pf.wrongDecisions      === "number" ? pf.wrongDecisions      : 0;
    const violations       = typeof pf.safetyViolations    === "number" ? pf.safetyViolations    : 0;
    const hazardsDetected  = typeof pf.hazardsDetected     === "number" ? pf.hazardsDetected     : (correct + wrong);
    const rescued          = typeof pf.victimsRescued       === "number" ? pf.victimsRescued      : 0;
    const objectives       = typeof pf.objectivesCompleted === "number" ? pf.objectivesCompleted : 0;

    const totalHazards     = Math.max(hazardsDetected, correct + wrong, 1);
    const hazardRate       = correct / totalHazards;
    const rescueRate       = Math.min(rescued / 3.0, 1.0);
    const protocolRate     = Math.max(1.0 - violations * 0.2, 0.0);
    // reactionTime from Unity is in seconds (float); normalise to ms for speed factor calc
    const reactionMs       = reactionTime > 100 ? reactionTime : reactionTime * 1000;
    const speedFactor      = Math.max(1.0 - reactionMs / 3000.0, 0.1);
    const stressResilience = 0.75;

    const rawScore = (hazardRate * 35.0) + (rescueRate * 25.0) + (protocolRate * 20.0)
                   + (speedFactor * 10.0) + (stressResilience * 10.0);
    const score = Math.min(Math.max(rawScore, 0), 100);

    let risk, rec;
    if (score >= 90)      { risk = "LOW";      rec = "Advanced Multi-Hazard Command Scenarios"; }
    else if (score >= 75) { risk = "MODERATE"; rec = "Hazmat Mitigation & Speed Reaction Training"; }
    else if (score >= 60) { risk = "ELEVATED"; rec = "Basic Protocol Drill & Hazard Avoidance Review"; }
    else                  { risk = "HIGH";     rec = "Mandatory VR Disaster Fundamentals Refresher"; }

    const strengths = [];
    const weaknesses = [];
    if (objectives > 0) strengths.push(`Completed ${objectives} recorded training objective(s).`);
    if (correct > 0)    strengths.push(`Recorded ${correct} correct decision(s).`);
    if (rescued > 0)    strengths.push(`Successfully rescued ${rescued} victim(s).`);
    if (!strengths.length) strengths.push("Performance data collected — continue training to build a detailed profile.");

    if (violations > 0) weaknesses.push(`Recorded ${violations} safety/procedure violation(s).`);
    if (wrong > 0)      weaknesses.push(`Recorded ${wrong} incorrect decision(s).`);
    if (!weaknesses.length) weaknesses.push("No significant weaknesses recorded in this session.");

    return {
        performanceScore: Math.round(score * 10) / 10,
        riskLevel: risk,
        strengths,
        weaknesses,
        recommendations: [rec],
        skillPredictions: {
            hazard_rate:         Math.round(hazardRate  * 1000) / 10,
            rescue_rate:         Math.round(rescueRate  * 1000) / 10,
            protocol_compliance: Math.round(protocolRate * 1000) / 10,
            reaction_speed:      Math.round(speedFactor * 1000) / 10,
            stress_resilience:   Math.round(stressResilience * 1000) / 10
        },
        modelVersion: "v1.0-local-fallback"
    };
}

/**
 * Fetch with a configurable AbortController timeout so a slow/dead AI service
 * fails fast rather than hanging the entire request.
 */
async function fetchWithTimeout(url, options, timeoutMs = 10000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

const NUMERIC_FEATURE_KEYS = [
    "evacuationTime", "averageReactionTime", "wrongDecisions", "correctDecisions",
    "safetyViolations", "hazardsDetected", "hazardsIgnored", "victimsRescued",
    "objectivesCompleted"
];
const INTEGER_FEATURE_KEYS = new Set([
    "wrongDecisions", "correctDecisions", "safetyViolations",
    "hazardsDetected", "hazardsIgnored", "victimsRescued", "objectivesCompleted"
]);

function buildValidatedPerformanceFeatures(features) {
    return Object.fromEntries(
        NUMERIC_FEATURE_KEYS
            .filter(key =>
                typeof features[key] === "number" &&
                Number.isFinite(features[key]) &&
                (!INTEGER_FEATURE_KEYS.has(key) || Number.isInteger(features[key]))
            )
            .map(key => [key, features[key]])
    );
}

class AIService {
    async analyzeSession(sessionId) {
        // 1. Fetch session
        const session = await trainingService.getSessionById(sessionId);
        if (!session) {
            const err = new Error(`Training session ${sessionId} not found`);
            err.statusCode = 404;
            err.errorCode = "NOT_FOUND";
            throw err;
        }



        // 2. Fetch events
        const events = await eventService.getAllEventsForSession(sessionId);

        // 3. Extract performance features
        const performanceFeatures = session.sourceSystem === "unity" && session.performanceFeatures
            ? session.performanceFeatures
            : performanceFeatureService.extractFeatures(session, events);
        // 4. Fetch current Digital Skill Twin profile
        const skillTwin = await skillTwinService.getSkillTwin(session.traineeId);

        // 5. Construct structured AI payload
        const validatedFeatures = buildValidatedPerformanceFeatures(performanceFeatures);
        const payload = {
            traineeId: session.traineeId,
            sessionId,
            currentSkills: skillTwin.skills || {},
            observedSkillDimensions: skillTwin.observedSkillDimensions || null,
            performanceFeatures: {
                ...validatedFeatures,
                ...(session.sourceSystem === "unity" ? {
                    simulationType: session.simulationType,
                    completionStatus: session.completionStatus,
                    scoreComponents: performanceFeatures.scoreComponents,
                    observedMetrics: performanceFeatures.observedMetrics,
                    unityMetrics: session.unityMetrics
                } : {})
            }
        };

        // 6. Attempt request to FastAPI AI Service — fall back gracefully on any connectivity issue
        let aiResponseData = null;
        let usedFallback = false;

        try {
            const response = await fetchWithTimeout(
                `${AI_SERVICE_URL}/analyze`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                },
                10000  // 10-second timeout
            );

            if (!response.ok) {
                const errorText = await response.text();
                logger.warn(
                    "FastAPI AI Service returned non-OK response — using local fallback engine",
                    { status: response.status, url: `${AI_SERVICE_URL}/analyze`, preview: errorText.slice(0, 200) }
                );
                aiResponseData = localFallbackAnalysis(validatedFeatures);
                usedFallback = true;
            } else {
                aiResponseData = await response.json();
            }
        } catch (fetchErr) {
            // Covers: connection refused, AbortError (timeout), ECONNRESET, ENOTFOUND, etc.
            logger.warn(
                "Could not reach Python FastAPI AI Service — using local fallback engine",
                { url: AI_SERVICE_URL, error: fetchErr.message }
            );
            aiResponseData = localFallbackAnalysis(validatedFeatures);
            usedFallback = true;
        }

        if (usedFallback) {
            logger.info("Local fallback analysis engine completed successfully", {
                sessionId,
                score: aiResponseData.performanceScore,
                risk: aiResponseData.riskLevel
            });
        }

        // 7. Validate AI Response Format
        const validatedAnalysis = {
            traineeId: session.traineeId,
            sessionId,
            performanceScore: aiResponseData.performanceScore !== undefined
                ? aiResponseData.performanceScore
                : (session.score || 50),
            riskLevel: aiResponseData.riskLevel || "LOW",
            strengths: Array.isArray(aiResponseData.strengths) ? aiResponseData.strengths : [],
            weaknesses: Array.isArray(aiResponseData.weaknesses) ? aiResponseData.weaknesses : [],
            recommendations: Array.isArray(aiResponseData.recommendations) ? aiResponseData.recommendations : [],
            skillPredictions: aiResponseData.skillPredictions || {},
            modelVersion: aiResponseData.modelVersion || "v1.0",
            analysisSource: usedFallback ? "local-engine" : "ml-service",
            createdAt: FieldValue.serverTimestamp()
        };

        // 8. Store AI analysis in Firestore
        const docRef = await db.collection("aiAnalysis").add(validatedAnalysis);
        const savedAnalysis = (await docRef.get()).data();

        // 9. Store feedback
        await feedbackService.createFeedback({
            traineeId: session.traineeId,
            sessionId,
            performanceScore: validatedAnalysis.performanceScore,
            riskLevel: validatedAnalysis.riskLevel,
            type: "AI",
            message: `AI Model ${validatedAnalysis.modelVersion} completed assessment with score ${validatedAnalysis.performanceScore}`,
            strengths: validatedAnalysis.strengths,
            weaknesses: validatedAnalysis.weaknesses,
            recommendations: validatedAnalysis.recommendations
        });

        return { id: docRef.id, ...savedAnalysis };
    }
}

module.exports = new AIService();
module.exports.buildValidatedPerformanceFeatures = buildValidatedPerformanceFeatures;
module.exports.localFallbackAnalysis = localFallbackAnalysis;
