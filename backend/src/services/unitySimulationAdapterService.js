const { createHash } = require("node:crypto");
const { db } = require("../config/firebase");
const { FieldValue } = require("firebase-admin/firestore");
const { getSimulationsByUserId } = require("./simulationResultsService");
const unityUserMappingService = require("./unityUserMappingService");
const performanceFeatureService = require("./performanceFeatureService");
const skillTwinService = require("./skillTwinService");
const feedbackService = require("./feedbackService");
const { calculateObservedSessionScore } = require("../utils/scoring");
const { EVENT_TYPES, SESSION_STATUS } = require("../utils/constants");
const logger = require("../utils/logger");

const OBJECTIVE_FLAGS = ["pinWasRemoved", "powerWasTurnedOff"];

function createUnitySessionId(simulationId) {
    return `unity_${createHash("sha256").update(simulationId).digest("hex")}`;
}

function toDate(value) {
    if (value && typeof value.toDate === "function") {
        return value.toDate();
    }
    if (typeof value === "string" || typeof value === "number" || value instanceof Date) {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) return date;
    }
    return null;
}

function validateOptionalDuration(simulation, field) {
    if (simulation[field] === undefined || simulation[field] === null) return null;

    if (
        typeof simulation[field] !== "number" ||
        !Number.isFinite(simulation[field])
    ) {
        throw new Error(`Invalid Unity simulation telemetry: ${field} must be a finite number.`);
    }

    if (simulation[field] < 0) {
        logger.warn("Ignoring negative Unity duration telemetry as unavailable", {
            simulationId: simulation.simulationId,
            field,
            value: simulation[field]
        });
        return null;
    }

    return simulation[field];
}

