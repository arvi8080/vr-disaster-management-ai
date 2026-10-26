const { db } = require("../config/firebase");
const { FieldValue } = require("firebase-admin/firestore");
const { SKILL_UPDATE_WEIGHTS, TRENDS } = require("../utils/constants");
const { timestampMillis } = require("../utils/timestamp");
const logger = require("../utils/logger");
const { createHash } = require("node:crypto");
const SKILL_KEYS = [
    "decisionMaking", "situationalAwareness", "safetyAwareness",
    "evacuationSkill", "emergencyResponse", "communication", "teamwork"
];

class SkillTwinService {
    constructor(database = db) {
        this.db = database;
    }

    calculateSessionSkillScores(features) {
        if (features.skillScores && typeof features.skillScores === "object") {
            const skills = Object.fromEntries(
                Object.entries(features.skillScores)
                    .filter(([name, score]) => SKILL_KEYS.includes(name) && typeof score === "number" && Number.isFinite(score) && score >= 0 && score <= 100)
                    .map(([name, score]) => [name, Math.round(score)])
            );
            const values = Object.values(skills);
            return {
                skills,
                observedSkillDimensions: Object.keys(skills),
                overallScore: values.length > 0
                    ? Math.round(values.reduce((total, score) => total + score, 0) / values.length)
                    : null
            };
        }

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

        return {
            skills,
            observedSkillDimensions: Object.keys(skills),
            overallScore
        };
    }

    async getSkillTwin(traineeId) {
        const doc = await this.db.collection("skillProfiles").doc(traineeId).get();
        if (!doc.exists) {
            const defaultSkills = {
                decisionMaking: 0,
                situationalAwareness: 0,
                safetyAwareness: 0,
                evacuationSkill: 0,
                emergencyResponse: 0,
                communication: 0,
                teamwork: 0
            };
            return {
                traineeId,
                skills: defaultSkills,
                overallScore: 0,
                trainingCount: 0,
                trend: TRENDS.STABLE,
                lastSessionScore: 0,
                lastUpdated: null
            };
        }

        const data = doc.data();
        // Support legacy flat format or structured format seamlessly
        if (!data.skills && data.decisionMaking !== undefined) {
            data.skills = {
                decisionMaking: data.decisionMaking ?? 0,
                situationalAwareness: data.situationalAwareness ?? 0,
                safetyAwareness: data.safetyAwareness ?? 0,
                evacuationSkill: data.evacuationSkill ?? 0,
                emergencyResponse: data.emergencyResponse ?? 0,
                communication: data.communication ?? 0,
                teamwork: data.teamwork ?? 0
            };
        }
        return { traineeId: doc.id, ...data };
    }

