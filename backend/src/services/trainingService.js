const { db } = require("../config/firebase");
const { FieldValue } = require("firebase-admin/firestore");
const { executePaginatedQuery } = require("../utils/pagination");
const { SESSION_STATUS } = require("../utils/constants");
const eventService = require("./eventService");
const performanceFeatureService = require("./performanceFeatureService");
const skillTwinService = require("./skillTwinService");
const feedbackService = require("./feedbackService");
const logger = require("../utils/logger");

class TrainingService {
    async createSession(scenarioId, traineeId) {
        const scenarioDoc = await db.collection("scenarios").doc(scenarioId).get();
        if (!scenarioDoc.exists) {
            const err = new Error("Scenario not found");
            err.statusCode = 404;
            err.errorCode = "NOT_FOUND";
            throw err;
        }

        const session = {
            traineeId,
            scenarioId,
            status: SESSION_STATUS.CREATED,
            startedAt: null,
            completedAt: null,
            duration: 0,
            score: 0,
            evacuationTime: 0,
            mistakes: 0,
            safetyViolations: 0,
            objectivesCompleted: 0,
            victimsRescued: 0,
            hazardsDetected: 0,
            actionsCompleted: 0,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        };

        const docRef = await db.collection("trainingSessions").add(session);
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
    }

    async getSessionById(id) {
        const doc = await db.collection("trainingSessions").doc(id).get();
        if (!doc.exists) {
            return null;
        }
        return { id: doc.id, ...doc.data() };
    }

    async getUserSessions(traineeId, req) {
        let query = db.collection("trainingSessions")
            .where("traineeId", "==", traineeId);

        if (req.query.status) {
            query = query.where("status", "==", req.query.status);
        }

        return await executePaginatedQuery(query, req);
    }

    async startSession(id, traineeId) {
        const sessionRef = db.collection("trainingSessions").doc(id);
        const doc = await sessionRef.get();

        if (!doc.exists) {
            const err = new Error("Training session not found");
            err.statusCode = 404;
            err.errorCode = "NOT_FOUND";
            throw err;
        }

        const session = doc.data();
        if (session.traineeId !== traineeId) {
            const err = new Error("Unauthorized access to training session");
            err.statusCode = 403;
            err.errorCode = "FORBIDDEN";
            throw err;
        }

        if (session.status !== SESSION_STATUS.CREATED && session.status !== SESSION_STATUS.STARTED) {
            const err = new Error(`Cannot start session currently in status: ${session.status}`);
            err.statusCode = 400;
            err.errorCode = "BAD_REQUEST";
            throw err;
        }

        const updates = {
            status: SESSION_STATUS.IN_PROGRESS,
            startedAt: session.startedAt || FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        };

        await sessionRef.update(updates);
        const updatedDoc = await sessionRef.get();
        return { id: updatedDoc.id, ...updatedDoc.data() };
    }

    async completeSession(id, traineeId, completionBody = {}) {
        const sessionRef = db.collection("trainingSessions").doc(id);
        const doc = await sessionRef.get();

        if (!doc.exists) {
            const err = new Error("Training session not found");
            err.statusCode = 404;
            err.errorCode = "NOT_FOUND";
            throw err;
        }

        const session = doc.data();
        if (session.traineeId !== traineeId) {
            const err = new Error("Unauthorized access to training session");
            err.statusCode = 403;
            err.errorCode = "FORBIDDEN";
            throw err;
        }

        if (session.status === SESSION_STATUS.COMPLETED) {
            const err = new Error("Session is already completed");
            err.statusCode = 400;
            err.errorCode = "BAD_REQUEST";
            throw err;
        }

        // Fetch scenario
        let scenario = null;
        if (session.scenarioId) {
            const scenarioDoc = await db.collection("scenarios").doc(session.scenarioId).get();
            if (scenarioDoc.exists) scenario = scenarioDoc.data();
        }

        // Fetch all telemetry events
        const events = await eventService.getAllEventsForSession(id);
        const features = performanceFeatureService.extractFeatures(session, events, scenario);

        const updates = {
            status: SESSION_STATUS.COMPLETED,
            completedAt: FieldValue.serverTimestamp(),
            duration: features.evacuationTime,
            score: features.decisionAccuracy,
            evacuationTime: features.evacuationTime,
            mistakes: features.wrongDecisions,
            safetyViolations: features.safetyViolations,
            objectivesCompleted: features.objectivesCompleted,
            victimsRescued: features.victimsRescued,
            hazardsDetected: features.hazardsDetected,
            actionsCompleted: events.length,
            updatedAt: FieldValue.serverTimestamp()
        };

        await sessionRef.update(updates);

        // Update Digital Skill Twin profile
        const updatedSkillTwin = await skillTwinService.updateSkillTwin(traineeId, id, features);

        // Generate Personalized Feedback
        const feedback = await feedbackService.generatePersonalizedFeedback(traineeId, id, features, updatedSkillTwin);

        const updatedDoc = await sessionRef.get();
        return {
            id: updatedDoc.id,
            ...updatedDoc.data(),
            features,
            skillTwin: updatedSkillTwin,
            feedback
        };
    }

    async cancelSession(id, traineeId) {
        const sessionRef = db.collection("trainingSessions").doc(id);
        const doc = await sessionRef.get();

        if (!doc.exists) {
            const err = new Error("Training session not found");
            err.statusCode = 404;
            err.errorCode = "NOT_FOUND";
            throw err;
        }

        const session = doc.data();
        if (session.traineeId !== traineeId) {
            const err = new Error("Unauthorized access to training session");
            err.statusCode = 403;
            err.errorCode = "FORBIDDEN";
            throw err;
        }

        await sessionRef.update({
            status: SESSION_STATUS.CANCELLED,
            updatedAt: FieldValue.serverTimestamp()
        });

        const updatedDoc = await sessionRef.get();
        return { id: updatedDoc.id, ...updatedDoc.data() };
    }
}

module.exports = new TrainingService();

