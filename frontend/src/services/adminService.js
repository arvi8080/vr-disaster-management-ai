import { api } from "./api";

export async function fetchUsers(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const res = await api(`/admin/users${queryString ? `?${queryString}` : ""}`);
    return res.data;
  } catch (err) {
    console.warn("Admin fetchUsers API offline:", err);
    return [
      { uid: "usr-01", name: "Manav Vartak", email: "manav@ResQVerse.vr", role: "trainee", dept: "CS Lab", allowedScenarios: ["fire", "flood", "earthquake"], assignedTrainerId: "trainer-official" },
      { uid: "usr-02", name: "Priya Sharma", email: "priya@ResQVerse.vr", role: "trainee", dept: "Electronics", allowedScenarios: ["fire", "earthquake"], assignedTrainerId: "trainer-official" },
      { uid: "usr-03", name: "Trainer Official", email: "trainer@ResQVerse.vr", role: "trainer", allowedScenarios: ["fire", "flood", "earthquake"] }
    ];
  }
}

export async function assignTrainer(traineeId, trainerId) {
  try {
    const res = await api("/admin/assign-trainer", {
      method: "POST",
      body: JSON.stringify({ traineeId, trainerId })
    });
    return res.data;
  } catch (err) {
    console.warn("assignTrainer API error:", err);
    return { traineeId, trainerId };
  }
}

export async function updatePermissions(uid, allowedScenarios) {
  try {
    const res = await api("/admin/permissions", {
      method: "POST",
      body: JSON.stringify({ uid, allowedScenarios })
    });
    return res.data;
  } catch (err) {
    console.warn("updatePermissions API error:", err);
    return { uid, allowedScenarios };
  }
}

export async function approveTrainer(uid, approve = true) {
  try {
    const res = await api("/admin/approve-trainer", {
      method: "POST",
      body: JSON.stringify({ uid, approve })
    });
    return res.data;
  } catch (err) {
    console.warn("approveTrainer API error:", err);
    return { uid, approve };
  }
}

export const adminService = {
  fetchUsers,
  assignTrainer,
  updatePermissions,
  approveTrainer
};
