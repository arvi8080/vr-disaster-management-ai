const calculateSessionScore = (hazardsAvoided, totalHazards, casualtiesRescued, protocolViolations, durationSeconds) => {
    const hazardScore = (hazardsAvoided / Math.max(totalHazards, 1)) * 40;
    const rescueScore = Math.min(casualtiesRescued / 3.0, 1.0) * 30;
    const protocolScore = Math.max(30 - (protocolViolations * 5), 0);

    const total = Math.round(hazardScore + rescueScore + protocolScore);
    return Math.min(Math.max(total, 0), 100);
};

const calculateObservedSessionScore = ({ objectiveCompletionRate, decisionAccuracy, protocolCompliance } = {}) => {
    const observedMetrics = [objectiveCompletionRate, decisionAccuracy, protocolCompliance]
        .filter(value => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100);

    if (observedMetrics.length === 0) {
        return null;
    }

    return Math.round(observedMetrics.reduce((total, value) => total + value, 0) / observedMetrics.length);
};

module.exports = {
    calculateSessionScore,
    calculateObservedSessionScore
};
