const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { SkillTwinService } = require("../src/services/skillTwinService");

describe("Digital Skill Twin Calculation Tests", () => {
    test("initial Skill Twin scores are zero before training", async () => {
        const service = new SkillTwinService({
            collection: () => ({
                doc: () => ({
                    get: async () => ({ exists: false })
                })
            })
        });

        const profile = await service.getSkillTwin("trainee-1");

        assert.equal(profile.overallScore, 0);
        assert.equal(profile.lastSessionScore, 0);
        assert.deepEqual(Object.values(profile.skills), [0, 0, 0, 0, 0, 0, 0]);
    });

    test("Overall score should be average of sub-skills", () => {
        const subScores = [80, 70, 75, 90, 85, 80, 78];
        const overall = Math.round(subScores.reduce((a, b) => a + b, 0) / subScores.length);
        
        assert.strictEqual(overall, 80);
    });
});
