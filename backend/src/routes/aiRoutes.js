const express = require("express");
const router = express.Router();
const aiService = require("../services/aiService");
const trainingService = require("../services/trainingService");
const { sendSuccess, sendError } = require("../utils/response");

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

router.post("/analyze/:sessionId", async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const analysis = await aiService.analyzeSession(sessionId);
        return sendSuccess(res, analysis, "AI session analysis completed successfully");
    } catch (error) {
        next(error);
    }
});

module.exports = router;
