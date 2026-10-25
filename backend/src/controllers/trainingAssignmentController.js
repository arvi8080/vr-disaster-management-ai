const { sendSuccess, sendError } = require("../utils/response");
const { ERROR_CODES } = require("../utils/constants");
const unityScenarioCatalogService = require("../services/unityScenarioCatalogService");
const trainingAssignmentService = require("../services/trainingAssignmentService");

class TrainingAssignmentController {
    constructor({
        scenarioCatalog = unityScenarioCatalogService,
        assignmentService = trainingAssignmentService
    } = {}) {
        this.scenarioCatalog = scenarioCatalog;
        this.assignmentService = assignmentService;
    }

    async listScenarios(req, res, next) {
        try {
            return sendSuccess(
                res,
                await this.scenarioCatalog.listScenarios(),
                "Unity-backed scenarios retrieved successfully"
            );
        } catch (error) {
            next(error);
        }
    }

    async createAssignment(req, res, next) {
        try {
            const result = await this.assignmentService.createAssignment({
                scenarioId: req.body?.scenarioId,
                trainerId: req.body?.trainerId,
                adminId: req.user.uid
            });
            const message = result.created
                ? "Scenario assigned to trainer successfully"
                : "This scenario is already assigned to this trainer";
            return sendSuccess(res, result.assignment, message, result.created ? 201 : 200);
        } catch (error) {
            if (error.statusCode) {
                return sendError(
                    res,
                    error.message,
                    error.errorCode || ERROR_CODES.BAD_REQUEST,
                    error.statusCode
                );
            }
            return next(error);
        }
    }

    async createTraineeAssignment(req, res, next) {
        try {
            const result = await this.assignmentService.createTraineeAssignment({
                scenarioId: req.body?.scenarioId,
                traineeId: req.body?.traineeId,
                dueAt: req.body?.dueAt,
                trainerId: req.user.uid,
                assignedBy: req.user.uid
            });
            const message = result.created
                ? "Scenario assigned to trainee successfully"
                : "This scenario is already assigned to this trainee";
            return sendSuccess(res, result.assignment, message, result.created ? 201 : 200);
        } catch (error) {
            if (error.statusCode) {
                return sendError(
                    res,
                    error.message,
                    error.errorCode || ERROR_CODES.BAD_REQUEST,
                    error.statusCode
                );
            }
            return next(error);
        }
    }

    async updateTraineeAssignmentDeadline(req, res, next) {
        try {
            const assignment = await this.assignmentService.updateTraineeAssignmentDeadline({
                assignmentId: req.params.id,
                trainerId: req.user.uid,
                dueAt: req.body?.dueAt
            });
            return sendSuccess(res, assignment, "Training deadline updated successfully");
        } catch (error) {
            if (error.statusCode) {
                return sendError(
                    res,
                    error.message,
                    error.errorCode || ERROR_CODES.BAD_REQUEST,
                    error.statusCode
                );
            }
            return next(error);
        }
    }

    async listMyAssignments(req, res, next) {
        try {
            const assignments = await this.assignmentService.listAssignmentsForTrainer(req.user.uid);
            return sendSuccess(res, assignments, "Your training assignments retrieved successfully");
        } catch (error) {
            next(error);
        }
    }

    async listMyTraineeAssignments(req, res, next) {
        try {
            const assignments = await this.assignmentService.listAssignmentsForTrainee(req.user.uid);
            return sendSuccess(res, assignments, "Your training assignments retrieved successfully");
        } catch (error) {
            next(error);
        }
    }
}

const trainingAssignmentController = new TrainingAssignmentController();
module.exports = trainingAssignmentController;
module.exports.TrainingAssignmentController = TrainingAssignmentController;
