import { api } from "./api";

export async function fetchDashboardData() {
  try {
    const res = await api("/dashboard");
    return res.data;
  } catch (err) {
    console.warn("Dashboard API offline:", err);
    return {
      activeIncidents: 7,
      totalTrainees: 24,
      systemStatus: "All Systems Operational",
      vrNetworkStatus: "Online"
    };
  }
}