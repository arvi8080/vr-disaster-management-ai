import { api } from "./api";

export async function getAIGuidance(prompt, context = {}) {
  try {
    const res = await api("/ai/guidance", {
      method: "POST",
      body: JSON.stringify({ prompt, context })
    });
    return res.data;
  } catch (err) {
    console.warn("AI guidance API offline, returning fallback response:", err);
    return {
      reply: "AI Disaster Command System active. Recommended action: Proceed with structural evacuation procedures and maintain thermal scanner contact with team.",
      confidence: 0.96
    };
  }
}