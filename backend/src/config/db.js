const { db } = require("./firebase");

/**
 * Helper repository wrapper providing Firestore operations
 * with local fallback memory store if Firestore credentials are dummy.
 */
class DataRepository {
    constructor() {
        this.memoryStore = {
            users: new Map(),
            trainingSessions: new Map(),
            skillTwins: new Map(),
            performanceLogs: new Map(),
            feedback: new Map()
        };
    }

    async getCollection(collectionName) {
        try {
            const snapshot = await db.collection(collectionName).get();
            const docs = [];
            snapshot.forEach((doc) => docs.push({ id: doc.id, ...doc.data() }));
            return docs;
        } catch (err) {
            // Fallback memory store
            return Array.from(this.memoryStore[collectionName]?.values() || []);
        }
    }

    async saveDoc(collectionName, docId, data) {
        try {
            await db.collection(collectionName).doc(docId).set(data, { merge: true });
        } catch (err) {
            if (!this.memoryStore[collectionName]) {
                this.memoryStore[collectionName] = new Map();
            }
            this.memoryStore[collectionName].set(docId, { id: docId, ...data });
        }
        return { id: docId, ...data };
    }
}

const repository = new DataRepository();

module.exports = { db, repository };
