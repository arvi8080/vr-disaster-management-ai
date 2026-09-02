const { db } = require("../config/firebase");
const { FieldValue } = require("firebase-admin/firestore");
const { executePaginatedQuery } = require("../utils/pagination");

class ScenarioService {
    async createScenario(scenarioData, createdByUid) {
        const scenario = {
            title: scenarioData.title,
            description: scenarioData.description || "",
            disasterType: scenarioData.disasterType,
            difficulty: scenarioData.difficulty || "medium",
            duration: scenarioData.duration || 900,
            objectives: scenarioData.objectives || [],
            active: scenarioData.active !== undefined ? scenarioData.active : true,
            createdBy: createdByUid,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        };

        const docRef = await db.collection("scenarios").add(scenario);
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
    }

    async getScenarioById(id) {
        const doc = await db.collection("scenarios").doc(id).get();
        if (!doc.exists) {
            return null;
        }
        return { id: doc.id, ...doc.data() };
    }

    async listScenarios(req) {
        let query = db.collection("scenarios");

        if (req.query.disasterType) {
            query = query.where("disasterType", "==", req.query.disasterType);
        }

        if (req.query.difficulty) {
            query = query.where("difficulty", "==", req.query.difficulty);
        }

        if (req.query.active !== undefined) {
            const isActive = req.query.active === "true" || req.query.active === true;
            query = query.where("active", "==", isActive);
        }

        return await executePaginatedQuery(query, req);
    }

    async updateScenario(id, updateData) {
        const docRef = db.collection("scenarios").doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return null;
        }

        const allowedFields = ["title", "description", "disasterType", "difficulty", "duration", "objectives", "active"];
        const cleanData = {};

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                cleanData[field] = updateData[field];
            }
        }
        cleanData.updatedAt = FieldValue.serverTimestamp();

        await docRef.update(cleanData);
        const updatedDoc = await docRef.get();
        return { id: updatedDoc.id, ...updatedDoc.data() };
    }

    async deleteScenario(id) {
        const docRef = db.collection("scenarios").doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return false;
        }

        // Soft delete by marking active = false or hard delete
        await docRef.delete();
        return true;
    }
}

module.exports = new ScenarioService();

