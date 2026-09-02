class SkillTwin {
    constructor({ userId, overallReadiness, metrics, strengths, weaknesses, aiRecommendations }) {
        this.userId = userId;
        this.overallReadiness = overallReadiness || 90.0;
        this.metrics = metrics || {
            reflexes: 90,
            tactical_awareness: 92,
            hazard_mitigation: 94,
            stress_resilience: 88,
            protocol_compliance: 95
        };
        this.strengths = strengths || ["Rapid hazard avoidance"];
        this.weaknesses = weaknesses || ["Slight latency in chemical foam deployment"];
        this.aiRecommendations = aiRecommendations || ["Practice chemical isolation drills"];
        this.updatedAt = new Date().toISOString();
    }
}

module.exports = SkillTwin;
