const { db } = require("../config/firebase");
const { FieldValue } = require("firebase-admin/firestore");
const { executePaginatedQuery } = require("../utils/pagination");

class UserService {
    async getUserByUid(uid) {
        const doc = await db.collection("users").doc(uid).get();
        if (!doc.exists) {
            return null;
        }
        return { uid: doc.id, ...doc.data() };
    }

    async createUserProfile(userData) {
        const { uid, name, email, role, photoURL, requestTrainer } = userData;
        const isTrainerRequest = Boolean(requestTrainer);
        const profile = {
            uid,
            name: name || (email ? email.split("@")[0] : "User"),
            email: email || "",
            role: role || "trainee",
            photoURL: photoURL || null,
            trainerAccessStatus: isTrainerRequest ? "pending" : (userData.trainerAccessStatus || "none"),
            allowedScenarios: userData.allowedScenarios || ["fire", "flood", "earthquake"],
            assignedTrainerId: userData.assignedTrainerId || null,
            assignedTraineeIds: userData.assignedTraineeIds || [],
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        };

        await db.collection("users").doc(uid).set(profile);
        return profile;
    }

    async updateUserProfile(uid, updateData) {
        const userRef = db.collection("users").doc(uid);
        const doc = await userRef.get();
        if (!doc.exists) {
            return null;
        }

        const allowedFields = ["name", "photoURL", "role", "allowedScenarios", "assignedTrainerId", "assignedTraineeIds", "trainerAccessStatus"];
        const cleanData = {};
        
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                cleanData[field] = updateData[field];
            }
        }
        
        cleanData.updatedAt = FieldValue.serverTimestamp();

        await userRef.update(cleanData);
        const updatedDoc = await userRef.get();
        return { uid: updatedDoc.id, ...updatedDoc.data() };
    }

    async approveTrainerAccess(uid, approve = true) {
        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error(`User ${uid} not found`);
        }

        const updateData = approve ? {
            role: "trainer",
            trainerAccessStatus: "approved",
            updatedAt: FieldValue.serverTimestamp()
        } : {
            role: "trainee",
            trainerAccessStatus: "rejected",
            updatedAt: FieldValue.serverTimestamp()
        };

        await userRef.update(updateData);
        const updatedDoc = await userRef.get();
        return { uid: updatedDoc.id, ...updatedDoc.data() };
    }

    async assignTraineeToTrainer(traineeId, trainerId) {
        const traineeRef = db.collection("users").doc(traineeId);
        const traineeDoc = await traineeRef.get();
        if (!traineeDoc.exists) {
            throw new Error(`Trainee ${traineeId} not found`);
        }

        let oldTrainerId = traineeDoc.data().assignedTrainerId;

        // Update trainee's assignedTrainerId
        await traineeRef.update({
            assignedTrainerId: trainerId,
            updatedAt: FieldValue.serverTimestamp()
        });

        // Remove from old trainer's assignedTraineeIds array if present
        if (oldTrainerId && oldTrainerId !== trainerId) {
            const oldTrainerRef = db.collection("users").doc(oldTrainerId);
            const oldTrainerDoc = await oldTrainerRef.get();
            if (oldTrainerDoc.exists) {
                const currentTrainees = oldTrainerDoc.data().assignedTraineeIds || [];
                await oldTrainerRef.update({
                    assignedTraineeIds: currentTrainees.filter(id => id !== traineeId),
                    updatedAt: FieldValue.serverTimestamp()
                });
            }
        }

        // Add to new trainer's assignedTraineeIds array
        if (trainerId) {
            const trainerRef = db.collection("users").doc(trainerId);
            const trainerDoc = await trainerRef.get();
            if (trainerDoc.exists) {
                const currentTrainees = trainerDoc.data().assignedTraineeIds || [];
                if (!currentTrainees.includes(traineeId)) {
                    await trainerRef.update({
                        assignedTraineeIds: [...currentTrainees, traineeId],
                        updatedAt: FieldValue.serverTimestamp()
                    });
                }
            }
        }

        return { traineeId, trainerId };
    }

    async updateUserPermissions(uid, allowedScenarios) {
        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error(`User ${uid} not found`);
        }

        const scenariosArray = Array.isArray(allowedScenarios) ? allowedScenarios : [allowedScenarios];

        await userRef.update({
            allowedScenarios: scenariosArray,
            updatedAt: FieldValue.serverTimestamp()
        });

        const updatedDoc = await userRef.get();
        return { uid: updatedDoc.id, ...updatedDoc.data() };
    }

    async listUsers(req) {
        let query = db.collection("users");

        if (req.query.role) {
            query = query.where("role", "==", req.query.role);
        }

        if (req.query.assignedTrainerId) {
            query = query.where("assignedTrainerId", "==", req.query.assignedTrainerId);
        }

        return await executePaginatedQuery(query, req);
    }

    async deleteUser(uid) {
        const userRef = db.collection("users").doc(uid);
        const doc = await userRef.get();
        if (!doc.exists) {
            return false;
        }
        await userRef.delete();
        return true;
    }
}

module.exports = new UserService();