    async updateSkillTwin(traineeId, sessionId, performanceFeatures) {
        const sessionSkillData = this.calculateSessionSkillScores(performanceFeatures);
        if (!sessionSkillData.observedSkillDimensions.length) {
            return this.getSkillTwin(traineeId);
        }

        const skillKeys = SKILL_KEYS;
        const wHist = SKILL_UPDATE_WEIGHTS.HISTORICAL;
        const wCurr = SKILL_UPDATE_WEIGHTS.CURRENT;
        const historyId = `session_${createHash("sha256").update(sessionId).digest("hex")}`;
        const historyRef = this.db.collection("skillHistory").doc(historyId);
        const profileRef = this.db.collection("skillProfiles").doc(traineeId);
        let updatedProfile;

        await this.db.runTransaction(async transaction => {
            const [historyDoc, profileDoc] = await Promise.all([
                transaction.get(historyRef),
                transaction.get(profileRef)
            ]);

            if (historyDoc.exists) {
                updatedProfile = profileDoc.exists
                    ? { traineeId, ...profileDoc.data() }
                    : { traineeId, ...historyDoc.data().profile };
                return;
            }

            const current = profileDoc.exists ? profileDoc.data() : {};
            const currentSkills = current.skills || {};
            const observedDimensions = new Set(
                Array.isArray(current.observedSkillDimensions)
                    ? current.observedSkillDimensions.filter(key =>
                        skillKeys.includes(key) &&
                        typeof currentSkills[key] === "number" &&
                        Number.isFinite(currentSkills[key])
                    )
                    : profileDoc.exists
                        ? skillKeys.filter(key => typeof currentSkills[key] === "number")
                        : []
            );
            const updatedSkills = {
                decisionMaking: 0,
                situationalAwareness: 0,
                safetyAwareness: 0,
                evacuationSkill: 0,
                emergencyResponse: 0,
                communication: 0,
                teamwork: 0,
                ...currentSkills
            };

            for (const key of sessionSkillData.observedSkillDimensions) {
                if (!skillKeys.includes(key)) continue;
                const currentScore = sessionSkillData.skills[key];
                updatedSkills[key] = observedDimensions.has(key)
                    ? Math.round((currentSkills[key] * wHist) + (currentScore * wCurr))
                    : currentScore;
                observedDimensions.add(key);
            }

            const observedScores = [...observedDimensions]
                .map(key => updatedSkills[key])
                .filter(score => typeof score === "number" && Number.isFinite(score));
            const overallScore = observedScores.length > 0
                ? Math.round(observedScores.reduce((total, score) => total + score, 0) / observedScores.length)
                : null;
            const trainingCount = (current.trainingCount || 0) + 1;
            const profile = {
                traineeId,
                skills: updatedSkills,
                observedSkillDimensions: [...observedDimensions],
                overallScore,
                trainingCount,
                trend: current.trend || TRENDS.STABLE,
                lastSessionScore: sessionSkillData.overallScore,
                lastUpdated: FieldValue.serverTimestamp()
            };

            transaction.create(historyRef, {
                traineeId,
                sessionId,
                skills: updatedSkills,
                observedSkillDimensions: sessionSkillData.observedSkillDimensions,
                overallScore: sessionSkillData.overallScore,
                createdAt: FieldValue.serverTimestamp()
            });
            transaction.set(profileRef, profile, { merge: true });
            updatedProfile = profile;
        });

        // Fetch recent snapshots to calculate overall trend
        const snapshots = await this.getSkillHistory(traineeId);
        const trend = this.calculateSkillTrend(snapshots);
        if (updatedProfile.trend !== trend) {
            await profileRef.update({ trend });
            updatedProfile.trend = trend;
        }

        logger.info(`Updated Digital Skill Twin profile for trainee ${traineeId}`);
        return updatedProfile;
    }

    async getSkillHistory(traineeId) {
        const snapshot = await this.db.collection("skillHistory")
            .where("traineeId", "==", traineeId)
            .get();

        const history = [];
        snapshot.forEach(doc => {
            history.push({ id: doc.id, ...doc.data() });
        });

        history.sort((a, b) =>
            (timestampMillis(a.createdAt) ?? 0) - (timestampMillis(b.createdAt) ?? 0)
        );
        return history;
    }

