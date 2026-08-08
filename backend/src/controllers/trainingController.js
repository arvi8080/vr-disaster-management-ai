const trainingService = require("../services/trainingService");
const { sendSuccess, sendError } = require("../utils/response");
const { ERROR_CODES, ROLES } = require("../utils/constants");

class TrainingController {
    async createSession(req, res, next) {
        try {
            const { scenarioId } = req.body;
            const session = await trainingService.createSession(scenarioId, req.user.uid);
            return sendSuccess(res, session, "Training session created successfully", 201);
        } catch (error) {
            next(error);
        }
    }

    async getSessionById(req, res, next) {
        try {
            const { id } = req.params;
            const session = await trainingService.getSessionById(id);
            if (!session) {
                return sendError(res, "Training session not found", ERROR_CODES.NOT_FOUND, 404);
            }

            // Authorization: self, trainer, or admin
            if (session.traineeId !== req.user.uid && req.user.role === ROLES.TRAINEE) {
                return sendError(res, "Access denied", ERROR_CODES.FORBIDDEN, 403);
            }

            return sendSuccess(res, session);
        } catch (error) {
            next(error);
        }
    }

    async getMySessions(req, res, next) {
        try {
            const result = await trainingService.getUserSessions(req.user.uid, req);
            return sendSuccess(res, result.data, "My training sessions fetched successfully", 200, result.pagination);
        } catch (error) {
            next(error);
        }
    }

    async startSession(req, res, next) {
        try {
            const { id } = req.params;
            const session = await trainingService.startSession(id, req.user.uid);
            return sendSuccess(res, session, "Training session started successfully");
        } catch (error) {
            next(error);
        }
    }

    async completeSession(req, res, next) {
        try {
            const { id } = req.params;
            const session = await trainingService.completeSession(id, req.user.uid, req.body);
            return sendSuccess(res, session, "Training session completed successfully");
        } catch (error) {
            next(error);
        }
    }

    async cancelSession(req, res, next) {
        try {
            const { id } = req.params;
            const session = await trainingService.cancelSession(id, req.user.uid);
            return sendSuccess(res, session, "Training session cancelled successfully");
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TrainingController();
