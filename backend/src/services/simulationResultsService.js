const { getUnityFirestore } = require("../config/unityFirebase");

function createSimulationResultsService(getFirestore = getUnityFirestore) {
    return {
        async getSimulationById(simulationId) {
            const doc = await getFirestore()
                .collection("simulationResults")
                .doc(simulationId)
                .get();

            if (!doc.exists) {
                const err = new Error("Simulation result not found");
                err.statusCode = 404;
                err.errorCode = "NOT_FOUND";
                throw err;
            }

            return {
                id: doc.id,
                ...doc.data()
            };
        },

        async getSimulationsByUserId(unityUserId) {
            const snapshot = await getFirestore()
                .collection("simulationResults")
                .where("userId", "==", unityUserId)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }
    };
}

module.exports = {
    ...createSimulationResultsService(),
    createSimulationResultsService
};
