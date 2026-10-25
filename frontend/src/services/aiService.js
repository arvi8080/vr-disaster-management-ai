import { api } from "./api";

export async function getAIGuidance(prompt, context = {}) {
  const res = await api("/ai/guidance", {
    method: "POST",
    body: JSON.stringify({ prompt, context })
  });
  return res.data;
}

export async function analyzeTrainingSession(sessionId) {
  const res = await api(`/ai/analyze/${encodeURIComponent(sessionId)}`, {
    method: "POST"
  });
  return res.data;
}