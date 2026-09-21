const userService = require("../services/userService");
const userController = require("./userController");
const dashboardController = require("./dashboardController");
const { sendSuccess, sendError } = require("../utils/response");
const { ERROR_CODES } = require("../utils/constants");

class AdminController {
    async getUsers(req, res, next) {
        return userController.listUsers(req, res, next);
    }

    async getSystemStats(req, res, next) {
        return dashboardController.getAdminDashboard(req, res, next);
    }

    async assignTrainer(req, res, next) {
        try {
            const { traineeId, trainerId } = req.body;
            if (!traineeId) {
                return sendError(res, "traineeId is required", ERROR_CODES.BAD_REQUEST, 400);
            }
            const result = await userService.assignTraineeToTrainer(traineeId, trainerId || null);
            return sendSuccess(res, result, "Trainee successfully assigned to trainer");
        } catch (error) {
            next(error);
        }
    }

    async updatePermissions(req, res, next) {
        try {
            const { uid, allowedScenarios } = req.body;
            if (!uid || !allowedScenarios) {
                return sendError(res, "uid and allowedScenarios are required", ERROR_CODES.BAD_REQUEST, 400);
            }
            const updated = await userService.updateUserPermissions(uid, allowedScenarios);
            return sendSuccess(res, updated, "User scenario permissions updated successfully");
        } catch (error) {
            next(error);
        }
    }

    async updateUserRole(req, res, next) {
        try {
            const { uid } = req.params;
            const { role } = req.body;
            if (!role) {
                return sendError(res, "Role is required", ERROR_CODES.BAD_REQUEST, 400);
            }
            const updated = await userService.updateUserProfile(uid, { role });
            return sendSuccess(res, updated, "User role updated successfully");
        } catch (error) {
            next(error);
        }
    }

    async approveTrainer(req, res, next) {
        try {
            const { uid, approve } = req.body;
            if (!uid) {
                return sendError(res, "User uid is required", ERROR_CODES.BAD_REQUEST, 400);
            }
            const updated = await userService.approveTrainerAccess(uid, approve !== false);
            return sendSuccess(res, updated, `Trainer access request ${approve !== false ? 'approved' : 'rejected'} successfully`);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdminController();


