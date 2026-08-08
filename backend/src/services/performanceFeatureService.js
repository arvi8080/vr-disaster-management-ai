class PerformanceFeatureService {
    extractFeatures(session, events, scenario = null) {
        let correctDecisions = 0;
        let wrongDecisions = 0;
        let safetyViolations = 0;
        let hazardsDetected = 0;
        let hazardsIgnored = 0;
        let victimsDetected = 0;
        let victimsRescued = 0;
        let objectivesCompleted = 0;
        let communicationActions = 0;
        let teamworkActions = 0;
        let playerMovedCount = 0;

        let evacuationStartedTime = null;
        let evacuationCompletedTime = null;
        let scenarioCompletedTime = null;
        let scenarioStartedTime = null;

        const reactionTimes = [];

        const startTime = session.startedAt && session.startedAt.toDate
            ? session.startedAt.toDate().getTime()
            : (events.length > 0 && events[0].createdAt ? new Date(events[0].createdAt).getTime() : Date.now());

        events.forEach(evt => {
            const t = new Date(evt.timestamp || evt.createdAt).getTime();

            switch (evt.eventType) {
                case "SCENARIO_STARTED":
                    scenarioStartedTime = t;
                    break;
                case "PLAYER_MOVED":
                    playerMovedCount += 1;
                    break;
                case "CORRECT_DECISION":
                    correctDecisions += 1;
                    break;
                case "WRONG_DECISION":
                    wrongDecisions += 1;
                    break;
                case "SAFETY_VIOLATION":
                    safetyViolations += 1;
                    break;
                case "HAZARD_DETECTED":
                    hazardsDetected += 1;
                    if (evt.metadata && typeof evt.metadata.responseTime === "number") {
                        reactionTimes.push(evt.metadata.responseTime);
                    } else if (startTime) {
                        reactionTimes.push(Math.max(0, (t - startTime) / 1000));
                    }
                    break;
                case "HAZARD_IGNORED":
                    hazardsIgnored += 1;
                    break;
                case "VICTIM_DETECTED":
                    victimsDetected += 1;
                    if (evt.metadata && typeof evt.metadata.responseTime === "number") {
                        reactionTimes.push(evt.metadata.responseTime);
                    }
                    break;
                case "VICTIM_RESCUED":
                    victimsRescued += 1;
                    break;
                case "OBJECTIVE_COMPLETED":
                    objectivesCompleted += 1;
                    break;
                case "COMMUNICATION_ACTION":
                    communicationActions += 1;
                    break;
                case "TEAMWORK_ACTION":
                    teamworkActions += 1;
                    break;
                case "EVACUATION_STARTED":
                    evacuationStartedTime = t;
                    break;
                case "EVACUATION_COMPLETED":
                    evacuationCompletedTime = t;
                    break;
                case "SCENARIO_COMPLETED":
                    scenarioCompletedTime = t;
                    break;
                default:
                    break;
            }
        });

        // Calculate Evacuation Time
        let evacuationTime = 0;
        if (evacuationStartedTime && evacuationCompletedTime) {
            evacuationTime = Math.max(0, Math.floor((evacuationCompletedTime - evacuationStartedTime) / 1000));
        } else if (session.duration) {
            evacuationTime = session.duration;
        }

        // Reaction Time metrics
        const reactionTime = reactionTimes.length > 0 ? Math.min(...reactionTimes) : 5.0;
        const averageReactionTime = reactionTimes.length > 0
            ? Number((reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length).toFixed(2))
            : 5.0;

        // Decision Accuracy
        const totalDecisions = correctDecisions + wrongDecisions;
        const decisionAccuracy = totalDecisions > 0
            ? Math.round((correctDecisions / totalDecisions) * 100)
            : 100;

        // Objective Completion Rate
        const totalExpectedObjectives = scenario && scenario.objectives && scenario.objectives.length > 0
            ? scenario.objectives.length
            : Math.max(1, objectivesCompleted);
        const objectiveCompletionRate = Math.min(100, Math.round((objectivesCompleted / totalExpectedObjectives) * 100));

        // Scenario Completion Rate
        const scenarioCompletionRate = scenarioCompletedTime ? 100 : objectiveCompletionRate;

        // Route Efficiency (Derived metric based on moves vs evacuation time)
        let routeEfficiency = 85;
        if (playerMovedCount > 0 && evacuationTime > 0) {
            const ratio = playerMovedCount / evacuationTime;
            if (ratio > 2.0) routeEfficiency = Math.max(50, 100 - Math.round((ratio - 2.0) * 15));
            else routeEfficiency = Math.min(100, 75 + Math.round(ratio * 10));
        }

        return {
            evacuationTime,
            reactionTime,
            averageReactionTime,
            decisionAccuracy,
            correctDecisions,
            wrongDecisions,
            safetyViolations,
            hazardsDetected,
            hazardsIgnored,
            victimsDetected,
            victimsRescued,
            objectivesCompleted,
            objectiveCompletionRate,
            routeEfficiency,
            communicationActions,
            teamworkActions,
            scenarioCompletionRate
        };
    }
}

module.exports = new PerformanceFeatureService();
