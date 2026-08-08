const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { ROLES } = require("../utils/constants");

router.use(authMiddleware, authorizeRoles(ROLES.ADMIN));

router.get("/users", adminController.getUsers.bind(adminController));
router.get("/stats", adminController.getSystemStats.bind(adminController));

module.exports = router;
