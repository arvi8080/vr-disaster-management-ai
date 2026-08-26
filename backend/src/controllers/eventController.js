const eventService = require("../services/eventService");
const trainingService = require("../services/trainingService");
const { sendSuccess, sendError } = require("../utils/response");
const { ERROR_CODES, ROLES } = require("../utils/constants");

class EventController {
    async addEvent(req, res, next) {
        try {
            const eventRecord = await eventService.addEvent(req.body, req.user.uid);
            return sendSuccess(res, eventRecord, "Training event recorded successfully", 201);
        } catch (error) {
            next(error);
        }
    }

    async getSessionEvents(req, res, next) {
        try {
            const { sessionId } = req.params;

            // Verify session access permissions
            const session = await trainingService.getSessionById(sessionId);
            if (!session) {
                return sendError(res, "Training session not found", ERROR_CODES.NOT_FOUND, 404);
            }

            if (session.traineeId !== req.user.uid && req.user.role === ROLES.TRAINEE) {
                return sendError(res, "Access denied", ERROR_CODES.FORBIDDEN, 403);
            }

            const result = await eventService.getEventsBySessionId(sessionId, req);
            return sendSuccess(res, result.data, "Session events retrieved successfully", 200, result.pagination);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new EventController();
