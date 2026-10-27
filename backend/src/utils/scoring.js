const { timestampMillis } = require("./timestamp");

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

const getObservedSessionScore = session => {
    const features = session.performanceFeatures || {};
    const scoreComponents = features.scoreComponents || {};
    const objectiveFlags = {
        ...(features.objectiveFlags || {}),
        ...(typeof session.powerWasTurnedOff === "boolean" ? { powerWasTurnedOff: session.powerWasTurnedOff } : {}),
        ...(typeof session.pinWasRemoved === "boolean" ? { pinWasRemoved: session.pinWasRemoved } : {}),
        ...(typeof session.fireWasExtinguished === "boolean" ? { fireWasExtinguished: session.fireWasExtinguished } : {})
    };
    const observedObjectives = Object.values(objectiveFlags).filter(value => typeof value === "boolean");
    const storedObjectiveCompletionRate = typeof scoreComponents.objectiveCompletionRate === "number"
        ? scoreComponents.objectiveCompletionRate
        : typeof features.objectiveCompletionRate === "number"
            ? features.objectiveCompletionRate
            : undefined;
    const objectiveCompletionRate = observedObjectives.length > 0
        ? (observedObjectives.filter(Boolean).length / observedObjectives.length) * 100
        : typeof scoreComponents.objectiveCompletionRate === "number" ||
            (typeof storedObjectiveCompletionRate === "number" &&
                (storedObjectiveCompletionRate > 0 || session.actionsCompleted > 0))
            ? storedObjectiveCompletionRate
            : undefined;

    const correctDecisions = features.correctDecisions;
    const wrongDecisions = features.wrongDecisions;
    const decisionCount = correctDecisions + wrongDecisions;
    const decisionAccuracy = typeof scoreComponents.decisionAccuracy === "number"
        ? scoreComponents.decisionAccuracy
        : Number.isFinite(decisionCount) && decisionCount > 0
            ? (correctDecisions / decisionCount) * 100
            : undefined;

    const storedViolationCount = typeof features.safetyViolations === "number"
        ? features.safetyViolations
        : typeof session.safetyViolations === "number"
            ? session.safetyViolations
            : undefined;
    const violationCount = session.procedureViolation === true
        ? Math.max(1, storedViolationCount || 0)
        : session.procedureViolation === false
            ? storedViolationCount || 0
            : typeof storedViolationCount === "number" &&
                (storedViolationCount > 0 || session.actionsCompleted > 0)
                ? storedViolationCount
                : undefined;
    const protocolCompliance = typeof scoreComponents.protocolCompliance === "number"
        ? scoreComponents.protocolCompliance
        : typeof violationCount === "number"
            ? Math.max(0, 100 - (violationCount * 20))
            : undefined;

    const observedScore = calculateObservedSessionScore({
        objectiveCompletionRate,
        decisionAccuracy,
        protocolCompliance
    });
    if (observedScore !== null) {
        return observedScore;
    }

    const skillScores = features.skillScores && typeof features.skillScores === "object"
        ? Object.values(features.skillScores).filter(value =>
            typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100
        )
        : [];
    if (skillScores.length > 0) {
        return Math.round(skillScores.reduce((total, value) => total + value, 0) / skillScores.length);
    }

    return typeof session.score === "number" &&
        Number.isFinite(session.score) &&
        session.score >= 0 &&
        session.score <= 100
        ? session.score
        : null;
};

const getSavedAiSessionScores = (completedSessions, feedbackRecords) => {
    const completedSessionIds = new Set(completedSessions.map(session => session.id));
    const latestScores = new Map();

    feedbackRecords.forEach(record => {
        if (
            record.type !== "AI" ||
            !completedSessionIds.has(record.sessionId) ||
            typeof record.performanceScore !== "number" ||
            !Number.isFinite(record.performanceScore) ||
            record.performanceScore < 0 ||
            record.performanceScore > 100
        ) {
            return;
        }

        const existing = latestScores.get(record.sessionId);
        const recordTime = timestampMillis(record.createdAt);
        const existingTime = existing ? timestampMillis(existing.createdAt) : -1;
        if (!existing || recordTime >= existingTime) {
            latestScores.set(record.sessionId, record);
        }
    });

    return new Map(
        [...latestScores].map(([sessionId, record]) => [sessionId, record.performanceScore])
    );
};

const getLatestSavedAiScore = (completedSessions, feedbackRecords) => {
    const completedSessionIds = new Set(completedSessions.map(session => session.id));
    const evaluations = feedbackRecords.filter(record =>
        record.type === "AI" &&
        completedSessionIds.has(record.sessionId) &&
        typeof record.performanceScore === "number" &&
        Number.isFinite(record.performanceScore) &&
        record.performanceScore >= 0 &&
        record.performanceScore <= 100
    );
    evaluations.sort((a, b) =>
        timestampMillis(b.createdAt) - timestampMillis(a.createdAt)
    );
    return evaluations[0]?.performanceScore ?? null;
};

module.exports = {
    calculateSessionScore,
    calculateObservedSessionScore,
    getObservedSessionScore,
    getSavedAiSessionScores,
    getLatestSavedAiScore
};
