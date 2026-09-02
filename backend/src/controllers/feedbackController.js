const feedbackService = require("../services/feedbackService");
const trainingService = require("../services/trainingService");
const { sendSuccess, sendError } = require("../utils/response");
const { ERROR_CODES, ROLES } = require("../utils/constants");

class FeedbackController {
    async getMe(req, res, next) {
        try {
            const result = await feedbackService.getFeedbackByTraineeId(req.user.uid, req);
            return sendSuccess(res, result.data, "Feedback records retrieved successfully", 200, result.pagination);
        } catch (error) {
            next(error);
        }
    }

    async getFeedbackByTraineeId(req, res, next) {
        try {
            const { traineeId } = req.params;

            if (req.user.uid !== traineeId && req.user.role === ROLES.TRAINEE) {
                return sendError(res, "Access denied", ERROR_CODES.FORBIDDEN, 403);
            }

            const result = await feedbackService.getFeedbackByTraineeId(traineeId, req);
            return sendSuccess(res, result.data, "Feedback records retrieved successfully", 200, result.pagination);
        } catch (error) {
            next(error);
        }
    }

    async getFeedbackBySessionId(req, res, next) {
        try {
            const { sessionId } = req.params;

            const session = await trainingService.getSessionById(sessionId);
            if (!session) {
                return sendError(res, "Training session not found", ERROR_CODES.NOT_FOUND, 404);
            }

            if (session.traineeId !== req.user.uid && req.user.role === ROLES.TRAINEE) {
                return sendError(res, "Access denied", ERROR_CODES.FORBIDDEN, 403);
            }

            const feedbackList = await feedbackService.getFeedbackBySessionId(sessionId);
            return sendSuccess(res, feedbackList, "Session feedback retrieved successfully");
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new FeedbackController();

