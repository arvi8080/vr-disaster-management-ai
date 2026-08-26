const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const { validateUpdateProfile } = require("../validators/authValidator");
const { ROLES } = require("../utils/constants");

router.use(authMiddleware);

router.get("/", authorizeRoles(ROLES.ADMIN), userController.listUsers.bind(userController));
router.post("/profile", validate(validateUpdateProfile), userController.createProfile.bind(userController));
router.get("/:uid", userController.getUserByUid.bind(userController));
router.put("/:uid", validate(validateUpdateProfile), userController.updateProfile.bind(userController));
router.delete("/:uid", authorizeRoles(ROLES.ADMIN), userController.deleteUser.bind(userController));

module.exports = router;
