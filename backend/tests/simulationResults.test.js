const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { db } = require("../src/config/firebase");
const { getUnityFirestore } = require("../src/config/unityFirebase");
const { createSimulationResultsService } = require("../src/services/simulationResultsService");
const { createUnityUserMappingService } = require("../src/services/unityUserMappingService");
const {
    convertUnitySimulation,
    createUnitySimulationAdapterService,
    createUnitySessionId
} = require("../src/services/unitySimulationAdapterService");
const { TrainingController } = require("../src/controllers/trainingController");
const { calculateObservedSessionScore } = require("../src/utils/scoring");
const { SkillTwinService } = require("../src/services/skillTwinService");
const { buildUnitySimulationFeedback } = require("../src/services/feedbackService");

describe("Unity simulation result access", () => {
    test("uses the existing platform Firebase project for Unity result reads", () => {
        assert.equal(getUnityFirestore(), db);
    });

    test("converts Unity telemetry without inventing session or Skill Twin scores", () => {
        const normalized = convertUnitySimulation({
            simulationId: "simulation-123",
            simulationType: "Fire",
            userId: "unity-user-123",
            completedAt: "2026-10-04T10:00:00Z",
            completionStatus: "Completed",
            totalResponseTime: 42,
            powerIsolationTime: 8,
            pinRemovalTime: 12,
            extinguishingTime: 22,
            pinWasRemoved: true,
            powerWasTurnedOff: false,
            fireWasExtinguished: true,
            procedureViolation: false,
            events: [
                { eventType: "CORRECT_DECISION", timestamp: "2026-10-04T09:59:00Z" },
                { eventType: "WRONG_DECISION", timestamp: "2026-10-04T09:59:30Z" },
                { eventType: "HAZARD_DETECTED", timestamp: "2026-10-04T09:59:45Z" }
            ]
        });

        assert.equal(normalized.score, null);
        assert.equal(normalized.features.objectiveCompletionRate, 67);
        assert.equal(normalized.features.objectiveFlags.fireWasExtinguished, true);
        assert.equal(normalized.features.decisionAccuracy, null);
        assert.equal(normalized.features.safetyViolations, 0);
        assert.deepEqual(normalized.features.skillScores, {});
        assert.deepEqual(normalized.features.scoreComponents, {});
        assert.equal(normalized.features.unityMetrics.totalResponseTime, 42);
        assert.equal(normalized.features.unityMetrics.powerIsolationTime, 8);
        assert.equal(normalized.features.events.length, 3);
        assert.equal(normalized.features.events[0].eventType, "CORRECT_DECISION");
        assert.equal(normalized.features.evacuationTime, undefined);
        assert.equal(normalized.features.victimsRescued, null);
    });

    test("preserves recorded violations without calculating a protocol score", () => {
        const normalized = convertUnitySimulation(validUnitySimulation({
            procedureViolation: false,
            events: [{ eventType: "SAFETY_VIOLATION" }]
        }));

        assert.equal(normalized.features.safetyViolations, 1);
        assert.deepEqual(normalized.features.scoreComponents, {});
    });

    test("ignores negative duration sentinels, rejects malformed telemetry, and leaves scores uncalculated", () => {
        assert.throws(
            () => convertUnitySimulation({ simulationType: "Fire" }),
            /simulationId is required/
        );
        const legacyDuration = convertUnitySimulation(validUnitySimulation({
            pinRemovalTime: -1,
            powerIsolationTime: 8
        }));
        assert.equal(legacyDuration.features.unityMetrics.pinRemovalTime, undefined);
        assert.equal(legacyDuration.features.unityMetrics.powerIsolationTime, 8);
        assert.equal(legacyDuration.features.observedMetrics.includes("pinRemovalTime"), false);
        assert.throws(
            () => convertUnitySimulation(validUnitySimulation({ fireWasExtinguished: "yes" })),
            /fireWasExtinguished must be a boolean/
        );
        assert.throws(
            () => convertUnitySimulation(validUnitySimulation({ powerIsolationTime: "8" })),
            /powerIsolationTime must be a finite number/
        );
        assert.throws(
            () => convertUnitySimulation(validUnitySimulation({ events: {} })),
            /events must be an array/
        );

        const noScorableTelemetry = convertUnitySimulation(validUnitySimulation({
            events: [],
            totalResponseTime: 12,
            pinWasRemoved: undefined,
            powerWasTurnedOff: undefined,
            procedureViolation: undefined
        }));
        assert.equal(noScorableTelemetry.score, null);
        assert.deepEqual(noScorableTelemetry.features.skillScores, {});
    });

    test("calculates score from observed components only", () => {
        assert.equal(calculateObservedSessionScore({
            objectiveCompletionRate: 100,
            decisionAccuracy: null,
            protocolCompliance: null
        }), 100);
        assert.equal(calculateObservedSessionScore({
            objectiveCompletionRate: 100,
            decisionAccuracy: null,
            protocolCompliance: 0
        }), 50);
        assert.equal(calculateObservedSessionScore({
            objectiveCompletionRate: null,
            decisionAccuracy: null,
            protocolCompliance: null
        }), null);
    });

    test("Skill Twin scoring retains only observed Unity dimensions", () => {
        const service = new SkillTwinService({});
        const skillScores = service.calculateSessionSkillScores({
            skillScores: {
                decisionMaking: 78,
                safetyAwareness: 100,
                emergencyResponse: null,
                unknownDimension: 99
            }
        });

        assert.deepEqual(skillScores, {
            skills: {
                decisionMaking: 78,
                safetyAwareness: 100
            },
            observedSkillDimensions: ["decisionMaking", "safetyAwareness"],
            overallScore: 89
        });
    });

    test("Unity feedback reports only observed session results and specific gaps", () => {
        const feedback = buildUnitySimulationFeedback({
            objectiveFlags: {
                pinWasRemoved: true,
                powerWasTurnedOff: false
            },
            scoreComponents: {
                decisionAccuracy: 50,
                protocolCompliance: 0
            },
            correctDecisions: 1,
            wrongDecisions: 1,
            safetyViolations: 1,
            fireWasExtinguished: false,
            unityMetrics: {
                powerIsolationTime: 8,
                pinRemovalTime: 12
            }
        });

        assert.deepEqual(feedback.observations, [
            "Power isolation: not completed.",
            "Fire extinguisher pin removal: completed.",
            "Fire extinguished: no.",
            "Procedure violations recorded: 1.",
            "Incorrect decisions recorded: 1.",
            "Power isolation time: 8 sec.",
            "Pin removal time: 12 sec."
        ]);
        assert.ok(feedback.strengths.includes("Completed objectives: Fire extinguisher pin removal."));
        assert.ok(feedback.weaknesses.includes("Power isolation was not completed in the recorded simulation."));
        assert.ok(feedback.weaknesses.includes("Unity recorded 1 incorrect decision."));
        assert.ok(feedback.weaknesses.includes("Unity recorded 1 procedural violation."));
        assert.ok(feedback.weaknesses.includes("Unity did not record the fire as extinguished."));
        assert.ok(feedback.recommendations.includes("Review the power isolation objective before the next simulation."));
        assert.ok(!feedback.strengths.includes("Completed all tracked Unity simulation objectives"));
        assert.ok(!feedback.recommendations.includes("Review the required procedure sequence before the next simulation"));
    });

    test("Unity feedback does not invent results when telemetry is absent", () => {
        assert.deepEqual(buildUnitySimulationFeedback({}), {
            strengths: [],
            weaknesses: [],
            recommendations: [],
            observations: []
        });
    });

    test("applies a Skill Twin session update only once per stable session ID", async () => {
        const platformDb = createMemoryFirestore();
        const service = new SkillTwinService(platformDb);
        const features = {
            skillScores: {
                decisionMaking: 70,
                safetyAwareness: 100
            }
        };

        await service.updateSkillTwin("platform-user-123", "unity-session-123", features);
        await service.updateSkillTwin("platform-user-123", "unity-session-123", features);

        const profile = await platformDb.collection("skillProfiles").doc("platform-user-123").get();
        assert.equal(platformDb.count("skillHistory"), 1);
        assert.equal(profile.data().trainingCount, 1);
        assert.equal(profile.data().overallScore, 85);
        assert.deepEqual(profile.data().observedSkillDimensions, ["decisionMaking", "safetyAwareness"]);
    });

    test("backfills a Skill Twin from previously completed sessions exactly once", async () => {
        const platformDb = createMemoryFirestore();
        await platformDb.collection("trainingSessions").doc("completed-session").set({
            traineeId: "platform-user-123",
            status: "completed",
            completedAt: new Date("2026-10-04T10:00:00Z"),
            performanceFeatures: {
                skillScores: {
                    decisionMaking: 82,
                    safetyAwareness: 94
                }
            }
        });
        await platformDb.collection("trainingSessions").doc("telemetry-only-session").set({
            traineeId: "platform-user-123",
            status: "completed",
            performanceFeatures: {
                source: "unity-simulation",
                skillScores: {}
            }
        });
        const service = new SkillTwinService(platformDb);

        const profile = await service.ensureSkillTwinFromCompletedSessions("platform-user-123");
        await service.ensureSkillTwinFromCompletedSessions("platform-user-123");

        assert.equal(profile.trainingCount, 1);
        assert.equal(profile.overallScore, 88);
        assert.equal(platformDb.count("skillHistory"), 1);
        assert.deepEqual(profile.observedSkillDimensions, ["decisionMaking", "safetyAwareness"]);
    });

    test("imports a completed Unity simulation idempotently using simulationId as the stable key", async () => {
        const platformDb = createMemoryFirestore();
        const calls = { skillTwin: 0, feedback: 0 };
        const service = createUnitySimulationAdapterService({
            platformDb,
            userMappingService: {
                getUnityUserId: async uid => uid === "platform-user-123" ? "unity-user-123" : null
            },
            simulationResultsService: {
                getSimulationsByUserId: async unityUid => {
                    assert.equal(unityUid, "unity-user-123");
                    const result = validUnitySimulation();
                    if (calls.skillTwin > 0) {
                        result.pinRemovalTime = -10.4;
                        result.completedAt = "invalid date";
                    }
                    return [result];
                }
            },
            skillTwin: {
                updateSkillTwin: async () => {
                    calls.skillTwin += 1;
                    return { overallScore: 75 };
                }
            },
            feedback: {
                generateUnitySimulationFeedback: async (traineeId, sessionId) => {
                    calls.feedback += 1;
                    return { id: sessionId };
                }
            }
        });

        const firstImport = await service.syncTraineeSimulations("platform-user-123");
        const repeatedImport = await service.syncTraineeSimulations("platform-user-123");

        assert.equal(firstImport.length, 1);
        assert.equal(repeatedImport.length, 1);
        assert.equal(firstImport[0].id, createUnitySessionId("simulation-123"));
        assert.equal(firstImport[0].sourceSimulationId, "simulation-123");
        assert.equal(firstImport[0].status, "completed");
        assert.equal(firstImport[0].analyticsStatus, "completed");
        assert.equal(calls.skillTwin, 0);
        assert.equal(calls.feedback, 1);
        assert.equal(platformDb.count("trainingSessions"), 1);
        assert.equal(firstImport[0].score, null);
        assert.equal(firstImport[0].skillTwinScore, undefined);
        assert.deepEqual(firstImport[0].performanceFeatures.skillScores, {});
    });

    test("syncs same-project Unity results using the trainee UID when no legacy mapping exists", async () => {
        const platformDb = createMemoryFirestore();
        let queriedUserId;
        const service = createUnitySimulationAdapterService({
            platformDb,
            userMappingService: { getUnityUserId: async () => null },
            simulationResultsService: {
                getSimulationsByUserId: async userId => {
                    queriedUserId = userId;
                    return [validUnitySimulation({ userId: "platform-user-123" })];
                }
            },
            skillTwin: { updateSkillTwin: async () => ({ overallScore: 80 }) },
            feedback: { generateUnitySimulationFeedback: async () => ({ id: "feedback-1" }) }
        });

        const sessions = await service.syncTraineeSimulations("platform-user-123");

        assert.equal(queriedUserId, "platform-user-123");
        assert.equal(sessions[0].traineeId, "platform-user-123");
    });

    test("reads a simulation result from the Unity simulationResults collection", async () => {
        const requested = [];
        const db = {
            collection(name) {
                requested.push(["collection", name]);
                return {
                    doc(id) {
                        requested.push(["doc", id]);
                        return {
                            async get() {
                                return {
                                    exists: true,
                                    id,
                                    data: () => ({ userId: "unity-user", score: 91 })
                                };
                            }
                        };
                    }
                };
            }
        };
        const service = createSimulationResultsService(() => db);

        const result = await service.getSimulationById("simulation-123");

        assert.deepEqual(requested, [
            ["collection", "simulationResults"],
            ["doc", "simulation-123"]
        ]);
        assert.deepEqual(result, {
            id: "simulation-123",
            userId: "unity-user",
            score: 91
        });
    });

    test("preserves the not-found status and error code for missing simulations", async () => {
        const db = {
            collection: () => ({
                doc: () => ({
                    get: async () => ({ exists: false })
                })
            })
        };
        const service = createSimulationResultsService(() => db);

        await assert.rejects(service.getSimulationById("missing-id"), error => {
            assert.equal(error.message, "Simulation result not found");
            assert.equal(error.statusCode, 404);
            assert.equal(error.errorCode, "NOT_FOUND");
            return true;
        });
    });

    test("resolves a mapping only from the platform unityUserMappings collection", async () => {
        const requested = [];
        const platformDb = {
            collection(name) {
                requested.push(["collection", name]);
                return {
                    doc(id) {
                        requested.push(["doc", id]);
                        return {
                            get: async () => ({
                                exists: true,
                                data: () => ({
                                    platformUid: id,
                                    unityUserId: "unity-user-123"
                                })
                            })
                        };
                    }
                };
            }
        };
        const service = createUnityUserMappingService(platformDb);

        assert.equal(await service.getUnityUserId("platform-user-123"), "unity-user-123");
        assert.deepEqual(requested, [
            ["collection", "unityUserMappings"],
            ["doc", "platform-user-123"]
        ]);
    });

    test("does not resolve missing or malformed platform mappings", async () => {
        const mappings = {
            "missing-user": null,
            "wrong-platform-user": { platformUid: "somebody-else", unityUserId: "unity-user-123" },
            "missing-unity-user": { platformUid: "missing-unity-user", unityUserId: " " }
        };
        const service = createUnityUserMappingService({
            collection: () => ({
                doc: platformUid => ({
                    get: async () => {
                        const mapping = mappings[platformUid];
                        return {
                            exists: Boolean(mapping),
                            data: () => mapping
                        };
                    }
                })
            })
        });

        for (const platformUid of Object.keys(mappings)) {
            assert.equal(await service.getUnityUserId(platformUid), null);
        }
    });

    test("allows a trainee with a matching platform-to-Unity mapping", async () => {
        const controller = new TrainingController({
            simulationResultsService: {
                getSimulationById: async () => ({
                    id: "simulation-123",
                    userId: "unity-user-123"
                })
            },
            unityUserMappingService: {
                getUnityUserId: async platformUid => {
                    assert.equal(platformUid, "platform-user-123");
                    return "unity-user-123";
                }
            }
        });
        const response = createResponse();

        await controller.getSimulationById({
            params: { id: "simulation-123" },
            user: { uid: "platform-user-123", role: "trainee" }
        }, response, error => { throw error; });

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, {
            success: true,
            message: "Simulation result fetched successfully",
            data: {
                id: "simulation-123",
                userId: "unity-user-123"
            }
        });
    });

    test("allows same-project Unity results when the Quest UID matches the trainee UID", async () => {
        const controller = new TrainingController({
            simulationResultsService: {
                getSimulationById: async () => ({ id: "simulation-123", userId: "platform-user-123" })
            },
            unityUserMappingService: {
                getUnityUserId: async () => null
            }
        });
        const response = createResponse();

        await controller.getSimulationById({
            params: { id: "simulation-123" },
            user: { uid: "platform-user-123", role: "trainee" }
        }, response, error => { throw error; });

        assert.equal(response.statusCode, 200);
        assert.equal(response.body.data.userId, "platform-user-123");
    });

    test("rejects results owned by another trainee when no mapping is configured", async () => {
        const controller = new TrainingController({
            simulationResultsService: {
                getSimulationById: async () => ({ id: "simulation-123", userId: "different-user" })
            },
            unityUserMappingService: {
                getUnityUserId: async () => null
            }
        });
        const response = createResponse();

        await controller.getSimulationById({
            params: { id: "simulation-123" },
            user: { uid: "platform-user-123", role: "trainee" }
        }, response, error => { throw error; });

        assert.equal(response.statusCode, 403);
    });

    test("returns 403 when a trainee mapping belongs to a different Unity user", async () => {
        const controller = new TrainingController({
            simulationResultsService: {
                getSimulationById: async () => ({ id: "simulation-123", userId: "unity-user-123" })
            },
            unityUserMappingService: {
                getUnityUserId: async () => "different-unity-user"
            }
        });
        const response = createResponse();

        await controller.getSimulationById({
            params: { id: "simulation-123" },
            user: { uid: "platform-user-123", role: "trainee" }
        }, response, error => { throw error; });

        assert.equal(response.statusCode, 403);
        assert.equal(response.body.message, "Access denied");
        assert.equal(response.body.errorCode, "FORBIDDEN");
    });

    test("preserves current trainer and admin access to existing simulation results", async () => {
        const simulation = { id: "simulation-123", userId: "unity-user", score: 91 };
        const controller = new TrainingController({
            simulationResultsService: {
                getSimulationById: async () => simulation
            }
        });

        for (const role of ["trainer", "admin"]) {
            const response = createResponse();
            await controller.getSimulationById({
                params: { id: "simulation-123" },
                user: { uid: "platform-user", role }
            }, response, error => { throw error; });

            assert.equal(response.statusCode, 200);
            assert.deepEqual(response.body, {
                success: true,
                message: "Simulation result fetched successfully",
                data: simulation
            });
        }
    });

    test("denies roles without existing trainer/admin authorization", async () => {
        const controller = new TrainingController({
            simulationResultsService: {
                getSimulationById: async () => ({ id: "simulation-123", userId: "unity-user" })
            }
        });
        const response = createResponse();

        await controller.getSimulationById({
            params: { id: "simulation-123" },
            user: { uid: "platform-user", role: "unknown" }
        }, response, error => { throw error; });

        assert.equal(response.statusCode, 403);
        assert.equal(response.body.errorCode, "FORBIDDEN");
    });

    test("preserves missing-simulation 404 behavior for trainees", async () => {
        const missingError = Object.assign(new Error("Simulation result not found"), {
            statusCode: 404,
            errorCode: "NOT_FOUND"
        });
        const controller = new TrainingController({
            simulationResultsService: {
                getSimulationById: async () => { throw missingError; }
            },
            unityUserMappingService: {
                getUnityUserId: async () => "unity-user-123"
            }
        });
        let forwardedError;

        await controller.getSimulationById({
            params: { id: "missing-id" },
            user: { uid: "platform-user", role: "trainee" }
        }, createResponse(), error => { forwardedError = error; });

        assert.equal(forwardedError, missingError);
    });
});

