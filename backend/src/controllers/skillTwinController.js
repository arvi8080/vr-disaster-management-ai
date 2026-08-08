const skillTwinService = require("../services/skillTwinService");
const { sendSuccess, sendError } = require("../utils/response");
const { ERROR_CODES, ROLES } = require("../utils/constants");

class SkillTwinController {
    async getMe(req, res, next) {
        try {
            const profile = await skillTwinService.getSkillTwin(req.user.uid);
            return sendSuccess(res, profile, "Digital Skill Twin profile retrieved successfully");
        } catch (error) {
            next(error);
        }
    }

    async getMyHistory(req, res, next) {
        try {
            const history = await skillTwinService.getSkillHistory(req.user.uid);
            return sendSuccess(res, history, "My skill twin training history retrieved successfully");
        } catch (error) {
            next(error);
        }
    }

    async getMyProgress(req, res, next) {
        try {
            const progress = await skillTwinService.getSkillProgress(req.user.uid);
            return sendSuccess(res, progress, "My skill twin progress and trends retrieved successfully");
        } catch (error) {
            next(error);
        }
    }

    async getSkillProfile(req, res, next) {
        try {
            const { traineeId } = req.params;

            // Authorization: self, trainer, admin
            if (req.user.uid !== traineeId && req.user.role === ROLES.TRAINEE) {
                return sendError(res, "Access denied", ERROR_CODES.FORBIDDEN, 403);
            }

            const profile = await skillTwinService.getSkillTwin(traineeId);
            return sendSuccess(res, profile);
        } catch (error) {
            next(error);
        }
    }

    async getHistory(req, res, next) {
        try {
            const { traineeId } = req.params;

            if (req.user.uid !== traineeId && req.user.role === ROLES.TRAINEE) {
                return sendError(res, "Access denied", ERROR_CODES.FORBIDDEN, 403);
            }

            const history = await skillTwinService.getSkillHistory(traineeId);
            return sendSuccess(res, history, "Skill twin training history retrieved successfully");
        } catch (error) {
            next(error);
        }
    }

    async recalculate(req, res, next) {
        try {
            const { traineeId } = req.params;

            if (req.user.uid !== traineeId && req.user.role === ROLES.TRAINEE) {
                return sendError(res, "Access denied", ERROR_CODES.FORBIDDEN, 403);
            }

            const profile = await skillTwinService.recalculateSkillProfile(traineeId);
            return sendSuccess(res, profile, "Digital Skill Twin profile recalculated successfully");
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SkillTwinController();
