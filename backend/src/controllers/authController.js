const userService = require("../services/userService");
const { sendSuccess, sendError } = require("../utils/response");
const { ERROR_CODES } = require("../utils/constants");

class AuthController {
    async getMe(req, res, next) {
        try {
            const userProfile = await userService.getUserByUid(req.user.uid);
            if (!userProfile) {
                return sendError(res, "User profile not found", ERROR_CODES.NOT_FOUND, 404);
            }
            return sendSuccess(res, userProfile, "Authenticated user profile retrieved successfully");
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