    async ensureSkillTwinFromCompletedSessions(traineeId) {
        const sessionsSnapshot = await this.db.collection("trainingSessions")
            .where("traineeId", "==", traineeId)
            .where("status", "==", "completed")
            .get();
        const sessions = [];
        sessionsSnapshot.forEach(doc => {
            sessions.push({ id: doc.id, ...doc.data() });
        });
        sessions.sort((a, b) =>
            (timestampMillis(a.completedAt ?? a.createdAt) ?? 0) -
            (timestampMillis(b.completedAt ?? b.createdAt) ?? 0)
        );

        const history = await this.getSkillHistory(traineeId);
        const processedSessionIds = new Set(history.map(record => record.sessionId));
        const profileRef = this.db.collection("skillProfiles").doc(traineeId);
        const profileDoc = await profileRef.get();

        if (!profileDoc.exists && history.length > 0) {
            const latest = history[history.length - 1];
            const observedSkillDimensions = [...new Set(history.flatMap(record =>
                Array.isArray(record.observedSkillDimensions)
                    ? record.observedSkillDimensions
                    : []
            ))].filter(key => SKILL_KEYS.includes(key));
            const observedScores = observedSkillDimensions
                .map(key => latest.skills?.[key])
                .filter(score => typeof score === "number" && Number.isFinite(score));
            await profileRef.set({
                traineeId,
                skills: latest.skills || {},
                observedSkillDimensions,
                overallScore: observedScores.length > 0
                    ? Math.round(observedScores.reduce((total, score) => total + score, 0) / observedScores.length)
                    : null,
                trainingCount: history.length,
                trend: this.calculateSkillTrend(history),
                lastSessionScore: latest.overallScore ?? null,
                lastUpdated: latest.createdAt || FieldValue.serverTimestamp()
            });
        }

        const eventService = require("./eventService");
        const performanceFeatureService = require("./performanceFeatureService");
        for (const session of sessions) {
            if (processedSessionIds.has(session.id)) continue;

            let features = session.performanceFeatures;
            if (!features) {
                const events = await eventService.getAllEventsForSession(session.id);
                if (events.length === 0) continue;
                features = performanceFeatureService.extractFeatures(session, events);
            }

            if (this.calculateSessionSkillScores(features).observedSkillDimensions.length === 0) {
                continue;
            }

            await this.updateSkillTwin(traineeId, session.id, features);
            processedSessionIds.add(session.id);
        }

        return this.getSkillTwin(traineeId);
    }

    async getSkillProgress(traineeId) {
        const currentProfile = await this.getSkillTwin(traineeId);
        const history = await this.getSkillHistory(traineeId);

        let previousScore = 0;
        let currentScore = currentProfile.overallScore ?? 0;

        if (history.length >= 2) {
            previousScore = history[history.length - 2].overallScore ?? 0;
            currentScore = history[history.length - 1].overallScore ?? currentScore;
        } else if (history.length === 1) {
            previousScore = 0;
            currentScore = history[0].overallScore ?? currentScore;
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

        const observedDimensions = currentProfile.observedSkillDimensions || skillKeys;
        if (history.length >= 2) {
            const prevSkills = history[history.length - 2].skills || {};
            const currSkills = history[history.length - 1].skills || {};

            observedDimensions.forEach(k => {
                const diff = (currSkills[k] ?? 0) - (prevSkills[k] ?? 0);
                if (diff > 3) dimensionTrends[k] = TRENDS.IMPROVING;
                else if (diff < -3) dimensionTrends[k] = TRENDS.DECLINING;
                else dimensionTrends[k] = TRENDS.STABLE;
            });
        } else {
            observedDimensions.forEach(k => dimensionTrends[k] = TRENDS.STABLE);
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
        const first = recent[0].overallScore ?? 0;
        const last = recent[recent.length - 1].overallScore ?? 0;
        const diff = last - first;

        if (diff > 3) return TRENDS.IMPROVING;
        if (diff < -3) return TRENDS.DECLINING;
        return TRENDS.STABLE;
    }

    async recalculateSkillProfile(traineeId) {
        // Fetch all completed training sessions for trainee
        const sessionsSnapshot = await this.db.collection("trainingSessions")
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
                decisionMaking: 0,
                situationalAwareness: 0,
                safetyAwareness: 0,
                evacuationSkill: 0,
                emergencyResponse: 0,
                communication: 0,
                teamwork: 0
            },
            overallScore: 0,
            trainingCount: 0,
            trend: TRENDS.STABLE,
            lastSessionScore: 0,
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

const skillTwinService = new SkillTwinService();
module.exports = skillTwinService;
module.exports.SkillTwinService = SkillTwinService;
