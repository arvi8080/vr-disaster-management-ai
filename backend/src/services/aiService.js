const { AI_SERVICE_URL } = require("../config/env");
const { db } = require("../config/firebase");
const { FieldValue } = require("firebase-admin/firestore");
const trainingService = require("./trainingService");
const eventService = require("./eventService");
const performanceFeatureService = require("./performanceFeatureService");
const skillTwinService = require("./skillTwinService");
const feedbackService = require("./feedbackService");
const logger = require("../utils/logger");

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
        const performanceFeatures = performanceFeatureService.extractFeatures(session, events);

        // 4. Fetch current Digital Skill Twin profile
        const skillTwin = await skillTwinService.getSkillTwin(session.traineeId);

        // 5. Construct structured AI payload
        const payload = {
            traineeId: session.traineeId,
            sessionId,
            currentSkills: skillTwin.skills || {},
            performanceFeatures: {
                evacuationTime: performanceFeatures.evacuationTime,
                averageReactionTime: performanceFeatures.averageReactionTime,
                wrongDecisions: performanceFeatures.wrongDecisions,
                correctDecisions: performanceFeatures.correctDecisions,
                safetyViolations: performanceFeatures.safetyViolations,
                hazardsDetected: performanceFeatures.hazardsDetected,
                hazardsIgnored: performanceFeatures.hazardsIgnored,
                victimsRescued: performanceFeatures.victimsRescued,
                objectivesCompleted: performanceFeatures.objectivesCompleted
            }
        };

        // 6. Send request to FastAPI AI Service
        let aiResponseData;
        try {
            const response = await fetch(`${AI_SERVICE_URL}/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                logger.error("FastAPI AI Service returned error response", { status: response.status, body: errorText });
                const err = new Error(`AI service returned error ${response.status}: ${errorText}`);
                err.statusCode = 502;
                err.errorCode = "SERVICE_UNAVAILABLE";
                throw err;
            }

            aiResponseData = await response.json();
        } catch (fetchErr) {
            if (fetchErr.statusCode) throw fetchErr;

            logger.error("Failed to connect to Python FastAPI AI Service", { url: AI_SERVICE_URL, error: fetchErr.message });
            const err = new Error(`AI Service is unavailable at ${AI_SERVICE_URL}. ${fetchErr.message}`);
            err.statusCode = 503;
            err.errorCode = "SERVICE_UNAVAILABLE";
            throw err;
        }

        // 7. Validate AI Response Format
        const validatedAnalysis = {
            traineeId: session.traineeId,
            sessionId,
            performanceScore: aiResponseData.performanceScore !== undefined ? aiResponseData.performanceScore : session.score,
            riskLevel: aiResponseData.riskLevel || "LOW",
            strengths: Array.isArray(aiResponseData.strengths) ? aiResponseData.strengths : [],
            weaknesses: Array.isArray(aiResponseData.weaknesses) ? aiResponseData.weaknesses : [],
            recommendations: Array.isArray(aiResponseData.recommendations) ? aiResponseData.recommendations : [],
            skillPredictions: aiResponseData.skillPredictions || {},
            modelVersion: aiResponseData.modelVersion || "v1.0",
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

