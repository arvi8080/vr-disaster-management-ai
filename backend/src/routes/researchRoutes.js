const express = require("express");
const router = express.Router();
const researchController = require("../controllers/researchController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/metrics", researchController.getMetrics.bind(researchController));

module.exports = router;
