const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const authMiddleware = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const { validateEvent } = require("../validators/eventValidator");

router.use(authMiddleware);

router.post("/events", validate(validateEvent), eventController.addEvent.bind(eventController));
router.get("/sessions/:sessionId/events", eventController.getSessionEvents.bind(eventController));

module.exports = router;

