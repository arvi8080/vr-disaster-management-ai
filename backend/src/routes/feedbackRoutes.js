const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const authMiddleware = require("../middleware/authMiddleware");
const { authorizeTraineeAccess } = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.get("/me", feedbackController.getMe.bind(feedbackController));
router.get("/session/:sessionId", feedbackController.getFeedbackBySessionId.bind(feedbackController));
router.get("/:traineeId", authorizeTraineeAccess("traineeId"), feedbackController.getFeedbackByTraineeId.bind(feedbackController));

module.exports = router;


