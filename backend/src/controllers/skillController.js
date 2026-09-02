const { analyzeSkillTwin } = require("../services/mlService");

const getSkillTwinData = async (req, res, next) => {
    try {
        const userId = req.user?.uid || req.params.userId || "user-01";
        const skillAnalysis = await analyzeSkillTwin(userId, []);

        res.json({
            success: true,
            data: skillAnalysis
        });
    } catch (error) {
        next(error);
    }
};

const updateSkillTwin = async (req, res, next) => {
    try {
        const userId = req.user?.uid || req.body.userId || "user-01";
        const { historicalSessions } = req.body;

        const updatedTwin = await analyzeSkillTwin(userId, historicalSessions || []);

        res.json({
            success: true,
            message: "Skill Twin recalculated with latest session telemetry",
            data: updatedTwin
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSkillTwinData,
    updateSkillTwin
};
