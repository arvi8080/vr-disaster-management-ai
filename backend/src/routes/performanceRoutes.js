const express = require("express");
const router = express.Router();
const { getPerformanceAnalytics, evaluatePerformance } = require("../controllers/performanceController");

router.get("/analytics", getPerformanceAnalytics);
router.post("/evaluate", evaluatePerformance);

module.exports = router;
