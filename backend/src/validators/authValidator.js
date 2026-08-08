const { ROLES } = require("../utils/constants");

function validateUpdateProfile(req) {
    const { name, role, photoURL } = req.body;

    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
        return "Name must be a non-empty string";
    }

    if (role !== undefined && !Object.values(ROLES).includes(role)) {
        return `Role must be one of: ${Object.values(ROLES).join(", ")}`;
    }

    if (photoURL !== undefined && photoURL !== null && typeof photoURL !== "string") {
        return "photoURL must be a string or null";
    }

    return null;
}

module.exports = {
    validateUpdateProfile
};
