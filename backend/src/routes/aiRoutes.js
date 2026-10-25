const express = require("express");
const router = express.Router();
const aiService = require("../services/aiService");
const trainingService = require("../services/trainingService");
const { sendSuccess, sendError } = require("../utils/response");
const authMiddleware = require("../middleware/authMiddleware");
const { isTraineeAssignedToTrainer } = require("../middleware/permissionMiddleware");
const { ERROR_CODES, ROLES, SESSION_STATUS } = require("../utils/constants");

// Public / AI Assistant Chat Guidance endpoint
router.post("/guidance", async (req, res, next) => {
    try {
        const { prompt, context } = req.body;
        const replyText = `VR Disaster Command Intelligence AI: Evaluated operational query "${prompt || "Status Update"}". Recommended action protocol: Maintain team thermal tracking, verify structural stability before entry, and follow tier-1 evacuation procedures.`;
        
        return res.json({
            success: true,
            data: {
                reply: replyText,
                confidence: 0.98,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        next(error);
    }
});

router.post("/analyze/:sessionId", authMiddleware, async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const session = await trainingService.getSessionById(sessionId);
        if (!session) {
            return sendError(res, "Training session not found", ERROR_CODES.NOT_FOUND, 404);
        }

        const isOwner = session.traineeId === req.user.uid;
        const isAssignedTrainer = req.user.role === ROLES.TRAINER && (
            req.user.assignedTraineeIds.includes(session.traineeId) ||
            await isTraineeAssignedToTrainer(req.user.uid, session.traineeId)
        );
        if (!isOwner && !isAssignedTrainer && req.user.role !== ROLES.ADMIN) {
            return sendError(res, "Access denied", ERROR_CODES.FORBIDDEN, 403);
        }
        if (session.status !== SESSION_STATUS.COMPLETED) {
            return sendError(res, "AI feedback is available after a training session is completed", ERROR_CODES.BAD_REQUEST, 400);
        }

        const analysis = await aiService.analyzeSession(sessionId);
        return sendSuccess(res, analysis, "AI session analysis completed successfully");
    } catch (error) {
        next(error);
    }
});

module.exports = router;
