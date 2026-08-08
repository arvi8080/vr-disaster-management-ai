const { DISASTER_TYPES, DIFFICULTY_LEVELS } = require("../utils/constants");

function validateCreateScenario(req) {
    const { title, description, disasterType, difficulty, duration, objectives } = req.body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
        return "Scenario title is required";
    }

    if (!disasterType || !DISASTER_TYPES.includes(disasterType)) {
        return `disasterType must be one of: ${DISASTER_TYPES.join(", ")}`;
    }

    if (difficulty && !DIFFICULTY_LEVELS.includes(difficulty)) {
        return `difficulty must be one of: ${DIFFICULTY_LEVELS.join(", ")}`;
    }

    if (duration !== undefined && (typeof duration !== "number" || duration <= 0)) {
        return "duration must be a positive number (seconds)";
    }

    if (objectives !== undefined && !Array.isArray(objectives)) {
        return "objectives must be an array of strings";
    }

    return null;
}

function validateUpdateScenario(req) {
    const { title, disasterType, difficulty, duration, objectives, active } = req.body;

    if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
        return "Scenario title cannot be empty";
    }

    if (disasterType !== undefined && !DISASTER_TYPES.includes(disasterType)) {
        return `disasterType must be one of: ${DISASTER_TYPES.join(", ")}`;
    }

    if (difficulty !== undefined && !DIFFICULTY_LEVELS.includes(difficulty)) {
        return `difficulty must be one of: ${DIFFICULTY_LEVELS.join(", ")}`;
    }

    if (duration !== undefined && (typeof duration !== "number" || duration <= 0)) {
        return "duration must be a positive number";
    }

    if (objectives !== undefined && !Array.isArray(objectives)) {
        return "objectives must be an array";
    }

    if (active !== undefined && typeof active !== "boolean") {
        return "active must be a boolean";
    }

    return null;
}

module.exports = {
    validateCreateScenario,
    validateUpdateScenario
};
