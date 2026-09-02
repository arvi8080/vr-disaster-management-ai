const express = require("express");
const router = express.Router();
const trainingController = require("../controllers/trainingController");
const authMiddleware = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const { validateCreateSession } = require("../validators/trainingValidator");

router.use(authMiddleware);

router.post("/sessions", validate(validateCreateSession), trainingController.createSession.bind(trainingController));
router.get("/my-sessions", trainingController.getMySessions.bind(trainingController));
router.get("/sessions/:id", trainingController.getSessionById.bind(trainingController));
router.post("/sessions/:id/start", trainingController.startSession.bind(trainingController));
router.post("/sessions/:id/complete", trainingController.completeSession.bind(trainingController));
router.post("/sessions/:id/cancel", trainingController.cancelSession.bind(trainingController));

module.exports = router;

