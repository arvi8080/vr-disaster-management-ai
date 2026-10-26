const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { normalizeTimestamp, timestampMillis } = require("../src/utils/timestamp");
const performanceFeatureService = require("../src/services/performanceFeatureService");
const { buildUnitySimulationFeedback } = require("../src/services/feedbackService");

describe("timestamp normalization", () => {
    const unixSeconds = 1760858103;
    const expectedMillis = unixSeconds * 1000;

    test("normalizes Unix seconds, milliseconds, ISO strings, and Firestore timestamps", () => {
        assert.equal(normalizeTimestamp(unixSeconds).getTime(), expectedMillis);
        assert.equal(normalizeTimestamp(expectedMillis).getTime(), expectedMillis);
        assert.equal(normalizeTimestamp(new Date(expectedMillis).toISOString()).getTime(), expectedMillis);
        assert.equal(normalizeTimestamp({ _seconds: unixSeconds, _nanoseconds: 0 }).getTime(), expectedMillis);
        assert.equal(normalizeTimestamp({ seconds: unixSeconds, nanoseconds: 0 }).getTime(), expectedMillis);
        assert.equal(timestampMillis(unixSeconds), expectedMillis);
    });

    test("returns null for missing, invalid, or zero timestamps", () => {
        for (const value of [null, undefined, "", "invalid", 0, NaN, Infinity, {}]) {
            assert.equal(normalizeTimestamp(value), null);
            assert.equal(timestampMillis(value), null);
        }
    });

    test("uses Unity event timestamps in seconds when deriving event timing features", () => {
        const features = performanceFeatureService.extractFeatures(
            { startedAt: unixSeconds, duration: 0 },
            [
                { eventType: "EVACUATION_STARTED", timestamp: unixSeconds },
                { eventType: "HAZARD_DETECTED", timestamp: unixSeconds + 2 },
                { eventType: "EVACUATION_COMPLETED", timestamp: unixSeconds + 120 }
            ]
        );

        assert.equal(features.evacuationTime, 120);
        assert.equal(features.averageReactionTime, 2);
    });

    test("normalizes safety-event evidence without changing its source timestamp", () => {
        const event = { eventType: "SAFETY_VIOLATION", timestamp: unixSeconds };
        const feedback = buildUnitySimulationFeedback({ events: [event] });

        assert.ok(feedback.observations[0].includes(new Date(expectedMillis).toISOString()));
        assert.equal(event.timestamp, unixSeconds);
    });
});
