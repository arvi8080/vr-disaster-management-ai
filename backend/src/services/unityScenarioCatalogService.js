const { createHash } = require("node:crypto");
const { getUnityFirestore } = require("../config/unityFirebase");

function normalizeIdentityPart(value) {
    return typeof value === "string" ? value.trim().replace(/\s+/g, " ").toLowerCase() : "";
}

function createScenarioId(simulationType, fireLocation) {
    const identity = JSON.stringify([
        normalizeIdentityPart(simulationType),
        normalizeIdentityPart(fireLocation)
    ]);
    return `unity:${createHash("sha256").update(identity).digest("hex")}`;
}

function createUnityScenarioCatalogService(firestoreFactory = getUnityFirestore) {
    return {
        async listScenarios() {
            const snapshot = await firestoreFactory()
                .collection("simulationResults")
                .select("simulationType", "fireLocation")
                .get();
            const scenarios = new Map();

            for (const doc of snapshot.docs) {
                const data = doc.data();
                if (typeof data.simulationType !== "string" || !data.simulationType.trim()) {
                    continue;
                }

                const simulationType = data.simulationType.trim();
                const fireLocation = typeof data.fireLocation === "string" && data.fireLocation.trim()
                    ? data.fireLocation.trim()
                    : undefined;
                const scenarioId = createScenarioId(simulationType, fireLocation);

                if (!scenarios.has(scenarioId)) {
                    scenarios.set(scenarioId, {
                        scenarioId,
                        simulationType,
                        ...(fireLocation ? { fireLocation } : {})
                    });
                }
            }

            return Array.from(scenarios.values()).sort((a, b) =>
                a.simulationType.localeCompare(b.simulationType) ||
                (a.fireLocation || "").localeCompare(b.fireLocation || "")
            );
        }
    };
}

module.exports = {
    ...createUnityScenarioCatalogService(),
    createUnityScenarioCatalogService,
    createScenarioId
};
