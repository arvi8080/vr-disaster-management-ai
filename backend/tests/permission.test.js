const { test, describe } = require("node:test");
const assert = require("node:assert");
const { hasScenarioAccess, authorizeScenarioPermission } = require("../src/middleware/permissionMiddleware");

describe("Role-Based Permission Middleware Tests", () => {
    test("hasScenarioAccess should allow all for admin or wildcards", () => {
        assert.strictEqual(hasScenarioAccess(["*"], "fire"), true);
        assert.strictEqual(hasScenarioAccess(["*"], "flood"), true);
        assert.strictEqual(hasScenarioAccess(["*"], "earthquake"), true);
    });

    test("hasScenarioAccess should grant explicit scenario permissions", () => {
        const allowed = ["fire", "earthquake"];
        assert.strictEqual(hasScenarioAccess(allowed, "fire"), true);
        assert.strictEqual(hasScenarioAccess(allowed, "earthquake"), true);
        assert.strictEqual(hasScenarioAccess(allowed, "flood"), false);
    });

    test("authorizeScenarioPermission middleware blocks unauthorized scenario requests", () => {
        const middleware = authorizeScenarioPermission();
        let errorSent = null;

        const req = {
            user: { role: "trainee", allowedScenarios: ["fire"] },
            body: { disasterType: "flood" }
        };

        const res = {
            status: (code) => {
                return {
                    json: (data) => {
                        errorSent = { code, data };
                    }
                };
            }
        };

        let nextCalled = false;
        middleware(req, res, () => { nextCalled = true; });

        assert.strictEqual(nextCalled, false);
        assert.strictEqual(errorSent.code, 403);
        assert.ok(errorSent.data.message.includes("You do not have permission"));
    });

    test("authorizeScenarioPermission middleware allows authorized scenario requests", () => {
        const middleware = authorizeScenarioPermission();

        const req = {
            user: { role: "trainee", allowedScenarios: ["fire", "flood"] },
            body: { disasterType: "fire" }
        };

        const res = {};
        let nextCalled = false;
        middleware(req, res, () => { nextCalled = true; });

        assert.strictEqual(nextCalled, true);
    });
});
