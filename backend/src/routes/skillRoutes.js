const express = require("express");
const router = express.Router();
const { getSkillTwinData, updateSkillTwin } = require("../controllers/skillController");

router.get("/twin", getSkillTwinData);
router.get("/twin/:userId", getSkillTwinData);
router.post("/twin/evaluate", updateSkillTwin);

module.exports = router;