function convertUnitySimulation(simulation) {
    if (!simulation || typeof simulation !== "object" || Array.isArray(simulation)) {
        throw new Error("Invalid Unity simulation telemetry: expected a simulation result object.");
    }

    for (const field of ["simulationId", "simulationType", "userId", "completionStatus"]) {
        if (typeof simulation[field] !== "string" || !simulation[field].trim()) {
            throw new Error(`Invalid Unity simulation telemetry: ${field} is required.`);
        }
    }

    const completedAt = toDate(simulation.completedAt);
    if (!completedAt) {
        throw new Error("Invalid Unity simulation telemetry: completedAt must be a valid date.");
    }
    if (simulation.events !== undefined && !Array.isArray(simulation.events)) {
        throw new Error("Invalid Unity simulation telemetry: events must be an array.");
    }

    const unityMetrics = {};
    for (const field of ["totalResponseTime", "powerIsolationTime", "pinRemovalTime", "extinguishingTime"]) {
        const value = validateOptionalDuration(simulation, field);
        if (value !== null) unityMetrics[field] = value;
    }

    const objectiveFlags = {};
    for (const field of OBJECTIVE_FLAGS) {
        if (simulation[field] !== undefined && simulation[field] !== null) {
            if (typeof simulation[field] !== "boolean") {
                throw new Error(`Invalid Unity simulation telemetry: ${field} must be a boolean.`);
            }
            objectiveFlags[field] = simulation[field];
        }
    }

    if (simulation.procedureViolation !== undefined && simulation.procedureViolation !== null && typeof simulation.procedureViolation !== "boolean") {
        throw new Error("Invalid Unity simulation telemetry: procedureViolation must be a boolean.");
    }

    const eventsProvided = Array.isArray(simulation.events);
    const sourceEvents = eventsProvided ? simulation.events : [];
    const events = sourceEvents
        .filter(event => event && typeof event === "object" && EVENT_TYPES.includes(event.eventType))
        .map(event => ({
            eventType: event.eventType,
            ...(event.timestamp ? { timestamp: event.timestamp } : {}),
            ...(event.metadata && typeof event.metadata === "object" && !Array.isArray(event.metadata)
                ? { metadata: event.metadata }
                : {})
        }));
    const extracted = performanceFeatureService.extractFeatures({ duration: 0 }, events);
    const decisionCount = extracted.correctDecisions + extracted.wrongDecisions;
    const hasEventType = eventType => events.some(event => event.eventType === eventType);
    const objectiveCount = Object.keys(objectiveFlags).length;
    const completedObjectives = Object.values(objectiveFlags).filter(Boolean).length;
    const objectiveCompletionRate = objectiveCount > 0
        ? Math.round((completedObjectives / objectiveCount) * 100)
        : null;
    const observedSafetyViolations = hasEventType("SAFETY_VIOLATION") ? extracted.safetyViolations : null;
    const safetyViolations = simulation.procedureViolation === true
        ? Math.max(1, observedSafetyViolations || 0)
        : simulation.procedureViolation === false
            ? Math.max(0, observedSafetyViolations || 0)
            : observedSafetyViolations;
    const decisionAccuracy = decisionCount > 0 ? extracted.decisionAccuracy : null;
    const hasProcedureViolationEvent = hasEventType("SAFETY_VIOLATION");
    const protocolCompliance = simulation.procedureViolation === true || hasProcedureViolationEvent
        ? 0
        : simulation.procedureViolation === false
            ? 100
            : null;
    const scoreComponents = {
        objectiveCompletionRate,
        decisionAccuracy,
        protocolCompliance
    };
    const score = calculateObservedSessionScore(scoreComponents);

    const skillScores = {};
    if (decisionAccuracy !== null) skillScores.decisionMaking = decisionAccuracy;
    if (protocolCompliance !== null) skillScores.safetyAwareness = protocolCompliance;
    if (objectiveCompletionRate !== null) skillScores.emergencyResponse = objectiveCompletionRate;

    const features = {
        source: "unity-simulation",
        observedMetrics: [
            ...(objectiveCount > 0 ? ["objectiveCompletionRate"] : []),
            ...(decisionAccuracy !== null ? ["decisionAccuracy"] : []),
            ...(protocolCompliance !== null ? ["protocolCompliance"] : []),
            ...(events.length > 0 ? ["eventTelemetry"] : []),
            ...Object.keys(unityMetrics)
        ],
        scoreComponents,
        skillScores,
        objectiveFlags,
        objectivesCompleted: objectiveCount > 0
            ? completedObjectives
            : hasEventType("OBJECTIVE_COMPLETED")
                ? extracted.objectivesCompleted
                : null,
        objectiveCompletionRate,
        correctDecisions: decisionCount > 0 ? extracted.correctDecisions : null,
        wrongDecisions: decisionCount > 0 ? extracted.wrongDecisions : null,
        decisionAccuracy,
        safetyViolations,
        hazardsDetected: hasEventType("HAZARD_DETECTED") ? extracted.hazardsDetected : null,
        hazardsIgnored: hasEventType("HAZARD_IGNORED") ? extracted.hazardsIgnored : null,
        victimsDetected: hasEventType("VICTIM_DETECTED") ? extracted.victimsDetected : null,
        victimsRescued: hasEventType("VICTIM_RESCUED") ? extracted.victimsRescued : null,
        communicationActions: hasEventType("COMMUNICATION_ACTION") ? extracted.communicationActions : null,
        teamworkActions: hasEventType("TEAMWORK_ACTION") ? extracted.teamworkActions : null,
        eventCount: eventsProvided ? sourceEvents.length : null,
        unityMetrics
    };
    features.score = score;

    return {
        simulationId: simulation.simulationId,
        unityUserId: simulation.userId,
        simulationType: simulation.simulationType,
        fireLocation: simulation.fireLocation ?? null,
        completionStatus: simulation.completionStatus,
        completedAt,
        score,
        features
    };
}

