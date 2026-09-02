import { api } from "./api";

export async function fetchSkillTwin(userId = "user-01") {
  try {
    const res = await api(`/skills/twin/${userId}`);
    return res.data;
  } catch (err) {
    console.warn("Backend offline, returning fallback skill twin data:", err);
    return {
      user_id: userId,
      overall_readiness: 94.2,
      skill_metrics: {
        reflexes: 92.0,
        tactical_awareness: 94.5,
        hazard_mitigation: 96.0,
        stress_resilience: 89.0,
        protocol_compliance: 95.5,
        overall_readiness: 94.2
      },
      strengths: [
        "Exceptional structural hazard detection speed",
        "100% compliance with evacuation safety protocols",
        "High casualty extraction efficiency under stress"
      ],
      weaknesses: [
        "Hazmat chemical foam deployment delay by 15s"
      ],
      ai_recommendations: [
        "Conduct hazmat chemical isolation speed drills",
        "Participate in high-intensity earthquake tremor scenarios"
      ]
    };
  }
}

export async function evaluateSkillTwin(userId, historicalSessions) {
  try {
    const res = await api("/skills/twin/evaluate", {
      method: "POST",
      body: JSON.stringify({ userId, historicalSessions })
    });
    return res.data;
  } catch (err) {
    console.warn("Skill evaluation error:", err);
    return fetchSkillTwin(userId);
  }
}