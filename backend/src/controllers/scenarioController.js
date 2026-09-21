const scenarioService = require("../services/scenarioService");
const { sendSuccess, sendError } = require("../utils/response");
const { ERROR_CODES, ROLES } = require("../utils/constants");
const { hasScenarioAccess } = require("../middleware/permissionMiddleware");

class ScenarioController {
    async createScenario(req, res, next) {
        try {
            const scenario = await scenarioService.createScenario(req.body, req.user.uid);
            return sendSuccess(res, scenario, "Scenario created successfully", 201);
        } catch (error) {
            next(error);
        }
    }

    async listScenarios(req, res, next) {
        try {
            const result = await scenarioService.listScenarios(req);
            
            // Filter scenarios according to req.user.allowedScenarios if not Admin
            if (req.user && req.user.role !== ROLES.ADMIN && req.user.allowedScenarios && Array.isArray(result.data)) {
                result.data = result.data.filter(s => hasScenarioAccess(req.user.allowedScenarios, s.disasterType));
            }

            return sendSuccess(res, result.data, "Scenarios retrieved successfully", 200, result.pagination);
        } catch (error) {
            next(error);
        }
    }

    async getScenarioById(req, res, next) {
        try {
            const { id } = req.params;
            const scenario = await scenarioService.getScenarioById(id);
            if (!scenario) {
                return sendError(res, "Scenario not found", ERROR_CODES.NOT_FOUND, 404);
            }

            if (req.user && req.user.role !== ROLES.ADMIN) {
                if (!hasScenarioAccess(req.user.allowedScenarios, scenario.disasterType)) {
                    return sendError(res, `Access denied: You do not have permission to access '${scenario.disasterType}' scenarios`, ERROR_CODES.FORBIDDEN, 403);
                }
            }

            return sendSuccess(res, scenario);
        } catch (error) {
            next(error);
        }
    }

    async updateScenario(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await scenarioService.updateScenario(id, req.body);
            if (!updated) {
                return sendError(res, "Scenario not found", ERROR_CODES.NOT_FOUND, 404);
            }
            return sendSuccess(res, updated, "Scenario updated successfully");
        } catch (error) {
            next(error);
        }
    }

    async deleteScenario(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await scenarioService.deleteScenario(id);
            if (!deleted) {
                return sendError(res, "Scenario not found", ERROR_CODES.NOT_FOUND, 404);
            }
            return sendSuccess(res, { id }, "Scenario deleted successfully");
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ScenarioController();

