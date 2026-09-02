const express = require("express");
const router = express.Router();
const skillTwinController = require("../controllers/skillTwinController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/me", skillTwinController.getMe.bind(skillTwinController));
router.get("/me/history", skillTwinController.getMyHistory.bind(skillTwinController));
router.get("/me/progress", skillTwinController.getMyProgress.bind(skillTwinController));
router.get("/:traineeId", skillTwinController.getSkillProfile.bind(skillTwinController));
router.get("/:traineeId/history", skillTwinController.getHistory.bind(skillTwinController));
router.post("/:traineeId/recalculate", skillTwinController.recalculate.bind(skillTwinController));

module.exports = router;

