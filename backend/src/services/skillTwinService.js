const { db } = require("../config/firebase");
const { FieldValue } = require("firebase-admin/firestore");
const { SKILL_UPDATE_WEIGHTS, TRENDS } = require("../utils/constants");
const logger = require("../utils/logger");

class SkillTwinService {
    calculateSessionSkillScores(features) {
        // 1. Decision Making (0-100)
        let decisionMaking = features.decisionAccuracy || 70;
        if (features.wrongDecisions > 2) {
            decisionMaking = Math.max(0, decisionMaking - (features.wrongDecisions * 5));
        }

        // 2. Situational Awareness (0-100)
        let situationalAwareness = 60;
        situationalAwareness += (features.hazardsDetected || 0) * 10;
        situationalAwareness -= (features.hazardsIgnored || 0) * 15;
        if (features.averageReactionTime < 3.0) situationalAwareness += 15;
        situationalAwareness = Math.max(0, Math.min(100, situationalAwareness));

        // 3. Safety Awareness (0-100)
        let safetyAwareness = 100 - ((features.safetyViolations || 0) * 20);
        safetyAwareness = Math.max(0, Math.min(100, safetyAwareness));

        // 4. Evacuation Skill (0-100)
        let evacuationSkill = features.routeEfficiency || 70;
        if (features.evacuationTime > 0 && features.evacuationTime < 180) {
            evacuationSkill += 15;
        } else if (features.evacuationTime > 300) {
            evacuationSkill -= 15;
        }
        evacuationSkill = Math.max(0, Math.min(100, evacuationSkill));

        // 5. Emergency Response (0-100)
        let emergencyResponse = 50;
        emergencyResponse += (features.victimsRescued || 0) * 20;
        emergencyResponse += (features.objectivesCompleted || 0) * 10;
        if (features.reactionTime < 4.0) emergencyResponse += 10;
        emergencyResponse = Math.max(0, Math.min(100, emergencyResponse));

        // 6. Communication (0-100)
        let communication = 60 + ((features.communicationActions || 0) * 15);
        communication = Math.max(0, Math.min(100, communication));

        // 7. Teamwork (0-100)
        let teamwork = 60 + ((features.teamworkActions || 0) * 15);
        teamwork = Math.max(0, Math.min(100, teamwork));

        const skills = {
            decisionMaking: Math.round(decisionMaking),
            situationalAwareness: Math.round(situationalAwareness),
            safetyAwareness: Math.round(safetyAwareness),
            evacuationSkill: Math.round(evacuationSkill),
            emergencyResponse: Math.round(emergencyResponse),
            communication: Math.round(communication),
            teamwork: Math.round(teamwork)
        };

        const values = Object.values(skills);
        const overallScore = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

        return { skills, overallScore };
    }

    async getSkillTwin(traineeId) {
        const doc = await db.collection("skillProfiles").doc(traineeId).get();
        if (!doc.exists) {
            const defaultSkills = {
                decisionMaking: 50,
                situationalAwareness: 50,
                safetyAwareness: 50,
                evacuationSkill: 50,
                emergencyResponse: 50,
                communication: 50,
                teamwork: 50
            };
            return {
                traineeId,
                skills: defaultSkills,
                overallScore: 50,
                trainingCount: 0,
                trend: TRENDS.STABLE,
                lastSessionScore: 50,
                lastUpdated: null
            };
        }

        const data = doc.data();
        // Support legacy flat format or structured format seamlessly
        if (!data.skills && data.decisionMaking !== undefined) {
            data.skills = {
                decisionMaking: data.decisionMaking || 50,
                situationalAwareness: data.situationalAwareness || 50,
                safetyAwareness: data.safetyAwareness || 50,
                evacuationSkill: data.evacuationSkill || 50,
                emergencyResponse: data.emergencyResponse || 50,
                communication: data.communication || 50,
                teamwork: data.teamwork || 50
            };
        }
        return { traineeId: doc.id, ...data };
    }