function createUnitySimulationAdapterService({
    platformDb = db,
    simulationResultsService = { getSimulationsByUserId },
    userMappingService = unityUserMappingService,
    skillTwin = skillTwinService,
    feedback = feedbackService
} = {}) {
    async function importSimulation(simulation, platformUid, mappedUnityUserId) {
        if (simulation.userId !== mappedUnityUserId) {
            throw new Error("Unity simulation owner does not match the linked Unity account.");
        }

        if (typeof simulation.simulationId !== "string" || !simulation.simulationId.trim()) {
            throw new Error("Invalid Unity simulation telemetry: simulationId is required.");
        }

        const sessionId = createUnitySessionId(simulation.simulationId);
        const sessionRef = platformDb.collection("trainingSessions").doc(sessionId);
        let normalized;
        let session;
        await platformDb.runTransaction(async transaction => {
            const existingDoc = await transaction.get(sessionRef);
            if (existingDoc.exists) {
                session = { id: existingDoc.id, ...existingDoc.data() };
                if (session.traineeId !== platformUid || session.sourceSimulationId !== simulation.simulationId) {
                    throw new Error("Unity simulation is already linked to a different platform session.");
                }
                return;
            }

            normalized = convertUnitySimulation(simulation);
            const newSession = {
                traineeId: platformUid,
                scenarioId: `unity:${normalized.simulationType}`,
                scenario: normalized.simulationType,
                status: SESSION_STATUS.COMPLETED,
                startedAt: null,
                completedAt: normalized.completedAt,
                duration: null,
                score: normalized.score,
                evacuationTime: null,
                mistakes: normalized.features.wrongDecisions,
                safetyViolations: normalized.features.safetyViolations,
                objectivesCompleted: normalized.features.objectivesCompleted,
                victimsRescued: normalized.features.victimsRescued,
                hazardsDetected: normalized.features.hazardsDetected,
                actionsCompleted: normalized.features.eventCount,
                sourceSystem: "unity",
                sourceSimulationId: normalized.simulationId,
                simulationType: normalized.simulationType,
                fireLocation: normalized.fireLocation,
                completionStatus: normalized.completionStatus,
                pinWasRemoved: normalized.features.objectiveFlags.pinWasRemoved ?? null,
                powerWasTurnedOff: normalized.features.objectiveFlags.powerWasTurnedOff ?? null,
                procedureViolation: normalized.features.scoreComponents.protocolCompliance === null
                    ? null
                    : normalized.features.scoreComponents.protocolCompliance === 0,
                unityMetrics: normalized.features.unityMetrics,
                performanceFeatures: normalized.features,
                analyticsStatus: "pending",
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
            };
            transaction.create(sessionRef, newSession);
            session = { id: sessionId, ...newSession };
        });

        if (session.analyticsStatus !== "completed") {
            normalized = normalized || convertUnitySimulation(simulation);
            const skillTwinResult = Object.keys(normalized.features.skillScores).length > 0
                ? await skillTwin.updateSkillTwin(platformUid, sessionId, normalized.features)
                : null;
            const feedbackResult = normalized.features.observedMetrics.length > 0
                ? await feedback.generateUnitySimulationFeedback(
                    platformUid,
                    sessionId,
                    { ...normalized.features, score: normalized.score },
                    skillTwinResult
                )
                : null;
            const updates = {
                analyticsStatus: "completed",
                updatedAt: FieldValue.serverTimestamp()
            };
            if (skillTwinResult) updates.skillTwinScore = skillTwinResult.overallScore;
            if (feedbackResult) updates.feedbackId = feedbackResult.id;
            await sessionRef.update(updates);
            session = { ...session, ...updates };
        }

        return session;
    }

    return {
        async syncTraineeSimulations(platformUid) {
            const mappedUnityUserId = await userMappingService.getUnityUserId(platformUid) || platformUid;
            const simulations = await simulationResultsService.getSimulationsByUserId(mappedUnityUserId);
            const sessions = [];
            for (const simulation of simulations) {
                sessions.push(await importSimulation(simulation, platformUid, mappedUnityUserId));
            }
            return sessions;
        },
        importSimulation,
        convertUnitySimulation
    };
}

module.exports = {
    ...createUnitySimulationAdapterService(),
    createUnitySimulationAdapterService,
    convertUnitySimulation,
    createUnitySessionId
};
