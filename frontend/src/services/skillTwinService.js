import { api } from "./api";

export async function fetchMySkillTwin() {
  const res = await api("/skill-twin/me");
  return res.data;
}

export async function fetchMySkillTwinHistory() {
  const res = await api("/skill-twin/me/history");
  return res.data;
}

export async function fetchTraineeSkillTwin(traineeId) {
  const res = await api(`/skill-twin/${traineeId}`);
  return res.data;
}

export const skillTwinService = {
  fetchMySkillTwin,
  fetchMySkillTwinHistory,
  fetchTraineeSkillTwin,
  fetchSkillTwin: fetchMySkillTwin
};