    async updateSkillTwin(traineeId, sessionId, performanceFeatures) {
        const currentProfile = await this.getSkillTwin(traineeId);
        const sessionSkillData = this.calculateSessionSkillScores(performanceFeatures);

        const trainingCount = (currentProfile.trainingCount || 0) + 1;
        const prevSkills = currentProfile.skills || {};

        const updatedSkills = {};
        const skillKeys = [
            "decisionMaking", "situationalAwareness", "safetyAwareness",
            "evacuationSkill", "emergencyResponse", "communication", "teamwork"
        ];

        // Weighted Exponential Moving Average update rule
        const wHist = SKILL_UPDATE_WEIGHTS.HISTORICAL;
        const wCurr = SKILL_UPDATE_WEIGHTS.CURRENT;

        skillKeys.forEach(key => {
            const prev = prevSkills[key] !== undefined ? prevSkills[key] : 50;
            const curr = sessionSkillData.skills[key];
            if (trainingCount === 1) {
                updatedSkills[key] = curr;
            } else {
                updatedSkills[key] = Math.round((prev * wHist) + (curr * wCurr));
            }
        });

        const skillValues = Object.values(updatedSkills);
        const overallScore = Math.round(skillValues.reduce((a, b) => a + b, 0) / skillValues.length);

        // Record historical snapshot in skillHistory collection
        const historyRecord = {
            traineeId,
            sessionId,
            skills: updatedSkills,
            overallScore: sessionSkillData.overallScore,
            createdAt: FieldValue.serverTimestamp()
        };
        await db.collection("skillHistory").add(historyRecord);

        // Fetch recent snapshots to calculate overall trend
        const snapshots = await this.getSkillHistory(traineeId);
        const trend = this.calculateSkillTrend(snapshots);

        const updatedProfile = {
            traineeId,
            skills: updatedSkills,
            overallScore,
            trainingCount,
            trend,
            lastSessionScore: sessionSkillData.overallScore,
            lastUpdated: FieldValue.serverTimestamp()
        };

        await db.collection("skillProfiles").doc(traineeId).set(updatedProfile, { merge: true });
        logger.info(`Updated Digital Skill Twin profile for trainee ${traineeId}`);

        return updatedProfile;
    }

    async getSkillHistory(traineeId) {
        const snapshot = await db.collection("skillHistory")
            .where("traineeId", "==", traineeId)
            .get();

        const history = [];
        snapshot.forEach(doc => {
            history.push({ id: doc.id, ...doc.data() });
        });

        history.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        return history;
    }

    async getSkillProgress(traineeId) {
        const currentProfile = await this.getSkillTwin(traineeId);
        const history = await this.getSkillHistory(traineeId);

        let previousScore = 50;
        let currentScore = currentProfile.overallScore || 50;

        if (history.length >= 2) {
            previousScore = history[history.length - 2].overallScore || 50;
            currentScore = history[history.length - 1].overallScore || currentScore;
        } else if (history.length === 1) {
            previousScore = 50;
            currentScore = history[0].overallScore || currentScore;
        }

        const improvement = currentScore - previousScore;
        let trend = TRENDS.STABLE;
        if (improvement > 3) trend = TRENDS.IMPROVING;
        else if (improvement < -3) trend = TRENDS.DECLINING;

        // Calculate skill dimension trends
        const dimensionTrends = {};
        const skillKeys = [
            "decisionMaking", "situationalAwareness", "safetyAwareness",
            "evacuationSkill", "emergencyResponse", "communication", "teamwork"
        ];

        if (history.length >= 2) {
            const prevSkills = history[history.length - 2].skills || {};
            const currSkills = history[history.length - 1].skills || {};

            skillKeys.forEach(k => {
                const diff = (currSkills[k] || 50) - (prevSkills[k] || 50);
                if (diff > 3) dimensionTrends[k] = TRENDS.IMPROVING;
                else if (diff < -3) dimensionTrends[k] = TRENDS.DECLINING;
                else dimensionTrends[k] = TRENDS.STABLE;
            });
        } else {
            skillKeys.forEach(k => dimensionTrends[k] = TRENDS.STABLE);
        }

        return {
            previousScore,
            currentScore,
            improvement,
            trend,
            dimensionTrends,
            skills: currentProfile.skills || {}
        };
    }

    calculateSkillTrend(historySnapshots) {
        if (!historySnapshots || historySnapshots.length < 2) {
            return TRENDS.STABLE;
        }

        const recent = historySnapshots.slice(-3);
        const first = recent[0].overallScore || 50;
        const last = recent[recent.length - 1].overallScore || 50;
        const diff = last - first;

        if (diff > 3) return TRENDS.IMPROVING;
        if (diff < -3) return TRENDS.DECLINING;
        return TRENDS.STABLE;
    }

    async recalculateSkillProfile(traineeId) {
        // Fetch all completed training sessions for trainee
        const sessionsSnapshot = await db.collection("trainingSessions")
            .where("traineeId", "==", traineeId)
            .where("status", "==", "completed")
            .get();

        const sessions = [];
        sessionsSnapshot.forEach(doc => {
            sessions.push({ id: doc.id, ...doc.data() });
        });

        // Reset profile and replay session updates
        let profile = {
            traineeId,
            skills: {
                decisionMaking: 50,
                situationalAwareness: 50,
                safetyAwareness: 50,
                evacuationSkill: 50,
                emergencyResponse: 50,
                communication: 50,
                teamwork: 50
            },
            overallScore: 50,
            trainingCount: 0,
            trend: TRENDS.STABLE,
            lastSessionScore: 50,
            lastUpdated: FieldValue.serverTimestamp()
        };

        const eventService = require("./eventService");
        const performanceFeatureService = require("./performanceFeatureService");

        for (const session of sessions) {
            const events = await eventService.getAllEventsForSession(session.id);
            const features = performanceFeatureService.extractFeatures(session, events);
            profile = await this.updateSkillTwin(traineeId, session.id, features);
        }

        return profile;
    }
}

module.exports = new SkillTwinService();

