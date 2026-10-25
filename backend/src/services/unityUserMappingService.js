const { db } = require("../config/firebase");

function createUnityUserMappingService(platformDb = db) {
    return {
        async getUnityUserId(platformUid) {
            const mappingDoc = await platformDb
                .collection("unityUserMappings")
                .doc(platformUid)
                .get();

            if (!mappingDoc.exists) {
                return null;
            }

            const mapping = mappingDoc.data();
            if (
                mapping.platformUid !== platformUid ||
                typeof mapping.unityUserId !== "string" ||
                !mapping.unityUserId.trim()
            ) {
                return null;
            }

            return mapping.unityUserId;
        }
    };
}

module.exports = {
    ...createUnityUserMappingService(),
    createUnityUserMappingService
};
