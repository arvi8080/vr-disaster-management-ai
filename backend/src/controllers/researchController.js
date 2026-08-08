const researchService = require("../services/researchService");
const { sendSuccess } = require("../utils/response");

class ResearchController {
    async getMetrics(req, res, next) {
        try {
            const metrics = await researchService.getResearchMetrics();
            return sendSuccess(res, metrics, "Research metrics retrieved successfully");
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ResearchController();
