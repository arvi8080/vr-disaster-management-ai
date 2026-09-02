class TraineeEvent {
    constructor({ eventId, sessionId, eventType, timestamp, reactionTimeMs, decisionCorrect }) {
        this.eventId = eventId || `EVT-${Date.now()}`;
        this.sessionId = sessionId;
        this.eventType = eventType;
        this.timestamp = timestamp || new Date().toISOString();
        this.reactionTimeMs = reactionTimeMs || 500;
        this.decisionCorrect = decisionCorrect !== undefined ? decisionCorrect : true;
    }
}

module.exports = TraineeEvent;
