const { db } = require("../config/firebase");
const skillTwinService = require("../services/skillTwinService");
const { sendSuccess } = require("../utils/response");
const { ROLES, TRENDS } = require("../utils/constants");

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

            let totalScore = 0;
            completedSessions.forEach(s => {
                totalScore += (s.score || 0);
            });
            const averageScore = completedSessions.length > 0 ? Math.round(totalScore / completedSessions.length) : 0;

            completedSessions.sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));
            const latestScore = completedSessions.length > 0 ? completedSessions[0].score || 0 : 0;

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
                overallScore: skillTwin.overallScore || 50,
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
            // Trainee counts
            const traineesSnapshot = await db.collection("users")
                .where("role", "==", ROLES.TRAINEE)
                .get();
            const totalTrainees = traineesSnapshot.size;

            // Skill Profiles & Trends
            const skillProfilesSnapshot = await db.collection("skillProfiles").get();
            const improvingTrainees = [];
            const decliningTrainees = [];
            const atRiskTrainees = [];
            let aggregateScoreSum = 0;
            let profileCount = 0;

            skillProfilesSnapshot.forEach(doc => {
                const profile = doc.data();
                profileCount++;
                aggregateScoreSum += (profile.overallScore || 50);

                const item = {
                    traineeId: doc.id,
                    overallScore: profile.overallScore,
                    trend: profile.trend || TRENDS.STABLE,
                    lastUpdated: profile.lastUpdated
                };

                if (profile.trend === TRENDS.IMPROVING) improvingTrainees.push(item);
                if (profile.trend === TRENDS.DECLINING) decliningTrainees.push(item);
                if ((profile.overallScore || 50) < 60) atRiskTrainees.push(item);
            });

            const averagePerformance = profileCount > 0 ? Math.round(aggregateScoreSum / profileCount) : 0;

            // Fetch recent sessions
            const sessionsSnapshot = await db.collection("trainingSessions")
                .limit(20)
                .get();

            const sessions = [];
            sessionsSnapshot.forEach(doc => {
                sessions.push({ id: doc.id, ...doc.data() });
            });

            return sendSuccess(res, {
                totalTrainees,
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

