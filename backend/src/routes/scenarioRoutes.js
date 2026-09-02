const express = require("express");
const router = express.Router();
const scenarioController = require("../controllers/scenarioController");
const authMiddleware = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const { validateCreateScenario, validateUpdateScenario } = require("../validators/scenarioValidator");
const { ROLES } = require("../utils/constants");

router.use(authMiddleware);

router.post(
    "/",
    authorizeRoles(ROLES.TRAINER, ROLES.ADMIN),
    validate(validateCreateScenario),
    scenarioController.createScenario.bind(scenarioController)
);
router.get("/", scenarioController.listScenarios.bind(scenarioController));
router.get("/:id", scenarioController.getScenarioById.bind(scenarioController));
router.put(
    "/:id",
    authorizeRoles(ROLES.TRAINER, ROLES.ADMIN),
    validate(validateUpdateScenario),
    scenarioController.updateScenario.bind(scenarioController)
);
router.delete(
    "/:id",
    authorizeRoles(ROLES.TRAINER, ROLES.ADMIN),
    scenarioController.deleteScenario.bind(scenarioController)
);

module.exports = router;

