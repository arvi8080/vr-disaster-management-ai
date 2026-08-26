const logger = require("../utils/logger");
const { ERROR_CODES } = require("../utils/constants");

function errorMiddleware(err, req, res, next) {
    logger.error("Unhandled Error Caught", {
        message: err.message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method
    });

    const statusCode = err.statusCode || err.status || 500;
    const errorCode = err.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR;
    const message = err.message || "An unexpected error occurred on the server";

    return res.status(statusCode).json({
        success: false,
        message,
        errorCode,
        ...(err.details ? { details: err.details } : {})
    });
}

function notFoundMiddleware(req, res, next) {
    return res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        errorCode: ERROR_CODES.NOT_FOUND
    });
}

module.exports = {
    errorMiddleware,
    notFoundMiddleware
};
