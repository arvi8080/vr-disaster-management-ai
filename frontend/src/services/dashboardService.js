import { api } from "./api";

export async function fetchTraineeDashboard() {
  const res = await api("/dashboard/trainee");
  return res.data;
}

export async function fetchTrainerDashboard() {
  const res = await api("/dashboard/trainer");
  return res.data;
}

export async function fetchAdminDashboard() {
  const res = await api("/dashboard/admin");
  return res.data;
}

export const dashboardService = {
  fetchTraineeDashboard,
  fetchTrainerDashboard,
  fetchAdminDashboard
};