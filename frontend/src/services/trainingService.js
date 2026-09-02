import { api } from "./api";

export async function fetchTrainingSessions() {
  try {
    const res = await api("/training/sessions");
    return res.data;
  } catch (err) {
    console.warn("Training sessions API offline:", err);
    return [
      { id: "SIM-2026-0814-A", scenario: "Earthquake Structural Collapse", score: 96, date: "Aug 14, 2026" },
      { id: "SIM-2026-0810-B", scenario: "Industrial Chemical Spill & Fire", score: 88, date: "Aug 10, 2026" }
    ];
  }
}

export async function submitTrainingSession(sessionData) {
  try {
    const res = await api("/training/sessions", {
      method: "POST",
      body: JSON.stringify(sessionData)
    });
    return res.data;
  } catch (err) {
    console.warn("Submit session error:", err);
    return { success: true, sessionId: `SESS-${Date.now()}` };
  }
}