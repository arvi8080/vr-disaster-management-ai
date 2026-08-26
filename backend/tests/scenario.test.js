const { test, describe } = require("node:test");
const assert = require("node:assert");
const { validateCreateScenario, validateUpdateScenario } = require("../src/validators/scenarioValidator");

describe("Scenario Validator Tests", () => {
    test("validateCreateScenario should fail on missing title", () => {
        const req = { body: { disasterType: "earthquake", difficulty: "medium" } };
        const error = validateCreateScenario(req);
        assert.strictEqual(typeof error, "string");
        assert.ok(error.includes("title is required"));
    });

    test("validateCreateScenario should fail on invalid disasterType", () => {
        const req = { body: { title: "Earthquake Evacuation", disasterType: "volcano" } };
        const error = validateCreateScenario(req);
        assert.strictEqual(typeof error, "string");
        assert.ok(error.includes("disasterType must be one of"));
    });

    test("validateCreateScenario should pass on valid input", () => {
        const req = {
            body: {
                title: "Earthquake Evacuation Drill",
                disasterType: "earthquake",
                difficulty: "hard",
                duration: 600,
                objectives: ["Evacuate building", "Assist victims"]
            }
        };
        const error = validateCreateScenario(req);
        assert.strictEqual(error, null);
    });

    test("validateUpdateScenario should pass on partial valid update", () => {
        const req = { body: { active: false } };
        const error = validateUpdateScenario(req);
        assert.strictEqual(error, null);
    });
});
