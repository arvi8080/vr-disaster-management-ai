const test = require("node:test");
const assert = require("node:assert/strict");
const { buildValidatedPerformanceFeatures } = require("../src/services/aiService");

test("omits unavailable and invalid count features from AI payloads", () => {
    const result = buildValidatedPerformanceFeatures({
        evacuationTime: 120,
        averageReactionTime: 2.5,
        wrongDecisions: null,
        correctDecisions: null,
        safetyViolations: 0,
        hazardsDetected: null,
        hazardsIgnored: null,
        victimsRescued: null,
        objectivesCompleted: 2.5
    });

    assert.deepEqual(result, {
        evacuationTime: 120,
        averageReactionTime: 2.5,
        safetyViolations: 0
    });
});
