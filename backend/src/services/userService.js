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
        const { uid, name, email, role, photoURL } = userData;
        const profile = {
            uid,
            name: name || (email ? email.split("@")[0] : "User"),
            email: email || "",
            role: role || "trainee",
            photoURL: photoURL || null,
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

        const allowedFields = ["name", "photoURL", "role"];
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

    async listUsers(req) {
        let query = db.collection("users");

        if (req.query.role) {
            query = query.where("role", "==", req.query.role);
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
