const { db } = require("../config/firebase");
const { FieldValue } = require("firebase-admin/firestore");
const { executePaginatedQuery } = require("../utils/pagination");

class EventService {
    async addEvent(eventData, traineeId) {
        const { sessionId, eventType, timestamp, location, metadata } = eventData;

        // Verify session belongs to trainee
        const sessionDoc = await db.collection("trainingSessions").doc(sessionId).get();
        if (!sessionDoc.exists) {
            const err = new Error("Training session not found");
            err.statusCode = 404;
            err.errorCode = "NOT_FOUND";
            throw err;
        }

        const session = sessionDoc.data();
        if (session.traineeId !== traineeId) {
            const err = new Error("Unauthorized event submission for another user's session");
            err.statusCode = 403;
            err.errorCode = "FORBIDDEN";
            throw err;
        }

        const eventRecord = {
            sessionId,
            traineeId,
            eventType,
            timestamp: timestamp || new Date().toISOString(),
            location: location || {},
            metadata: metadata || {},
            createdAt: FieldValue.serverTimestamp()
        };

        const docRef = await db.collection("trainingEvents").add(eventRecord);
        const doc = await docRef.get();

        // Increment actionsCompleted in trainingSession if appropriate
        await db.collection("trainingSessions").doc(sessionId).update({
            actionsCompleted: FieldValue.increment(1)
        });

        return { id: doc.id, ...doc.data() };
    }

    async getEventsBySessionId(sessionId, req) {
        const query = db.collection("trainingEvents")
            .where("sessionId", "==", sessionId);

        return await executePaginatedQuery(query, req);
    }

    async getAllEventsForSession(sessionId) {
        const snapshot = await db.collection("trainingEvents")
            .where("sessionId", "==", sessionId)
            .get();

        const events = [];
        snapshot.forEach(doc => {
            events.push({ id: doc.id, ...doc.data() });
        });

        // Sort by timestamp
        events.sort((a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt));
        return events;
    }
}

module.exports = new EventService();
