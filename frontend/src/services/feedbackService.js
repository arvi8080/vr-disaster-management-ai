import { api } from "./api";

export async function fetchMyFeedback() {
  const res = await api("/feedback/me");
  return res.data;
}

export async function fetchAllMyFeedback() {
  const feedback = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const res = await api(`/feedback/me?page=${page}&limit=100`);
    if (!Array.isArray(res.data)) {
      throw new Error("Feedback history response was invalid.");
    }
    feedback.push(...res.data);
    hasNextPage = Boolean(res.pagination?.hasNextPage);
    page += 1;
  }

  return feedback;
}

export async function fetchTraineeFeedback(traineeId) {
  const res = await api(`/feedback/${traineeId}`);
  return res.data;
}

export const feedbackService = {
  fetchMyFeedback,
  fetchAllMyFeedback,
  fetchTraineeFeedback,
  get: fetchMyFeedback
};