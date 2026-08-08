const express = require("express");
const router = express.Router();
const aiService = require("../services/aiService");
const trainingService = require("../services/trainingService");
const authMiddleware = require("../middleware/authMiddleware");
const { sendSuccess, sendError } = require("../utils/response");
const { ERROR_CODES, ROLES } = require("../utils/constants");

router.use(authMiddleware);

router.post("/analyze/:sessionId", async (req, res, next) => {
    try {
        const { sessionId } = req.params;

        const session = await trainingService.getSessionById(sessionId);
        if (!session) {
            return sendError(res, "Training session not found", ERROR_CODES.NOT_FOUND, 404);
        }

        if (session.traineeId !== req.user.uid && req.user.role === ROLES.TRAINEE) {
            return sendError(res, "Access denied", ERROR_CODES.FORBIDDEN, 403);
        }

        const analysis = await aiService.analyzeSession(sessionId);
        return sendSuccess(res, analysis, "AI session analysis completed successfully");
    } catch (error) {
        next(error);
    }
});

module.exports = router;
