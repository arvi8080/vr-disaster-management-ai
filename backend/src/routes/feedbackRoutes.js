const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/me", feedbackController.getMe.bind(feedbackController));
router.get("/session/:sessionId", feedbackController.getFeedbackBySessionId.bind(feedbackController));
router.get("/:traineeId", feedbackController.getFeedbackByTraineeId.bind(feedbackController));

module.exports = router;

