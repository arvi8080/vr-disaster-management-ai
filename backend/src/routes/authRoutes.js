const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, authController.getMe.bind(authController));

module.exports = router;

