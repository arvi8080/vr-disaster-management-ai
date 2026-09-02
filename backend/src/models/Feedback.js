class Feedback {
    constructor({ feedbackId, sessionId, userId, aiDebrief, category }) {
        this.feedbackId = feedbackId || `FB-${Date.now()}`;
        this.sessionId = sessionId;
        this.userId = userId;
        this.aiDebrief = aiDebrief;
        this.category = category || "EXCELLENT";
        this.timestamp = new Date().toISOString();
    }
}

module.exports = Feedback;
