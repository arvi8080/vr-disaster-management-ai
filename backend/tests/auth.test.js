const { test, describe } = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const app = require("../src/app");

describe("Authentication & Health Tests", () => {
    test("GET / should return server running message", async () => {
        const res = await request(app).get("/");
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.message, "VR Disaster Training API is running");
    });

    test("GET /api/health should return UP status", async () => {
        const res = await request(app).get("/api/health");
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.status, "UP");
    });

    test("Protected routes without Auth header should return 401 Unauthorized", async () => {
        const res = await request(app).get("/api/auth/me");
        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.errorCode, "UNAUTHORIZED");
    });
});
