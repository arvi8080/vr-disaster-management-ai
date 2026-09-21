const express = require("express");
const router = express.Router();
const skillTwinController = require("../controllers/skillTwinController");
const authMiddleware = require("../middleware/authMiddleware");
const { authorizeTraineeAccess } = require("../middleware/permissionMiddleware");

router.use(authMiddleware);

router.get("/me", skillTwinController.getMe.bind(skillTwinController));
router.get("/me/history", skillTwinController.getMyHistory.bind(skillTwinController));
router.get("/me/progress", skillTwinController.getMyProgress.bind(skillTwinController));
router.get("/:traineeId", authorizeTraineeAccess("traineeId"), skillTwinController.getSkillProfile.bind(skillTwinController));
router.get("/:traineeId/history", authorizeTraineeAccess("traineeId"), skillTwinController.getHistory.bind(skillTwinController));
router.post("/:traineeId/recalculate", authorizeTraineeAccess("traineeId"), skillTwinController.recalculate.bind(skillTwinController));

module.exports = router;


