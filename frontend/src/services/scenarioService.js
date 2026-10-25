import { api } from "./api";

export async function fetchScenarios(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const res = await api(`/scenarios${queryString ? `?${queryString}` : ""}`);
  return res.data;
}

export async function fetchScenarioById(id) {
  const res = await api(`/scenarios/${id}`);
  return res.data;
}

export async function fetchUnityScenarios() {
  const res = await api("/training-assignments/scenarios");
  return res.data;
}

export const scenarioService = {
  get: fetchScenarios,
  getById: fetchScenarioById,
  getUnityScenarios: fetchUnityScenarios
};