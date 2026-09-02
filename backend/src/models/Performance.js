class Performance {
    constructor({ userId, totalSessions = 0, averageScore = 0, readinessCategory = "TIER_I" }) {
        this.userId = userId;
        this.totalSessions = totalSessions;
        this.averageScore = averageScore;
        this.readinessCategory = readinessCategory;
    }
}

module.exports = Performance;
