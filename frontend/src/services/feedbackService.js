import { api } from "./api";

export async function fetchMyFeedback() {
  try {
    const res = await api("/feedback/me");
    return res.data;
  } catch (err) {
    console.warn("fetchMyFeedback API offline:", err);
    return {
      aiFeedback: "Excellent extinguisher technique. Remember to pull pin firmly and aim at the base of the fire.",
      recommendations: ["Practice immediate drop under sturdy furniture during initial tremors."]
    };
  }
}

export async function fetchTraineeFeedback(traineeId) {
  try {
    const res = await api(`/feedback/${traineeId}`);
    return res.data;
  } catch (err) {
    console.warn(`fetchTraineeFeedback ${traineeId} error:`, err);
    return {
      aiFeedback: "Good overall response. Slower evacuation speed in corridor zone.",
      recommendations: ["Improve reaction time during initial alarm."]
    };
  }
}

export const feedbackService = {
  fetchMyFeedback,
  fetchTraineeFeedback,
  get: fetchMyFeedback
};