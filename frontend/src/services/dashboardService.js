import { api } from "./api";

export async function fetchTraineeDashboard() {
  try {
    const res = await api("/dashboard/trainee");
    return res.data;
  } catch (err) {
    console.warn("Trainee Dashboard API offline, returning fallback:", err);
    return {
      summary: {
        totalSessions: 3,
        completedSessions: 3,
        averageScore: 86,
        latestScore: 92
      },
      skills: {
        decisionMaking: 88,
        situationalAwareness: 92,
        safetyAwareness: 85,
        evacuationSkill: 80,
        emergencyResponse: 90
      },
      overallScore: 87,
      trends: { overall: "IMPROVING" },
      latestFeedback: {
        aiFeedback: "Good extinguisher technique. Remember to isolate power breakers before applying foam."
      },
      recommendations: ["Conduct hazmat chemical isolation speed drills."]
    };
  }
}

export async function fetchTrainerDashboard() {
  try {
    const res = await api("/dashboard/trainer");
    return res.data;
  } catch (err) {
    console.warn("Trainer Dashboard API offline, returning fallback:", err);
    return {
      totalTrainees: 2,
      assignedTrainees: [
        { uid: "trainee-01", name: "Manav Vartak", email: "manav@ResQVerse.vr", dept: "CS Lab", overallScore: 86, trend: "IMPROVING" },
        { uid: "trainee-02", name: "Priya Sharma", email: "priya@ResQVerse.vr", dept: "Electronics", overallScore: 91, trend: "STABLE" }
      ],
      totalSessions: 5,
      averagePerformance: 88.5
    };
  }
}

export async function fetchAdminDashboard() {
  try {
    const res = await api("/dashboard/admin");
    return res.data;
  } catch (err) {
    console.warn("Admin Dashboard API offline, returning fallback:", err);
    return {
      totalUsers: 14,
      totalTrainees: 10,
      totalTrainers: 3,
      totalScenarios: 3,
      totalSessions: 12,
      systemStatistics: {
        uptime: process.uptime ? process.uptime() : 1200,
        nodeVersion: "v24.x",
        timestamp: new Date().toISOString()
      }
    };
  }
}

export const dashboardService = {
  fetchTraineeDashboard,
  fetchTrainerDashboard,
  fetchAdminDashboard
};