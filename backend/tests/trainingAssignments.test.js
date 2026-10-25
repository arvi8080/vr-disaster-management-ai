const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const { authorizeRoles } = require("../src/middleware/roleMiddleware");
const { ROLES } = require("../src/utils/constants");
const { createUnityScenarioCatalogService, createScenarioId } = require("../src/services/unityScenarioCatalogService");
const { createTrainingAssignmentService, createAssignmentId } = require("../src/services/trainingAssignmentService");
const { TrainingAssignmentController } = require("../src/controllers/trainingAssignmentController");
const trainingAssignmentRoutes = require("../src/routes/trainingAssignmentRoutes");

function createScenarioCatalog(documents) {
    return createUnityScenarioCatalogService(() => ({
        collection(name) {
            assert.equal(name, "simulationResults");
            return {
                select(...fields) {
                    assert.deepEqual(fields, ["simulationType", "fireLocation"]);
                    return this;
                },
                async get() {
                    return {
                        docs: documents.map((data, index) => ({
                            id: `run-${index}`,
                            data: () => data
                        }))
                    };
                }
            };
        }
    }));
}

function createMemoryFirestore(initialDocuments = {}) {
    const documents = new Map(Object.entries(initialDocuments));
    return {
        collection(name) {
            return {
                doc(id) {
                    return {
                        collection: name,
                        id,
                        async get() {
                            const data = documents.get(`${name}/${id}`);
                            return { id, exists: data !== undefined, data: () => data };
                        },
                        async update(updates) {
                            const key = `${name}/${id}`;
                            const data = documents.get(key);
                            if (data === undefined) {
                                throw new Error("Document does not exist");
                            }
                            documents.set(key, { ...data, ...updates });
                        }
                    };
                },
                where(field, operator, value) {
                    assert.equal(name, "trainingAssignments");
                    assert.equal(operator, "==");
                    return {
                        async get() {
                            const docs = [];
                            for (const [key, data] of documents) {
                                if (key.startsWith("trainingAssignments/") && data[field] === value) {
                                    docs.push({ id: key.split("/")[1], data: () => data });
                                }
                            }
                            return { docs };
                        }
                    };
                }
            };
        },
        async runTransaction(callback) {
            const transaction = {
                async get(ref) {
                    const data = documents.get(`${ref.collection}/${ref.id}`);
                    return {
                        id: ref.id,
                        exists: data !== undefined,
                        data: () => data
                    };
                },
                create(ref, data) {
                    const key = `${ref.collection}/${ref.id}`;
                    if (documents.has(key)) {
                        throw new Error("Document already exists");
                    }
                    documents.set(key, data);
                }
            };
            return callback(transaction);
        },
        documents
    };
}

