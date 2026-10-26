const { db } = require("../config/firebase");
const { FieldValue } = require("firebase-admin/firestore");
const { executePaginatedQuery } = require("../utils/pagination");
const { normalizeTimestamp } = require("../utils/timestamp");

const UNITY_OBJECTIVES = {
    powerWasTurnedOff: "Power isolation",
    pinWasRemoved: "Fire extinguisher pin removal"
};

const UNITY_METRICS = {
    totalResponseTime: "Total response time",
    powerIsolationTime: "Power isolation time",
    pinRemovalTime: "Pin removal time",
    extinguishingTime: "Extinguishing time"
};

function buildUnitySimulationFeedback(features = {}) {
    const strengths = [];
    const weaknesses = [];
    const recommendations = [];
    const observations = [];
    const objectiveFlags = features.objectiveFlags || {};
    const completedObjectives = [];
    const incompleteObjectives = [];

    for (const [key, label] of Object.entries(UNITY_OBJECTIVES)) {
        if (typeof objectiveFlags[key] !== "boolean") continue;
        observations.push(`${label}: ${objectiveFlags[key] ? "completed" : "not completed"}.`);
        (objectiveFlags[key] ? completedObjectives : incompleteObjectives).push(label);
    }

    if (completedObjectives.length > 0) {
        strengths.push(`Completed objectives: ${completedObjectives.join(", ")}.`);
    }
    for (const objective of incompleteObjectives) {
        weaknesses.push(`${objective} was not completed in the recorded simulation.`);
        recommendations.push(`Review the ${objective.toLowerCase()} objective before the next simulation.`);
    }

    if (typeof features.fireWasExtinguished === "boolean") {
        observations.push(`Fire extinguished: ${features.fireWasExtinguished ? "yes" : "no"}.`);
        if (features.fireWasExtinguished) {
            strengths.push("Unity recorded that the fire was extinguished.");
        } else {
            weaknesses.push("Unity did not record the fire as extinguished.");
            recommendations.push("Practice extinguisher operation until the fire-extinguished objective is recorded.");
        }
    }

    if (Number.isFinite(features.safetyViolations) && features.safetyViolations >= 0) {
        observations.push(`Procedure violations recorded: ${features.safetyViolations}.`);
        if (features.safetyViolations === 0) {
            strengths.push("Unity recorded no procedural violations.");
        } else {
            weaknesses.push(`Unity recorded ${features.safetyViolations} procedural violation${features.safetyViolations === 1 ? "" : "s"}.`);
            recommendations.push("Review the recorded procedure violation with a trainer before the next simulation.");
        }
    }

    if (Number.isFinite(features.wrongDecisions) && features.wrongDecisions > 0) {
        observations.push(`Incorrect decisions recorded: ${features.wrongDecisions}.`);
        weaknesses.push(`Unity recorded ${features.wrongDecisions} incorrect decision${features.wrongDecisions === 1 ? "" : "s"}.`);
        recommendations.push("Review the recorded incorrect decisions with a trainer before repeating the scenario.");
    }

    for (const event of features.events || []) {
        if (event.eventType === "SAFETY_VIOLATION") {
            const detail = typeof event.metadata?.action === "string" ? ` during ${event.metadata.action}` : "";
            const eventTime = normalizeTimestamp(event.timestamp);
            observations.push(`Safety violation recorded${detail}${eventTime ? ` at ${eventTime.toISOString()}` : ""}.`);
        }
    }

    for (const [key, label] of Object.entries(UNITY_METRICS)) {
        const value = features.unityMetrics?.[key];
        if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
            observations.push(`${label}: ${value} sec.`);
        }
    }

    return { strengths, weaknesses, recommendations, observations };
}

