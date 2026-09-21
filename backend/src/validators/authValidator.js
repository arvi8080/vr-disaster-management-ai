const { ROLES } = require("../utils/constants");

function validateUpdateProfile(req) {
    const { name, role, photoURL, requestTrainer } = req.body;

    if (
        name !== undefined &&
        (typeof name !== "string" || name.trim().length === 0)
    ) {
        return "Name must be a non-empty string";
    }

    if (
        role !== undefined &&
        !Object.values(ROLES).includes(role)
    ) {
        return `Role must be one of: ${Object.values(ROLES).join(", ")}`;
    }

    if (
        photoURL !== undefined &&
        photoURL !== null &&
        typeof photoURL !== "string"
    ) {
        return "photoURL must be a string or null";
    }

    if (
        requestTrainer !== undefined &&
        typeof requestTrainer !== "boolean"
    ) {
        return "requestTrainer must be a boolean";
    }

    return null;
}

module.exports = {
    validateUpdateProfile
};

