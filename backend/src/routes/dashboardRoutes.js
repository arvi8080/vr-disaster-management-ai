const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { ROLES } = require("../utils/constants");

router.use(authMiddleware);

router.get("/trainee", dashboardController.getTraineeDashboard.bind(dashboardController));
router.get("/trainer", authorizeRoles(ROLES.TRAINER, ROLES.ADMIN), dashboardController.getTrainerDashboard.bind(dashboardController));
router.get("/admin", authorizeRoles(ROLES.ADMIN), dashboardController.getAdminDashboard.bind(dashboardController));

module.exports = router;