function validUnitySimulation(overrides = {}) {
    return {
        simulationId: "simulation-123",
        simulationType: "Fire",
        userId: "unity-user-123",
        completedAt: "2026-10-04T10:00:00Z",
        completionStatus: "Completed",
        pinWasRemoved: true,
        powerWasTurnedOff: true,
        procedureViolation: false,
        events: [
            { eventType: "CORRECT_DECISION", timestamp: "2026-10-04T09:59:00Z" }
        ],
        ...overrides
    };
}

function createMemoryFirestore() {
    const collections = new Map();
    const getCollection = name => {
        if (!collections.has(name)) collections.set(name, new Map());
        return collections.get(name);
    };

    const createQuery = (collectionName, constraints = []) => ({
        where(field, operator, value) {
            const constraint = arguments.length === 2
                ? [field, "==", operator]
                : [field, operator, value];
            return createQuery(collectionName, [...constraints, constraint]);
        },
        async get() {
            const docs = [...getCollection(collectionName).entries()]
                .filter(([, data]) => constraints.every(([field, operator, value]) =>
                    operator === "==" && data[field] === value
                ))
                .map(([id, data]) => ({ id, data: () => data }));
            return {
                docs,
                forEach(callback) {
                    docs.forEach(callback);
                }
            };
        }
    });

    const createReference = (collectionName, documentId) => ({
        id: documentId,
        collectionName,
        async get() {
            const data = getCollection(collectionName).get(documentId);
            return { id: documentId, exists: Boolean(data), data: () => data };
        },
        async update(updates) {
            const collection = getCollection(collectionName);
            collection.set(documentId, { ...collection.get(documentId), ...updates });
        },
        async set(data, options = {}) {
            const collection = getCollection(collectionName);
            collection.set(documentId, options.merge
                ? { ...collection.get(documentId), ...data }
                : data);
        }
    });

    return {
        collection(name) {
            return {
                doc: documentId => createReference(name, documentId),
                where: (field, operator, value) => createQuery(name).where(field, operator, value)
            };
        },
        async runTransaction(callback) {
            return callback({
                get: reference => reference.get(),
                create: (reference, data) => {
                    const collection = getCollection(reference.collectionName);
                    if (collection.has(reference.id)) throw new Error("Document already exists");
                    collection.set(reference.id, data);
                },
                set: (reference, data, options) => reference.set(data, options)
            });
        },
        count(name) {
            return getCollection(name).size;
        }
    };
}

function createResponse() {
    return {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}
