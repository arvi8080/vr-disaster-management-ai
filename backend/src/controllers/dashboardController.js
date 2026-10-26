const { db } = require("../config/firebase");
const skillTwinService = require("../services/skillTwinService");
const { timestampMillis } = require("../utils/timestamp");
const { sendSuccess } = require("../utils/response");
const { ROLES, TRENDS } = require("../utils/constants");

async function getTrainerAssignedTrainees(database, trainerUid) {
    const [traineesSnapshot, trainerDoc] = await Promise.all([
        database.collection("users")
            .where("assignedTrainerId", "==", trainerUid)
            .get(),
        database.collection("users").doc(trainerUid).get()
    ]);
    const trainees = new Map();

    traineesSnapshot.forEach(doc => {
        if (doc.data().role !== ROLES.TRAINEE) {
            return;
        }
        trainees.set(doc.id, { uid: doc.id, ...doc.data() });
    });

    const trainerData = trainerDoc.exists ? trainerDoc.data() : {};
    const indexedTraineeIds = Array.isArray(trainerData.assignedTraineeIds)
        ? trainerData.assignedTraineeIds
        : [];
    const missingTraineeIds = indexedTraineeIds.filter(uid => !trainees.has(uid));
    const indexedTraineeDocs = await Promise.all(
        missingTraineeIds.map(uid => database.collection("users").doc(uid).get())
    );

    for (const traineeDoc of indexedTraineeDocs) {
        if (!traineeDoc.exists) {
            continue;
        }
        const trainee = traineeDoc.data();
        if (trainee.role !== ROLES.TRAINEE ||
            (trainee.assignedTrainerId && trainee.assignedTrainerId !== trainerUid)) {
            continue;
        }
        trainees.set(traineeDoc.id, { uid: traineeDoc.id, ...trainee });
    }

    return Array.from(trainees.values());
}

class DashboardController {
    async getTraineeDashboard(req, res, next) {
        try {
            const traineeId = req.user.uid;

            // Fetch user's sessions
            const sessionsSnapshot = await db.collection("trainingSessions")
                .where("traineeId", "==", traineeId)
                .get();

            const sessions = [];
            sessionsSnapshot.forEach(doc => {
                sessions.push({ id: doc.id, ...doc.data() });
            });

            const completedSessions = sessions.filter(s => s.status === "completed");
            const totalSessions = sessions.length;
            const scoredSessions = completedSessions.filter(s => typeof s.score === "number" && Number.isFinite(s.score));
            const totalScore = scoredSessions.reduce((total, session) => total + session.score, 0);
            const averageScore = scoredSessions.length > 0 ? Math.round(totalScore / scoredSessions.length) : 0;

            completedSessions.sort((a, b) =>
                (timestampMillis(b.completedAt ?? b.createdAt) ?? 0) -
                (timestampMillis(a.completedAt ?? a.createdAt) ?? 0)
            );
            const latestScore = completedSessions.length > 0 && typeof completedSessions[0].score === "number"
                ? completedSessions[0].score
                : 0;

            // Fetch Digital Skill Twin & Progress
            const skillTwin = await skillTwinService.getSkillTwin(traineeId);
            const progress = await skillTwinService.getSkillProgress(traineeId);

            // Fetch latest feedback
            const feedbackSnapshot = await db.collection("feedback")
                .where("traineeId", "==", traineeId)
                .limit(1)
                .get();

            let latestFeedback = null;
            feedbackSnapshot.forEach(doc => {
                latestFeedback = { id: doc.id, ...doc.data() };
            });

            const recommendations = latestFeedback && latestFeedback.recommendations
                ? latestFeedback.recommendations
                : ["Continue completing scenarios to increase skill levels"];

            return sendSuccess(res, {
                summary: {
                    totalSessions,
                    completedSessions: completedSessions.length,
                    averageScore,
                    latestScore
                },
                skills: skillTwin.skills || {},
                overallScore: skillTwin.overallScore ?? 0,
                trends: {
                    overall: progress.trend,
                    dimensionTrends: progress.dimensionTrends
                },
                progress: {
                    previousScore: progress.previousScore,
                    currentScore: progress.currentScore,
                    improvement: progress.improvement,
                    trend: progress.trend
                },
                latestFeedback,
                recommendations
            }, "Trainee dashboard metrics retrieved successfully");
        } catch (error) {
            next(error);
        }
    }

