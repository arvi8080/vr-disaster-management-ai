const { EVENT_TYPES } = require("../utils/constants");

function validateEvent(req) {
    const { sessionId, eventType, timestamp, location, metadata } = req.body;

    if (!sessionId || typeof sessionId !== "string" || sessionId.trim().length === 0) {
        return "sessionId is required";
    }

    if (!eventType || !EVENT_TYPES.includes(eventType)) {
        return `eventType must be one of: ${EVENT_TYPES.join(", ")}`;
    }

    if (location !== undefined && (typeof location !== "object" || location === null)) {
        return "location must be an object (e.g. { x, y, z })";
    }

    if (metadata !== undefined && (typeof metadata !== "object" || metadata === null)) {
        return "metadata must be an object";
    }

    return null;
}

module.exports = {
    validateEvent
};
