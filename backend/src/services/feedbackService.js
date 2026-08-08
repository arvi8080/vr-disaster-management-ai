const { db } = require("../config/firebase");
const { FieldValue } = require("firebase-admin/firestore");
const { executePaginatedQuery } = require("../utils/pagination");

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
