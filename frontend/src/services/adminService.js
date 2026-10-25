import { api } from "./api";

export async function fetchUsers(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const res = await api(`/admin/users${queryString ? `?${queryString}` : ""}`);
  return res.data;
}

export async function assignTrainer(traineeId, trainerId) {
  const res = await api("/admin/assign-trainer", {
    method: "POST",
    body: JSON.stringify({ traineeId, trainerId })
  });
  return res.data;
}

export async function updatePermissions(uid, allowedScenarios) {
  const res = await api("/admin/permissions", {
    method: "POST",
    body: JSON.stringify({ uid, allowedScenarios })
  });
  return res.data;
}

export async function approveTrainer(uid, approve = true) {
  const res = await api("/admin/approve-trainer", {
    method: "POST",
    body: JSON.stringify({ uid, approve })
  });
  return res.data;
}

export async function assignScenarioToTrainer(scenarioId, trainerId) {
  const res = await api("/training-assignments", {
    method: "POST",
    body: JSON.stringify({ scenarioId, trainerId })
  });
  return res;
}

export const adminService = {
  fetchUsers,
  assignTrainer,
  updatePermissions,
  approveTrainer,
  assignScenarioToTrainer
};
