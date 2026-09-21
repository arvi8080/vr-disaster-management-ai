import { api } from "./api";

export async function fetchMySkillTwin() {
  try {
    const res = await api("/skill-twin/me");
    return res.data;
  } catch (err) {
    console.warn("Backend offline, returning fallback skill twin data:", err);
    return {
      overallScore: 88,
      skills: {
        decisionMaking: 90,
        situationalAwareness: 92,
        safetyAwareness: 86,
        evacuationSkill: 84,
        emergencyResponse: 90
      },
      trend: "IMPROVING"
    };
  }
}

export async function fetchTraineeSkillTwin(traineeId) {
  try {
    const res = await api(`/skill-twin/${traineeId}`);
    return res.data;
  } catch (err) {
    console.warn(`Trainee ${traineeId} skill twin API error:`, err);
    return {
      overallScore: 85,
      skills: {
        decisionMaking: 88,
        situationalAwareness: 90,
        safetyAwareness: 84,
        evacuationSkill: 80,
        emergencyResponse: 86
      },
      trend: "STABLE"
    };
  }
}

export const skillTwinService = {
  fetchMySkillTwin,
  fetchTraineeSkillTwin,
  fetchSkillTwin: fetchMySkillTwin
};