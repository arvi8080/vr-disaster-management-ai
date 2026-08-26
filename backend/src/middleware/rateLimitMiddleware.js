const { sendError } = require("../utils/response");
const { ERROR_CODES } = require("../utils/constants");

const requestsMap = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes window
const MAX_REQUESTS = 200; // max requests per window

function rateLimitMiddleware(req, res, next) {
    const key = req.ip || req.headers["x-forwarded-for"] || "global";
    const now = Date.now();

    if (!requestsMap.has(key)) {
        requestsMap.set(key, { count: 1, resetTime: now + WINDOW_MS });
        return next();
    }

    const clientData = requestsMap.get(key);

    if (now > clientData.resetTime) {
        clientData.count = 1;
        clientData.resetTime = now + WINDOW_MS;
        return next();
    }

    clientData.count += 1;

    if (clientData.count > MAX_REQUESTS) {
        return sendError(
            res,
            "Too many requests. Please try again later.",
            ERROR_CODES.TOO_MANY_REQUESTS,
            429
        );
    }

    next();
}

module.exports = rateLimitMiddleware;
