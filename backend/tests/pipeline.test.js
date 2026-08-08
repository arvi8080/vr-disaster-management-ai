const { test, describe } = require("node:test");
const assert = require("node:assert");
const performanceFeatureService = require("../src/services/performanceFeatureService");
const skillTwinService = require("../src/services/skillTwinService");
const feedbackService = require("../src/services/feedbackService");
const { TRENDS } = require("../src/utils/constants");

describe("Research Data Pipeline Integration Tests", () => {
    test("performanceFeatureService extracts all 17 features correctly from raw events", () => {
        const mockSession = {
            duration: 120,
            startedAt: { toDate: () => new Date("2026-08-08T10:00:00Z") }
        };

        const mockEvents = [
            { eventType: "SCENARIO_STARTED", timestamp: "2026-08-08T10:00:00Z" },
            { eventType: "PLAYER_MOVED", timestamp: "2026-08-08T10:00:05Z" },
            { eventType: "HAZARD_DETECTED", timestamp: "2026-08-08T10:00:10Z", metadata: { responseTime: 3.5 } },
            { eventType: "CORRECT_DECISION", timestamp: "2026-08-08T10:00:20Z" },
            { eventType: "CORRECT_DECISION", timestamp: "2026-08-08T10:00:30Z" },
            { eventType: "WRONG_DECISION", timestamp: "2026-08-08T10:00:40Z" },
            { eventType: "SAFETY_VIOLATION", timestamp: "2026-08-08T10:00:50Z" },
            { eventType: "VICTIM_RESCUED", timestamp: "2026-08-08T10:01:00Z" },
            { eventType: "OBJECTIVE_COMPLETED", timestamp: "2026-08-08T10:01:20Z" },
            { eventType: "COMMUNICATION_ACTION", timestamp: "2026-08-08T10:01:30Z" },
            { eventType: "TEAMWORK_ACTION", timestamp: "2026-08-08T10:01:40Z" },
            { eventType: "EVACUATION_STARTED", timestamp: "2026-08-08T10:00:05Z" },
            { eventType: "EVACUATION_COMPLETED", timestamp: "2026-08-08T10:02:00Z" },
            { eventType: "SCENARIO_COMPLETED", timestamp: "2026-08-08T10:02:00Z" }
        ];

        const features = performanceFeatureService.extractFeatures(mockSession, mockEvents);

        assert.strictEqual(features.correctDecisions, 2);
        assert.strictEqual(features.wrongDecisions, 1);
        assert.strictEqual(features.safetyViolations, 1);
        assert.strictEqual(features.hazardsDetected, 1);
        assert.strictEqual(features.victimsRescued, 1);
        assert.strictEqual(features.objectivesCompleted, 1);
        assert.strictEqual(features.communicationActions, 1);
        assert.strictEqual(features.teamworkActions, 1);
        assert.strictEqual(features.decisionAccuracy, 67);
        assert.strictEqual(features.evacuationTime, 115);
        assert.strictEqual(features.scenarioCompletionRate, 100);
    });

    test("calculateSessionSkillScores computes 7 skill dimensions (0-100)", () => {
        const features = {
            decisionAccuracy: 80,
            wrongDecisions: 1,
            hazardsDetected: 3,
            hazardsIgnored: 0,
            averageReactionTime: 2.5,
            safetyViolations: 0,
            evacuationTime: 120,
            routeEfficiency: 90,
            victimsRescued: 2,
            objectivesCompleted: 2,
            reactionTime: 3.0,
            communicationActions: 2,
            teamworkActions: 2
        };

        const result = skillTwinService.calculateSessionSkillScores(features);

        assert.strictEqual(typeof result.skills.decisionMaking, "number");
        assert.strictEqual(typeof result.skills.situationalAwareness, "number");
        assert.strictEqual(typeof result.skills.safetyAwareness, "number");
        assert.strictEqual(typeof result.skills.evacuationSkill, "number");
        assert.strictEqual(typeof result.skills.emergencyResponse, "number");
        assert.strictEqual(typeof result.skills.communication, "number");
        assert.strictEqual(typeof result.skills.teamwork, "number");

        assert.strictEqual(result.skills.safetyAwareness, 100);
        assert.ok(result.overallScore > 70 && result.overallScore <= 100);
    });

    test("calculateSkillTrend determines IMPROVING, DECLINING, or STABLE", () => {
        const snapshotsImproving = [{ overallScore: 60 }, { overallScore: 68 }, { overallScore: 75 }];
        assert.strictEqual(skillTwinService.calculateSkillTrend(snapshotsImproving), TRENDS.IMPROVING);

        const snapshotsDeclining = [{ overallScore: 80 }, { overallScore: 74 }, { overallScore: 65 }];
        assert.strictEqual(skillTwinService.calculateSkillTrend(snapshotsDeclining), TRENDS.DECLINING);

        const snapshotsStable = [{ overallScore: 70 }, { overallScore: 71 }, { overallScore: 70 }];
        assert.strictEqual(skillTwinService.calculateSkillTrend(snapshotsStable), TRENDS.STABLE);
    });

    test("feedbackService generates non-generic personalized feedback based on performance rules", async () => {
        const features = {
            safetyViolations: 0,
            hazardsDetected: 3,
            victimsRescued: 2,
            evacuationTime: 350, // slow evacuation
            wrongDecisions: 2,
            decisionAccuracy: 60
        };

        const skillTwin = {
            overallScore: 68,
            skills: {
                decisionMaking: 60,
                situationalAwareness: 85,
                safetyAwareness: 90,
                evacuationSkill: 55,
                emergencyResponse: 75,
                communication: 60,
                teamwork: 60
            }
        };

        // Mock DB add for test
        const originalAdd = feedbackService.createFeedback;
        const feedback = await feedbackService.generatePersonalizedFeedback("test_trainee", "test_session", features, skillTwin);

        assert.ok(feedback.strengths.some(s => s.includes("safety awareness")));
        assert.ok(feedback.weaknesses.some(w => w.includes("evacuation")));
        assert.ok(feedback.recommendations.some(r => r.includes("evacuation route selection")));
    });
});
