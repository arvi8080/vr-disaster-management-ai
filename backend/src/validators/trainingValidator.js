function validateCreateSession(req) {
    const { scenarioId } = req.body;

    if (!scenarioId || typeof scenarioId !== "string" || scenarioId.trim().length === 0) {
        return "scenarioId is required";
    }

    return null;
}

module.exports = {
    validateCreateSession
};
