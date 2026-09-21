import { api } from "./api";

export async function fetchScenarios(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const res = await api(`/scenarios${queryString ? `?${queryString}` : ""}`);
    return res.data;
  } catch (err) {
    console.warn("Backend scenarios API offline, using fallback catalog:", err);
    return [
      {
        id: "sc-fire-01",
        title: "Fire in Classroom",
        description: "Learn how to respond to fire incidents in a lab or classroom.",
        disasterType: "fire",
        category: "Fire Safety",
        difficulty: "Intermediate",
        active: true
      },
      {
        id: "sc-flood-01",
        title: "Flood in Building",
        description: "Train for indoor flooding and emergency evacuation procedures.",
        disasterType: "flood",
        category: "Water Hazard",
        difficulty: "Advanced",
        active: true
      },
      {
        id: "sc-earthquake-01",
        title: "Earthquake Drill",
        description: "Practice safe evacuation and essential actions during earthquakes.",
        disasterType: "earthquake",
        category: "Seismic Safety",
        difficulty: "Beginner",
        active: true
      }
    ];
  }
}

export async function fetchScenarioById(id) {
  try {
    const res = await api(`/scenarios/${id}`);
    return res.data;
  } catch (err) {
    console.warn(`Scenario ${id} API fetch error:`, err);
    return null;
  }
}

export const scenarioService = {
  get: fetchScenarios,
  getById: fetchScenarioById
};