function createResponse() {
    return {
        statusCode: 200,
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

describe("Unity-backed training assignments", () => {
    const fireDocuments = [
        { simulationType: "Computer Lab Fire Safety", fireLocation: "Servers Fire", simulationId: "run-1" },
        { simulationType: "Computer Lab Fire Safety", fireLocation: "Servers Fire", simulationId: "run-2" },
        { simulationType: "Computer Lab Fire Safety", fireLocation: "Main Lab", simulationId: "run-3" },
        { simulationType: "Flood Evacuation", simulationId: "run-4" },
        { fireLocation: "Missing type" }
    ];

    test("discovers unique scenarios from source scenario fields, not simulation IDs", async () => {
        const catalog = createScenarioCatalog(fireDocuments);
        const scenarios = await catalog.listScenarios();

        assert.equal(scenarios.length, 3);
        assert.ok(scenarios.some(scenario =>
            scenario.simulationType === "Computer Lab Fire Safety" &&
            scenario.fireLocation === "Servers Fire"
        ));
        assert.equal(scenarios.filter(scenario => scenario.fireLocation === "Servers Fire").length, 1);
        assert.equal(scenarios.find(scenario => scenario.simulationType === "Flood Evacuation").fireLocation, undefined);
        assert.equal(
            scenarios.find(scenario => scenario.fireLocation === "Servers Fire").scenarioId,
            createScenarioId("Computer Lab Fire Safety", "Servers Fire")
        );
    });

    test("trainee assignment listing uses only the authenticated trainee UID", async () => {
        const platformDb = createMemoryFirestore({
            "trainingAssignments/one": { traineeId: "trainee-1", trainerId: "trainer-1" },
            "trainingAssignments/two": { traineeId: "trainee-2", trainerId: "trainer-2" }
        });
        const service = createTrainingAssignmentService({ platformDb });
        const assignments = await service.listAssignmentsForTrainee("trainee-1");
        const controller = new TrainingAssignmentController({
            assignmentService: {
                listAssignmentsForTrainee: async traineeId => {
                    assert.equal(traineeId, "trainee-1");
                    return service.listAssignmentsForTrainee(traineeId);
                }
            }
        });
        const response = createResponse();

        await controller.listMyTraineeAssignments({
            user: { uid: "trainee-1", role: ROLES.TRAINEE },
            query: { traineeId: "trainee-2" },
            body: { traineeId: "trainee-2" }
        }, response, error => { throw error; });

        assert.equal(assignments.length, 1);
        assert.equal(assignments[0].traineeId, "trainee-1");
        assert.equal(response.body.data.length, 1);
        assert.equal(response.body.data[0].traineeId, "trainee-1");
    });

    test("creates an assignment for a verified scenario and trainer", async () => {
        const catalog = createScenarioCatalog(fireDocuments);
        const platformDb = createMemoryFirestore({
            "users/trainer-1": { role: ROLES.TRAINER },
            "users/trainee-1": { role: ROLES.TRAINEE }
        });
        const service = createTrainingAssignmentService({
            platformDb,
            scenarioCatalog: catalog,
            serverTimestamp: () => "server-time"
        });
        const scenario = (await catalog.listScenarios()).find(item => item.fireLocation === "Servers Fire");
        const result = await service.createAssignment({
            scenarioId: scenario.scenarioId,
            trainerId: "trainer-1",
            adminId: "admin-1"
        });

        assert.equal(result.created, true);
        assert.equal(result.assignment.assignmentId, result.assignment.id);
        assert.equal(result.assignment.scenarioId, scenario.scenarioId);
        assert.equal(result.assignment.simulationType, "Computer Lab Fire Safety");
        assert.equal(result.assignment.fireLocation, "Servers Fire");
        assert.equal(result.assignment.trainerId, "trainer-1");
        assert.equal(result.assignment.assignedBy, "admin-1");
        assert.equal(result.assignment.assignedAt, "server-time");
        assert.equal(result.assignment.status, "assigned");
        assert.equal(platformDb.documents.size, 3);
        assert.equal(Array.from(platformDb.documents.keys()).some(key => key.includes("simulationResults")), false);
    });

    test("allows trainers to use trainee assignments and rejects other roles", () => {
        const middleware = authorizeRoles(ROLES.TRAINER);
        const invoke = role => {
            let nextCalled = false;
            let statusCode;
            const req = { user: { role } };
            const res = {
                status(code) {
                    statusCode = code;
                    return this;
                },
                json() {
                    return this;
                }
            };
            middleware(req, res, () => { nextCalled = true; });
            return { nextCalled, statusCode };
        };

        assert.deepEqual(invoke(ROLES.TRAINER), { nextCalled: true, statusCode: undefined });
        assert.deepEqual(invoke(ROLES.ADMIN), { nextCalled: false, statusCode: 403 });
        assert.deepEqual(invoke(ROLES.TRAINEE), { nextCalled: false, statusCode: 403 });
    });

    test("trainer assignment controller uses the authenticated trainer identity", async () => {
        let createInput;
        const controller = new TrainingAssignmentController({
            assignmentService: {
                createTraineeAssignment: async input => {
                    createInput = input;
                    return { created: true, assignment: { assignmentId: "assignment-id" } };
                }
            }
        });
        const response = createResponse();

        await controller.createTraineeAssignment({
            user: { uid: "verified-trainer", role: ROLES.TRAINER },
            body: {
                scenarioId: "verified-scenario",
                traineeId: "trainee-1",
                trainerId: "forged-trainer",
                assignedBy: "forged-assigner",
                dueAt: "2026-10-10T14:30:00.000Z"
            }
        }, response, error => { throw error; });

        assert.equal(createInput.trainerId, "verified-trainer");
        assert.equal(createInput.assignedBy, "verified-trainer");
        assert.equal(createInput.traineeId, "trainee-1");
        assert.equal(response.statusCode, 201);
    });

    test("deadline update controller uses authenticated trainer identity", async () => {
        let updateInput;
        const controller = new TrainingAssignmentController({
            assignmentService: {
                updateTraineeAssignmentDeadline: async input => {
                    updateInput = input;
                    return { assignmentId: input.assignmentId, dueAt: input.dueAt };
                }
            }
        });
        const response = createResponse();

        await controller.updateTraineeAssignmentDeadline({
            user: { uid: "verified-trainer", role: ROLES.TRAINER },
            params: { id: "assignment-1" },
            body: {
                trainerId: "forged-trainer",
                dueAt: "2026-10-10T14:30:00.000Z"
            }
        }, response, error => { throw error; });

        assert.deepEqual(updateInput, {
            assignmentId: "assignment-1",
            trainerId: "verified-trainer",
            dueAt: "2026-10-10T14:30:00.000Z"
        });
        assert.equal(response.body.message, "Training deadline updated successfully");
    });

    test("returns the existing assignment on duplicate requests without creating a duplicate", async () => {
        const catalog = createScenarioCatalog(fireDocuments);
        const platformDb = createMemoryFirestore({ "users/trainer-1": { role: ROLES.TRAINER } });
        const service = createTrainingAssignmentService({
            platformDb,
            scenarioCatalog: catalog,
            serverTimestamp: () => "server-time"
        });
        const scenario = (await catalog.listScenarios())[0];
        const input = { scenarioId: scenario.scenarioId, trainerId: "trainer-1", adminId: "admin-1" };

        const first = await service.createAssignment(input);
        const second = await service.createAssignment({ ...input, adminId: "admin-2" });

        assert.equal(first.created, true);
        assert.equal(second.created, false);
        assert.deepEqual(second.assignment, first.assignment);
        assert.equal(platformDb.documents.size, 2);
    });

    test("trainer assigns an admin-authorized scenario to their linked trainee with a deadline", async () => {
        const catalog = createScenarioCatalog(fireDocuments);
        const scenario = (await catalog.listScenarios()).find(item => item.fireLocation === "Servers Fire");
        const platformDb = createMemoryFirestore({
            "users/trainer-1": { role: ROLES.TRAINER },
            "users/trainee-1": { role: ROLES.TRAINEE, assignedTrainerId: "trainer-1" },
            [`trainingAssignments/${createAssignmentId("trainer-1", scenario.scenarioId)}`]: {
                assignmentId: createAssignmentId("trainer-1", scenario.scenarioId),
                trainerId: "trainer-1",
                scenarioId: scenario.scenarioId,
                simulationType: scenario.simulationType,
                fireLocation: scenario.fireLocation,
                status: "assigned"
            }
        });
        const service = createTrainingAssignmentService({
            platformDb,
            scenarioCatalog: catalog,
            serverTimestamp: () => "assigned-time",
            timestampFromDate: date => date.toISOString(),
            now: () => new Date("2026-10-01T00:00:00Z").getTime()
        });
        const result = await service.createTraineeAssignment({
            scenarioId: scenario.scenarioId,
            trainerId: "trainer-1",
            traineeId: "trainee-1",
            dueAt: "2026-10-10T14:30:00.000Z",
            assignedBy: "trainer-1"
        });

        assert.equal(result.created, true);
        assert.equal(result.assignment.assignmentType, "trainee");
        assert.equal(result.assignment.trainerId, "trainer-1");
        assert.equal(result.assignment.traineeId, "trainee-1");
        assert.equal(result.assignment.scenarioId, scenario.scenarioId);
        assert.equal(result.assignment.simulationType, "Computer Lab Fire Safety");
        assert.equal(result.assignment.fireLocation, "Servers Fire");
        assert.equal(result.assignment.assignedBy, "trainer-1");
        assert.equal(result.assignment.assignedAt, "assigned-time");
        assert.equal(result.assignment.dueAt, "2026-10-10T14:30:00.000Z");
        assert.equal(result.assignment.status, "assigned");
    });

    test("trainer can update a trainee assignment deadline they own", async () => {
        const assignmentId = "trainee-assignment";
        const platformDb = createMemoryFirestore({
            [`trainingAssignments/${assignmentId}`]: {
                assignmentId,
                assignmentType: "trainee",
                trainerId: "trainer-1",
                traineeId: "trainee-1",
                dueAt: "2026-10-10T14:30:00.000Z",
                status: "assigned"
            }
        });
        const service = createTrainingAssignmentService({
            platformDb,
            serverTimestamp: () => "updated-time",
            timestampFromDate: date => date.toISOString(),
            now: () => new Date("2026-10-01T00:00:00Z").getTime()
        });

        const assignment = await service.updateTraineeAssignmentDeadline({
            assignmentId,
            trainerId: "trainer-1",
            dueAt: "2026-10-12T16:45:00.000Z"
        });

        assert.equal(assignment.dueAt, "2026-10-12T16:45:00.000Z");
        assert.equal(assignment.updatedAt, "updated-time");
        assert.equal(platformDb.documents.get(`trainingAssignments/${assignmentId}`).dueAt, "2026-10-12T16:45:00.000Z");
    });

    test("deadline updates reject missing, invalid, past, unknown, and unowned assignments", async () => {
        const platformDb = createMemoryFirestore({
            "trainingAssignments/owned": {
                assignmentType: "trainee",
                trainerId: "trainer-1"
            },
            "trainingAssignments/trainer-assignment": {
                assignmentType: "trainer",
                trainerId: "trainer-1"
            },
            "trainingAssignments/other-trainer": {
                assignmentType: "trainee",
                trainerId: "trainer-2"
            }
        });
        const service = createTrainingAssignmentService({
            platformDb,
            now: () => new Date("2026-10-01T00:00:00Z").getTime()
        });
        const input = {
            assignmentId: "owned",
            trainerId: "trainer-1",
            dueAt: "2026-10-12T16:45:00.000Z"
        };

        await assert.rejects(
            service.updateTraineeAssignmentDeadline({ ...input, assignmentId: "" }),
            { statusCode: 400, message: "assignmentId is required" }
        );
        await assert.rejects(
            service.updateTraineeAssignmentDeadline({ ...input, dueAt: "" }),
            { statusCode: 400, message: "dueAt is required" }
        );
        await assert.rejects(
            service.updateTraineeAssignmentDeadline({ ...input, dueAt: "not-a-date" }),
            { statusCode: 400, message: "dueAt must be a valid future date and time" }
        );
        await assert.rejects(
            service.updateTraineeAssignmentDeadline({ ...input, dueAt: "2026-09-30T14:30:00.000Z" }),
            { statusCode: 400, message: "dueAt must be a valid future date and time" }
        );
        await assert.rejects(
            service.updateTraineeAssignmentDeadline({ ...input, assignmentId: "missing" }),
            { statusCode: 404, message: "Training assignment not found" }
        );
        await assert.rejects(
            service.updateTraineeAssignmentDeadline({ ...input, assignmentId: "trainer-assignment" }),
            { statusCode: 403, message: "This training assignment is not assigned to you" }
        );
        await assert.rejects(
            service.updateTraineeAssignmentDeadline({ ...input, assignmentId: "other-trainer" }),
            { statusCode: 403, message: "This training assignment is not assigned to you" }
        );
    });

    test("trainer assignments are idempotent for the same scenario and trainee", async () => {
        const catalog = createScenarioCatalog(fireDocuments);
        const scenario = (await catalog.listScenarios())[0];
        const adminAssignmentId = createAssignmentId("trainer-1", scenario.scenarioId);
        const platformDb = createMemoryFirestore({
            "users/trainer-1": { role: ROLES.TRAINER },
            "users/trainee-1": { role: ROLES.TRAINEE, assignedTrainerId: "trainer-1" },
            [`trainingAssignments/${adminAssignmentId}`]: {
                trainerId: "trainer-1",
                scenarioId: scenario.scenarioId
            }
        });
        const service = createTrainingAssignmentService({
            platformDb,
            scenarioCatalog: catalog,
            serverTimestamp: () => "assigned-time",
            timestampFromDate: date => date.toISOString(),
            now: () => new Date("2026-10-01T00:00:00Z").getTime()
        });
        const input = {
            scenarioId: scenario.scenarioId,
            trainerId: "trainer-1",
            traineeId: "trainee-1",
            dueAt: "2026-10-10T14:30:00.000Z",
            assignedBy: "trainer-1"
        };

        const first = await service.createTraineeAssignment(input);
        const second = await service.createTraineeAssignment({
            ...input,
            dueAt: "2026-10-11T14:30:00.000Z"
        });

        assert.equal(first.created, true);
        assert.equal(second.created, false);
        assert.deepEqual(second.assignment, first.assignment);
    });

    test("trainer cannot assign unapproved scenarios or scenarios to someone else's trainee", async () => {
        const catalog = createScenarioCatalog(fireDocuments);
        const scenarios = await catalog.listScenarios();
        const allowedScenario = scenarios[0];
        const otherScenario = scenarios[1];
        const platformDb = createMemoryFirestore({
            "users/trainer-1": { role: ROLES.TRAINER },
            "users/trainer-2": { role: ROLES.TRAINER },
            "users/trainee-1": { role: ROLES.TRAINEE, assignedTrainerId: "trainer-1" },
            "users/trainee-2": { role: ROLES.TRAINEE, assignedTrainerId: "trainer-2" },
            [`trainingAssignments/${createAssignmentId("trainer-1", allowedScenario.scenarioId)}`]: {
                trainerId: "trainer-1",
                scenarioId: allowedScenario.scenarioId
            }
        });
        const service = createTrainingAssignmentService({
            platformDb,
            scenarioCatalog: catalog,
            now: () => new Date("2026-10-01T00:00:00Z").getTime()
        });
        const input = {
            trainerId: "trainer-1",
            traineeId: "trainee-1",
            dueAt: "2026-10-10T14:30:00.000Z",
            assignedBy: "trainer-1"
        };

        await assert.rejects(
            service.createTraineeAssignment({ ...input, scenarioId: otherScenario.scenarioId }),
            { statusCode: 403, message: "This scenario is not assigned to you" }
        );
        await assert.rejects(
            service.createTraineeAssignment({ ...input, traineeId: "trainee-2", scenarioId: allowedScenario.scenarioId }),
            { statusCode: 403, message: "This trainee is not assigned to you" }
        );
    });

    test("rejects invalid trainees and missing, invalid, or past deadlines", async () => {
        const catalog = createScenarioCatalog(fireDocuments);
        const scenario = (await catalog.listScenarios())[0];
        const platformDb = createMemoryFirestore({
            "users/trainer-1": { role: ROLES.TRAINER },
            "users/trainee-1": { role: ROLES.TRAINEE, assignedTrainerId: "trainer-1" },
            "users/trainer-2": { role: ROLES.TRAINER },
            [`trainingAssignments/${createAssignmentId("trainer-1", scenario.scenarioId)}`]: {
                trainerId: "trainer-1",
                scenarioId: scenario.scenarioId
            }
        });
        const service = createTrainingAssignmentService({
            platformDb,
            scenarioCatalog: catalog,
            timestampFromDate: date => date.toISOString(),
            now: () => new Date("2026-10-01T00:00:00Z").getTime()
        });
        const input = {
            scenarioId: scenario.scenarioId,
            trainerId: "trainer-1",
            traineeId: "trainee-1",
            dueAt: "2026-10-10T14:30:00.000Z",
            assignedBy: "trainer-1"
        };

        await assert.rejects(
            service.createTraineeAssignment({ ...input, traineeId: "missing-trainee" }),
            { statusCode: 404, message: "Trainee not found" }
        );
        await assert.rejects(
            service.createTraineeAssignment({ ...input, traineeId: "trainer-2" }),
            { statusCode: 404, message: "Trainee not found" }
        );
        await assert.rejects(
            service.createTraineeAssignment({ ...input, dueAt: "" }),
            { statusCode: 400, message: "dueAt is required" }
        );
        await assert.rejects(
            service.createTraineeAssignment({ ...input, dueAt: "not-a-date" }),
            { statusCode: 400, message: "dueAt must be a valid future date and time" }
        );
        await assert.rejects(
            service.createTraineeAssignment({ ...input, dueAt: "2026-09-30T14:30:00.000Z" }),
            { statusCode: 400, message: "dueAt must be a valid future date and time" }
        );
        await assert.rejects(
            service.createTraineeAssignment({ ...input, scenarioId: "arbitrary-simulation-run-id" }),
            { statusCode: 404, message: "Unity scenario not found" }
        );
    });

    test("rejects missing or unknown scenarios and missing or non-trainer users", async () => {
        const catalog = createScenarioCatalog(fireDocuments);
        const platformDb = createMemoryFirestore({ "users/trainee-1": { role: ROLES.TRAINEE } });
        const service = createTrainingAssignmentService({ platformDb, scenarioCatalog: catalog });
        const knownScenario = (await catalog.listScenarios())[0];

        await assert.rejects(
            service.createAssignment({ trainerId: "trainer-1", adminId: "admin-1" }),
            { statusCode: 400, message: "scenarioId is required" }
        );
        await assert.rejects(
            service.createAssignment({ scenarioId: "arbitrary-run-id", trainerId: "trainer-1", adminId: "admin-1" }),
            { statusCode: 404, message: "Unity scenario not found" }
        );
        await assert.rejects(
            service.createAssignment({ scenarioId: knownScenario.scenarioId, trainerId: "", adminId: "admin-1" }),
            { statusCode: 400, message: "trainerId is required" }
        );
        await assert.rejects(
            service.createAssignment({ scenarioId: knownScenario.scenarioId, trainerId: "missing-trainer", adminId: "admin-1" }),
            { statusCode: 404, message: "Trainer not found" }
        );
        await assert.rejects(
            service.createAssignment({ scenarioId: knownScenario.scenarioId, trainerId: "trainee-1", adminId: "admin-1" }),
            { statusCode: 400, message: "The selected user is not a trainer" }
        );
    });

    test("allows admins through assignment authorization and rejects non-admins", () => {
        const middleware = authorizeRoles(ROLES.ADMIN);
        const invoke = role => {
            let nextCalled = false;
            let statusCode;
            const req = { user: { role } };
            const res = {
                status(code) {
                    statusCode = code;
                    return this;
                },
                json() {
                    return this;
                }
            };
            middleware(req, res, () => { nextCalled = true; });
            return { nextCalled, statusCode };
        };

        assert.deepEqual(invoke(ROLES.ADMIN), { nextCalled: true, statusCode: undefined });
        assert.deepEqual(invoke(ROLES.TRAINER), { nextCalled: false, statusCode: 403 });
        assert.deepEqual(invoke(ROLES.TRAINEE), { nextCalled: false, statusCode: 403 });
    });

    test("trainer assignment listing uses only the authenticated trainer UID", async () => {
        const platformDb = createMemoryFirestore({
            "trainingAssignments/one": { trainerId: "trainer-1", simulationType: "Fire" },
            "trainingAssignments/two": { trainerId: "trainer-2", simulationType: "Flood" }
        });
        const service = createTrainingAssignmentService({ platformDb });
        const assignments = await service.listAssignmentsForTrainer("trainer-1");
        const controller = new TrainingAssignmentController({
            scenarioCatalog: { listScenarios: async () => [] },
            assignmentService: {
                listAssignmentsForTrainer: async trainerId => {
                    assert.equal(trainerId, "trainer-1");
                    return service.listAssignmentsForTrainer(trainerId);
                }
            }
        });
        const response = createResponse();

        await controller.listMyAssignments({
            user: { uid: "trainer-1", role: ROLES.TRAINER },
            query: { trainerId: "trainer-2" },
            body: { trainerId: "trainer-2" }
        }, response, error => { throw error; });

        assert.equal(assignments.length, 1);
        assert.equal(assignments[0].trainerId, "trainer-1");
        assert.equal(response.body.data.length, 1);
        assert.equal(response.body.data[0].trainerId, "trainer-1");
    });

    test("assignment controller takes assigning admin identity from authentication, not the request body", async () => {
        let createInput;
        const controller = new TrainingAssignmentController({
            assignmentService: {
                createAssignment: async input => {
                    createInput = input;
                    return { created: true, assignment: { assignmentId: "assignment-id" } };
                }
            }
        });
        const response = createResponse();

        await controller.createAssignment({
            user: { uid: "verified-admin", role: ROLES.ADMIN },
            body: { scenarioId: "verified-scenario", trainerId: "trainer-1", adminId: "forged-admin" }
        }, response, error => { throw error; });

        assert.equal(createInput.adminId, "verified-admin");
        assert.equal(response.statusCode, 201);
    });

    test("protected catalog endpoint rejects unauthenticated requests", async () => {
        const app = express();
        app.use("/api/training-assignments", trainingAssignmentRoutes);

        const response = await request(app).get("/api/training-assignments/scenarios");

        assert.equal(response.status, 401);
        assert.equal(response.body.errorCode, "UNAUTHORIZED");
    });
});