    async getTrainerDashboard(req, res, next) {
        try {
            const isTrainer = req.user.role === ROLES.TRAINER;
            const trainerUid = isTrainer ? req.user.uid : (req.query.trainerId || null);

            let assignedTrainees;
            if (trainerUid) {
                assignedTrainees = await getTrainerAssignedTrainees(db, trainerUid);
            } else {
                const traineesSnapshot = await db.collection("users")
                    .where("role", "==", ROLES.TRAINEE)
                    .get();
                assignedTrainees = traineesSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
            }
            const assignedTraineeIds = new Set();

            assignedTrainees.forEach(trainee => assignedTraineeIds.add(trainee.uid));

            const totalTrainees = assignedTrainees.length;

            // Skill Profiles & Trends for assigned trainees
            const skillProfilesSnapshot = await db.collection("skillProfiles").get();
            const improvingTrainees = [];
            const decliningTrainees = [];
            const atRiskTrainees = [];
            let aggregateScoreSum = 0;
            let profileCount = 0;

            skillProfilesSnapshot.forEach(doc => {
                const traineeId = doc.id;
                if (!trainerUid || assignedTraineeIds.has(traineeId)) {
                    const profile = doc.data();
                    profileCount++;
                    aggregateScoreSum += (profile.overallScore || 50);

                    const item = {
                        traineeId,
                        overallScore: profile.overallScore,
                        trend: profile.trend || TRENDS.STABLE,
                        lastUpdated: profile.lastUpdated
                    };

                    if (profile.trend === TRENDS.IMPROVING) improvingTrainees.push(item);
                    if (profile.trend === TRENDS.DECLINING) decliningTrainees.push(item);
                    if ((profile.overallScore || 50) < 60) atRiskTrainees.push(item);
                }
            });

            const averagePerformance = profileCount > 0 ? Math.round(aggregateScoreSum / profileCount) : 0;

            // Fetch recent sessions for assigned trainees
            const sessionsSnapshot = await db.collection("trainingSessions").get();

            const sessions = [];
            sessionsSnapshot.forEach(doc => {
                const sessionData = doc.data();
                if (!trainerUid || assignedTraineeIds.has(sessionData.traineeId)) {
                    sessions.push({ id: doc.id, ...sessionData });
                }
            });

            sessions.sort((a, b) =>
                (timestampMillis(b.createdAt ?? b.startedAt) ?? 0) -
                (timestampMillis(a.createdAt ?? a.startedAt) ?? 0)
            );

            return sendSuccess(res, {
                totalTrainees,
                assignedTrainees,
                totalSessions: sessions.length,
                averagePerformance,
                improvingTraineesCount: improvingTrainees.length,
                decliningTraineesCount: decliningTrainees.length,
                improvingTrainees,
                decliningTrainees,
                atRiskTrainees,
                recentSessions: sessions.slice(0, 10)
            }, "Trainer dashboard metrics retrieved successfully");
        } catch (error) {
            next(error);
        }
    }

    async getAdminDashboard(req, res, next) {
        try {
            const usersSnapshot = await db.collection("users").get();
            let totalUsers = 0;
            let totalTrainees = 0;
            let totalTrainers = 0;

            usersSnapshot.forEach(doc => {
                totalUsers++;
                const u = doc.data();
                if (u.role === ROLES.TRAINEE) totalTrainees++;
                if (u.role === ROLES.TRAINER) totalTrainers++;
            });

            const scenariosSnapshot = await db.collection("scenarios").get();
            const totalScenarios = scenariosSnapshot.size;

            const sessionsSnapshot = await db.collection("trainingSessions").get();
            const totalSessions = sessionsSnapshot.size;

            const systemStatistics = {
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                nodeVersion: process.version,
                timestamp: new Date().toISOString()
            };

            return sendSuccess(res, {
                totalUsers,
                totalTrainees,
                totalTrainers,
                totalScenarios,
                totalSessions,
                systemStatistics
            }, "Admin dashboard metrics retrieved successfully");
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DashboardController();
module.exports.getTrainerAssignedTrainees = getTrainerAssignedTrainees;
