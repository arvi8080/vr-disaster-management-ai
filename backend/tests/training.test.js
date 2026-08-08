const { test, describe } = require("node:test");
const assert = require("node:assert");
const performanceFeatureService = require("../src/services/performanceFeatureService");
const { validateEvent } = require("../src/validators/eventValidator");

describe("Training Metrics & Event Tests", () => {
    test("extractFeatures should calculate correct metrics from events", () => {
        const dummySession = { startedAt: { toDate: () => new Date("2026-08-08T10:00:00Z") } };
        const dummyEvents = [
            { eventType: "EVACUATION_STARTED", timestamp: "2026-08-08T10:00:05Z" },
            { eventType: "HAZARD_DETECTED", timestamp: "2026-08-08T10:00:10Z" },
            { eventType: "VICTIM_RESCUED", timestamp: "2026-08-08T10:01:00Z" },
            { eventType: "WRONG_DECISION", timestamp: "2026-08-08T10:01:30Z" },
            { eventType: "EVACUATION_COMPLETED", timestamp: "2026-08-08T10:02:00Z" }
        ];

        const metrics = performanceFeatureService.extractFeatures(dummySession, dummyEvents);

        assert.strictEqual(metrics.wrongDecisions, 1);
        assert.strictEqual(metrics.victimsRescued, 1);
        assert.strictEqual(metrics.hazardsDetected, 1);
        assert.strictEqual(metrics.evacuationTime, 115);
    });

    test("validateEvent should fail on invalid eventType", () => {
        const req = { body: { sessionId: "sess123", eventType: "INVALID_EVENT" } };
        const error = validateEvent(req);
        assert.strictEqual(typeof error, "string");
        assert.ok(error.includes("eventType must be one of"));
    });

    test("validateEvent should pass on valid Unity event", () => {
        const req = {
            body: {
                sessionId: "sess123",
                eventType: "VICTIM_RESCUED",
                timestamp: "2026-08-08T10:30:00Z",
                location: { x: 10, y: 2, z: 5 },
                metadata: { victimId: "victim01" }
            }
        };
        const error = validateEvent(req);
        assert.strictEqual(error, null);
    });
});
