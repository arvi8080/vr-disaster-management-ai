const userService = require("../services/userService");
const { sendSuccess, sendError } = require("../utils/response");
const { ERROR_CODES, ROLES } = require("../utils/constants");

class UserController {
    async getUserByUid(req, res, next) {
        try {
            const { uid } = req.params;

            // Authorization check: User can read self, or admin/trainer can read any user
            if (req.user.uid !== uid && req.user.role === ROLES.TRAINEE) {
                return sendError(res, "Access denied", ERROR_CODES.FORBIDDEN, 403);
            }

            const user = await userService.getUserByUid(uid);
            if (!user) {
                return sendError(res, "User not found", ERROR_CODES.NOT_FOUND, 404);
            }
            return sendSuccess(res, user);
        } catch (error) {
            next(error);
        }
    }

    async createProfile(req, res, next) {
        try {
            const userData = {
                uid: req.user.uid,
                email: req.user.email,
                name: req.body.name || req.user.name,
                role: req.body.role || req.user.role,
                photoURL: req.body.photoURL || req.user.photoURL
            };

            const created = await userService.createUserProfile(userData);
            return sendSuccess(res, created, "User profile synchronized successfully", 201);
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req, res, next) {
        try {
            const { uid } = req.params;

            // Non-admins can only update their own profile
            if (req.user.uid !== uid && req.user.role !== ROLES.ADMIN) {
                return sendError(res, "Access denied: cannot modify another user's profile", ERROR_CODES.FORBIDDEN, 403);
            }

            // Non-admins cannot change roles
            if (req.body.role && req.user.role !== ROLES.ADMIN) {
                delete req.body.role;
            }

            const updated = await userService.updateUserProfile(uid, req.body);
            if (!updated) {
                return sendError(res, "User not found", ERROR_CODES.NOT_FOUND, 404);
            }

            return sendSuccess(res, updated, "User profile updated successfully");
        } catch (error) {
            next(error);
        }
    }

    async listUsers(req, res, next) {
        try {
            const result = await userService.listUsers(req);
            return sendSuccess(res, result.data, "Users fetched successfully", 200, result.pagination);
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req, res, next) {
        try {
            const { uid } = req.params;
            const deleted = await userService.deleteUser(uid);
            if (!deleted) {
                return sendError(res, "User not found", ERROR_CODES.NOT_FOUND, 404);
            }
            return sendSuccess(res, { uid }, "User deleted successfully");
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
