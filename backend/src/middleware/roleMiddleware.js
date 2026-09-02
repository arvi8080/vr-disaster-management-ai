const { sendError } = require("../utils/response");
const { ERROR_CODES } = require("../utils/constants");

function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return sendError(res, "Authentication required", ERROR_CODES.UNAUTHORIZED, 401);
        }

        if (!allowedRoles.includes(req.user.role)) {
            return sendError(
                res,
                `Access denied: requires one of [${allowedRoles.join(", ")}] permissions`,
                ERROR_CODES.FORBIDDEN,
                403
            );
        }

        next();
    };
}

module.exports = {
    authorizeRoles
};

