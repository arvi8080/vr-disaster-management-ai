class TrainingSession {
    constructor({ sessionId, userId, scenarioId, scenarioName, durationSeconds, score, status = "Completed" }) {
        this.sessionId = sessionId || `SESS-${Date.now()}`;
        this.userId = userId;
        this.scenarioId = scenarioId;
        this.scenarioName = scenarioName;
        this.durationSeconds = durationSeconds || 600;
        this.score = score || 0;
        this.status = status;
        this.timestamp = new Date().toISOString();
    }
}

module.exports = TrainingSession;
