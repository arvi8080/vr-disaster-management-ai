const { createHash } = require("node:crypto");
const { FieldValue } = require("firebase-admin/firestore");
const { db } = require("../config/firebase");
const { ROLES } = require("../utils/constants");
const unityScenarioCatalogService = require("./unityScenarioCatalogService");

function createAssignmentId(trainerId, scenarioId, traineeId = null) {
    const identity = traineeId
        ? [trainerId, scenarioId, traineeId]
        : [trainerId, scenarioId];
    return `assignment_${createHash("sha256")
        .update(JSON.stringify(identity))
        .digest("hex")}`;
}

function createTrainingAssignmentService({
    platformDb = db,
    scenarioCatalog = unityScenarioCatalogService,
    serverTimestamp = () => FieldValue.serverTimestamp(),
    timestampFromDate = date => new Date(date),
    now = () => Date.now()
} = {}) {
    return {
        async createAssignment({ scenarioId, trainerId, adminId }) {
            if (typeof scenarioId !== "string" || !scenarioId.trim()) {
                const error = new Error("scenarioId is required");
                error.statusCode = 400;
                error.errorCode = "BAD_REQUEST";
                throw error;
            }
            if (typeof trainerId !== "string" || !trainerId.trim()) {
                const error = new Error("trainerId is required");
                error.statusCode = 400;
                error.errorCode = "BAD_REQUEST";
                throw error;
            }

            const scenario = (await scenarioCatalog.listScenarios())
                .find(item => item.scenarioId === scenarioId.trim());
            if (!scenario) {
                const error = new Error("Unity scenario not found");
                error.statusCode = 404;
                error.errorCode = "NOT_FOUND";
                throw error;
            }

            const trainerRef = platformDb.collection("users").doc(trainerId.trim());
            const assignmentId = createAssignmentId(trainerId.trim(), scenario.scenarioId);
            const assignmentRef = platformDb.collection("trainingAssignments").doc(assignmentId);
            let created = false;
            let assignment;

            await platformDb.runTransaction(async transaction => {
                created = false;
                assignment = undefined;
                const trainerDoc = await transaction.get(trainerRef);
                if (!trainerDoc.exists) {
                    const error = new Error("Trainer not found");
                    error.statusCode = 404;
                    error.errorCode = "NOT_FOUND";
                    throw error;
                }
                if (trainerDoc.data().role !== ROLES.TRAINER) {
                    const error = new Error("The selected user is not a trainer");
                    error.statusCode = 400;
                    error.errorCode = "BAD_REQUEST";
                    throw error;
                }

                const existingAssignment = await transaction.get(assignmentRef);
                if (existingAssignment.exists) {
                    assignment = { id: existingAssignment.id, ...existingAssignment.data() };
                    return;
                }

                assignment = {
                    id: assignmentId,
                    assignmentId,
                    assignmentType: "trainer",
                    scenarioId: scenario.scenarioId,
                    simulationType: scenario.simulationType,
                    ...(scenario.fireLocation ? { fireLocation: scenario.fireLocation } : {}),
                    trainerId: trainerId.trim(),
                    assignedBy: adminId,
                    assignedAt: serverTimestamp(),
                    status: "assigned"
                };
                transaction.create(assignmentRef, assignment);
                created = true;
            });

            if (created) {
                const savedAssignment = await assignmentRef.get();
                assignment = { id: savedAssignment.id, ...savedAssignment.data() };
            }

            return { assignment, created };
        },

        async createTraineeAssignment({ scenarioId, trainerId, traineeId, dueAt, assignedBy }) {
            for (const [field, value] of Object.entries({ scenarioId, trainerId, traineeId })) {
                if (typeof value !== "string" || !value.trim()) {
                    const error = new Error(`${field} is required`);
                    error.statusCode = 400;
                    error.errorCode = "BAD_REQUEST";
                    throw error;
                }
            }
            if (typeof dueAt !== "string" || !dueAt.trim()) {
                const error = new Error("dueAt is required");
                error.statusCode = 400;
                error.errorCode = "BAD_REQUEST";
                throw error;
            }
            const dueDate = new Date(dueAt);
            if (Number.isNaN(dueDate.getTime()) || dueDate.getTime() <= now()) {
                const error = new Error("dueAt must be a valid future date and time");
                error.statusCode = 400;
                error.errorCode = "BAD_REQUEST";
                throw error;
            }

            const normalizedScenarioId = scenarioId.trim();
            const normalizedTrainerId = trainerId.trim();
            const normalizedTraineeId = traineeId.trim();
            const scenario = (await scenarioCatalog.listScenarios())
                .find(item => item.scenarioId === normalizedScenarioId);
            if (!scenario) {
                const error = new Error("Unity scenario not found");
                error.statusCode = 404;
                error.errorCode = "NOT_FOUND";
                throw error;
            }

            const trainerRef = platformDb.collection("users").doc(normalizedTrainerId);
            const traineeRef = platformDb.collection("users").doc(normalizedTraineeId);
            const trainerScenarioRef = platformDb.collection("trainingAssignments")
                .doc(createAssignmentId(normalizedTrainerId, scenario.scenarioId));
            const assignmentId = createAssignmentId(normalizedTrainerId, scenario.scenarioId, normalizedTraineeId);
            const assignmentRef = platformDb.collection("trainingAssignments").doc(assignmentId);
            let created = false;
            let assignment;

            await platformDb.runTransaction(async transaction => {
                created = false;
                assignment = undefined;
                const [trainerDoc, traineeDoc, trainerScenarioDoc, existingAssignment] = await Promise.all([
                    transaction.get(trainerRef),
                    transaction.get(traineeRef),
                    transaction.get(trainerScenarioRef),
                    transaction.get(assignmentRef)
                ]);

                if (!trainerDoc.exists || trainerDoc.data().role !== ROLES.TRAINER) {
                    const error = new Error("Trainer not found");
                    error.statusCode = 404;
                    error.errorCode = "NOT_FOUND";
                    throw error;
                }
                if (!traineeDoc.exists || traineeDoc.data().role !== ROLES.TRAINEE) {
                    const error = new Error("Trainee not found");
                    error.statusCode = 404;
                    error.errorCode = "NOT_FOUND";
                    throw error;
                }
                if (traineeDoc.data().assignedTrainerId !== normalizedTrainerId) {
                    const error = new Error("This trainee is not assigned to you");
                    error.statusCode = 403;
                    error.errorCode = "FORBIDDEN";
                    throw error;
                }
                if (!trainerScenarioDoc.exists) {
                    const error = new Error("This scenario is not assigned to you");
                    error.statusCode = 403;
                    error.errorCode = "FORBIDDEN";
                    throw error;
                }
                if (existingAssignment.exists) {
                    assignment = { id: existingAssignment.id, ...existingAssignment.data() };
                    return;
                }

                assignment = {
                    id: assignmentId,
                    assignmentId,
                    assignmentType: "trainee",
                    scenarioId: scenario.scenarioId,
                    simulationType: scenario.simulationType,
                    ...(scenario.fireLocation ? { fireLocation: scenario.fireLocation } : {}),
                    trainerId: normalizedTrainerId,
                    traineeId: normalizedTraineeId,
                    assignedBy,
                    assignedAt: serverTimestamp(),
                    dueAt: timestampFromDate(dueDate),
                    status: "assigned"
                };
                transaction.create(assignmentRef, assignment);
                created = true;
            });

            if (created) {
                const savedAssignment = await assignmentRef.get();
                assignment = { id: savedAssignment.id, ...savedAssignment.data() };
            }

            return { assignment, created };
        },

        async updateTraineeAssignmentDeadline({ assignmentId, trainerId, dueAt }) {
            if (typeof assignmentId !== "string" || !assignmentId.trim()) {
                const error = new Error("assignmentId is required");
                error.statusCode = 400;
                error.errorCode = "BAD_REQUEST";
                throw error;
            }
            if (typeof dueAt !== "string" || !dueAt.trim()) {
                const error = new Error("dueAt is required");
                error.statusCode = 400;
                error.errorCode = "BAD_REQUEST";
                throw error;
            }
            const dueDate = new Date(dueAt);
            if (Number.isNaN(dueDate.getTime()) || dueDate.getTime() <= now()) {
                const error = new Error("dueAt must be a valid future date and time");
                error.statusCode = 400;
                error.errorCode = "BAD_REQUEST";
                throw error;
            }

            const assignmentRef = platformDb.collection("trainingAssignments").doc(assignmentId.trim());
            const assignmentDoc = await assignmentRef.get();
            if (!assignmentDoc.exists) {
                const error = new Error("Training assignment not found");
                error.statusCode = 404;
                error.errorCode = "NOT_FOUND";
                throw error;
            }
            const assignment = assignmentDoc.data();
            if (assignment.assignmentType !== "trainee" || assignment.trainerId !== trainerId) {
                const error = new Error("This training assignment is not assigned to you");
                error.statusCode = 403;
                error.errorCode = "FORBIDDEN";
                throw error;
            }

            await assignmentRef.update({
                dueAt: timestampFromDate(dueDate),
                updatedAt: serverTimestamp()
            });
            const updatedDoc = await assignmentRef.get();
            return { id: updatedDoc.id, ...updatedDoc.data() };
        },

        async listAssignmentsForTrainer(trainerId) {
            const snapshot = await platformDb.collection("trainingAssignments")
                .where("trainerId", "==", trainerId)
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },

        async listAssignmentsForTrainee(traineeId) {
            const snapshot = await platformDb.collection("trainingAssignments")
                .where("traineeId", "==", traineeId)
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
    };
}

module.exports = {
    ...createTrainingAssignmentService(),
    createTrainingAssignmentService,
    createAssignmentId
};