class FeedbackService {
    async generatePersonalizedFeedback(traineeId, sessionId, features, skillTwin) {
        const strengths = [];
        const weaknesses = [];
        const recommendations = [];

        const skills = skillTwin.skills || {};

        // Strengths rules
        if (skills.safetyAwareness > 85 || features.safetyViolations === 0) {
            strengths.push("Excellent safety awareness and protocol adherence");
        }
        if (features.hazardsDetected > 2 || skills.situationalAwareness > 80) {
            strengths.push("Strong hazard detection and environmental alertness");
        }
        if (features.victimsRescued > 0 || skills.emergencyResponse > 80) {
            strengths.push("High efficiency in victim localization and rescue operations");
        }
        if (features.decisionAccuracy >= 85) {
            strengths.push("High decision accuracy under simulated stress");
        }
        if (strengths.length === 0) {
            strengths.push("Good initial engagement with training scenario");
        }

        // Weaknesses rules
        if (skills.evacuationSkill < 70 || features.evacuationTime > 240) {
            weaknesses.push("Slow evacuation decision-making and route execution");
        }
        if (features.wrongDecisions > 1 || skills.decisionMaking < 70) {
            weaknesses.push("Susceptibility to incorrect choices under time pressure");
        }
        if (features.safetyViolations > 0) {
            weaknesses.push("Safety protocol violations observed during hazard response");
        }
        if (features.hazardsIgnored > 0) {
            weaknesses.push("Overlooked active environmental hazards");
        }
        if (weaknesses.length === 0) {
            weaknesses.push("Minor delay in initial hazard identification");
        }

        // Recommendations rules
        if (skills.evacuationSkill < 70) {
            recommendations.push("Practice evacuation route selection in smoke and high-barrier scenarios");
        }
        if (features.wrongDecisions > 0) {
            recommendations.push("Improve decision-making speed by practicing emergency protocol drills");
        }
        if (features.safetyViolations > 0) {
            recommendations.push("Review personal protective equipment (PPE) and hazard bypass protocols");
        }
        if (recommendations.length === 0) {
            recommendations.push("Maintain current performance and attempt higher difficulty disaster scenarios");
        }

        // Determine Risk Level
        let riskLevel = "LOW";
        if (skills.overallScore < 60 || features.safetyViolations > 2) {
            riskLevel = "HIGH";
        } else if (skills.overallScore < 75 || features.wrongDecisions > 2) {
            riskLevel = "MEDIUM";
        }

        const feedbackRecord = {
            traineeId,
            sessionId,
            performanceScore: skillTwin.overallScore || features.decisionAccuracy || 75,
            riskLevel,
            strengths,
            weaknesses,
            recommendations,
            type: "RULE_AND_AI",
            createdAt: FieldValue.serverTimestamp()
        };

        const docRef = await db.collection("feedback").add(feedbackRecord);
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
    }

    async generateUnitySimulationFeedback(traineeId, sessionId, features, skillTwin) {
        const { strengths, weaknesses, recommendations, observations } = buildUnitySimulationFeedback(features);

        const feedbackRecord = {
            traineeId,
            sessionId,
            performanceScore: null,
            riskLevel: null,
            strengths,
            weaknesses,
            recommendations,
            observations,
            type: "UNITY_TELEMETRY",
            createdAt: FieldValue.serverTimestamp()
        };

        const feedbackRef = db.collection("feedback").doc(sessionId);
        await feedbackRef.set(feedbackRecord, { merge: true });
        const doc = await feedbackRef.get();
        return { id: doc.id, ...doc.data(), skillTwinScore: skillTwin?.overallScore ?? null };
    }

    async createFeedback(feedbackData) {
        const record = {
            traineeId: feedbackData.traineeId,
            sessionId: feedbackData.sessionId || null,
            performanceScore: feedbackData.performanceScore || 75,
            riskLevel: feedbackData.riskLevel || "LOW",
            type: feedbackData.type || "AI",
            message: feedbackData.message || "",
            strengths: feedbackData.strengths || [],
            weaknesses: feedbackData.weaknesses || [],
            recommendations: feedbackData.recommendations || [],
            createdAt: FieldValue.serverTimestamp()
        };

        const docRef = await db.collection("feedback").add(record);
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
    }

    async getFeedbackByTraineeId(traineeId, req) {
        const query = db.collection("feedback")
            .where("traineeId", "==", traineeId);

        return await executePaginatedQuery(query, req);
    }

    async getFeedbackBySessionId(sessionId) {
        const snapshot = await db.collection("feedback")
            .where("sessionId", "==", sessionId)
            .get();

        const results = [];
        snapshot.forEach(doc => {
            results.push({ id: doc.id, ...doc.data() });
        });

        return results;
    }
}

module.exports = new FeedbackService();
module.exports.buildUnitySimulationFeedback = buildUnitySimulationFeedback;
