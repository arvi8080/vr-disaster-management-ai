import { api } from "./api";

export async function fetchMySessions() {
  const res = await api("/training/my-sessions");
  return res.data;
}

export async function fetchAllMySessions() {
  const sessions = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const res = await api(`/training/my-sessions?page=${page}&limit=100`);
    if (!Array.isArray(res.data)) {
      throw new Error("Training history response was invalid.");
    }
    sessions.push(...res.data);
    hasNextPage = Boolean(res.pagination?.hasNextPage);
    page += 1;
  }

  return sessions;
}

export async function fetchSimulationById(simulationId) {
  const res = await api(`/training/simulations/${encodeURIComponent(simulationId)}`);
  return res.data;
}

export async function fetchMyAssignments() {
  const res = await api("/training-assignments/mine");
  return res.data;
}

export async function fetchAssignmentsForMe() {
  const res = await api("/training-assignments/for-me");
  return res.data;
}

export async function assignScenarioToTrainee({ scenarioId, traineeId, dueAt }) {
  const res = await api("/training-assignments/to-trainee", {
    method: "POST",
    body: JSON.stringify({ scenarioId, traineeId, dueAt })
  });
  return res;
}

export async function updateTraineeAssignmentDeadline(assignmentId, dueAt) {
  const res = await api(`/training-assignments/${encodeURIComponent(assignmentId)}/deadline`, {
    method: "PATCH",
    body: JSON.stringify({ dueAt })
  });
  return res.data;
}

export async function createSession(scenarioId, assignmentId = null) {
  const res = await api("/training/sessions", {
    method: "POST",
    body: JSON.stringify({ scenarioId, ...(assignmentId ? { assignmentId } : {}) })
  });
  return res.data;
}

export async function startSession(sessionId) {
  const res = await api(`/training/sessions/${sessionId}/start`, {
    method: "POST"
  });
  return res.data;
}

export async function cancelSession(sessionId) {
  const res = await api(`/training/sessions/${sessionId}/cancel`, {
    method: "POST"
  });
  return res.data;
}

export async function postSessionEvents(sessionId, events) {
  return Promise.all(events.map(async event => {
    const res = await api("/training/events", {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        eventType: event.eventType,
        timestamp: event.timestamp,
        metadata: event.details || {}
      })
    });
    return res.data;
  }));
}

export async function completeSession(sessionId, completionBody = {}) {
  const res = await api(`/training/sessions/${sessionId}/complete`, {
    method: "POST",
    body: JSON.stringify(completionBody)
  });
  return res.data;
}

export const trainingService = {
  fetchMySessions,
  fetchAllMySessions,
  fetchSimulationById,
  fetchMyAssignments,
  fetchAssignmentsForMe,
  assignScenarioToTrainee,
  createSession,
  startSession,
  cancelSession,
  postSessionEvents,
  completeSession
};