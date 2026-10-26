const { createHash } = require("node:crypto");
const { db } = require("../config/firebase");
const { FieldValue } = require("firebase-admin/firestore");
const { getSimulationsByUserId } = require("./simulationResultsService");
const unityUserMappingService = require("./unityUserMappingService");
const performanceFeatureService = require("./performanceFeatureService");
const skillTwinService = require("./skillTwinService");
const feedbackService = require("./feedbackService");
const { EVENT_TYPES, SESSION_STATUS } = require("../utils/constants");
const logger = require("../utils/logger");

const OBJECTIVE_FLAGS = ["pinWasRemoved", "powerWasTurnedOff", "fireWasExtinguished"];

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
    if (simulation.fireWasExtinguished !== undefined && simulation.fireWasExtinguished !== null && typeof simulation.fireWasExtinguished !== "boolean") {
        throw new Error("Invalid Unity simulation telemetry: fireWasExtinguished must be a boolean.");
    }

    const eventsProvided = Array.isArray(simulation.events);
    const sourceEvents = eventsProvided ? simulation.events : [];
    const UNITY_EVENT_MAP = {
    FIRE_STARTED: "SCENARIO_STARTED",
    PIN_REMOVED: "EXTINGUISHER_PIN_REMOVED",
    PIN_REMOVED_BEFORE_POWER_OFF: "SAFETY_VIOLATION",
    POWER_TURNED_OFF: "POWER_ISOLATED",
    SPRAY_STARTED: "EXTINGUISHING_STARTED",
    FIRE_EXTINGUISHED: "FIRE_EXTINGUISHED",
    SPRAY_ATTEMPTED_POWER_ON: "WRONG_DECISION",
    SPRAY_ATTEMPTED_PIN_NOT_REMOVED: "WRONG_DECISION"
};

const events = sourceEvents
    .filter(event => event && typeof event === "object")
    .map(event => {
        const sourceEventName = event.eventName || event.eventType;

        // Already-normalized backend event
        const eventType = EVENT_TYPES.includes(sourceEventName)
            ? sourceEventName
            : UNITY_EVENT_MAP[sourceEventName];

        if (!eventType) return null;

        return {
            eventType,
            ...(event.timestamp || event.createdAt
                ? { timestamp: event.timestamp || event.createdAt }
                : {}),
            ...(event.metadata &&
            typeof event.metadata === "object" &&
            !Array.isArray(event.metadata)
                ? { metadata: event.metadata }
                : {})
        };
    })
    .filter(Boolean);
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

    const features = {
        source: "unity-simulation",
        observedMetrics: [
            ...(objectiveCount > 0 ? ["objectiveCompletionRate"] : []),
            ...(events.length > 0 ? ["eventTelemetry"] : []),
            ...Object.keys(unityMetrics)
        ],
        scoreComponents: {},
        skillScores: {},
        objectiveFlags,
        fireWasExtinguished: simulation.fireWasExtinguished ?? null,
        events,
        objectivesCompleted: objectiveCount > 0
            ? completedObjectives
            : hasEventType("OBJECTIVE_COMPLETED")
                ? extracted.objectivesCompleted
                : null,
        objectiveCompletionRate,
        correctDecisions: decisionCount > 0 ? extracted.correctDecisions : null,
        wrongDecisions: decisionCount > 0 ? extracted.wrongDecisions : null,
        decisionAccuracy: null,
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
    features.score = null;

    return {
        simulationId: simulation.simulationId,
        unityUserId: simulation.userId,
        simulationType: simulation.simulationType,
        fireLocation: simulation.fireLocation ?? null,
        completionStatus: simulation.completionStatus,
        completedAt,
        score: null,
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
                fireWasExtinguished: normalized.features.fireWasExtinguished,
                procedureViolation: normalized.features.safetyViolations === null
                    ? null
                    : normalized.features.safetyViolations > 0,
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
