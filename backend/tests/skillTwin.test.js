const { test, describe } = require("node:test");
const assert = require("node:assert");

describe("Digital Skill Twin Calculation Tests", () => {
    test("Exponential Moving Average calculation logic", () => {
        // Initial profile: 50
        const prevSkill = 50;
        const sessionScore = 90;
        // Formula: prev * 0.7 + curr * 0.3 = 35 + 27 = 62
        const updatedSkill = Math.round(prevSkill * 0.7 + sessionScore * 0.3);

        assert.strictEqual(updatedSkill, 62);
    });

    test("Overall score should be average of sub-skills", () => {
        const subScores = [80, 70, 75, 90, 85, 80, 78];
        const overall = Math.round(subScores.reduce((a, b) => a + b, 0) / subScores.length);
        
        assert.strictEqual(overall, 80);
    });
});
