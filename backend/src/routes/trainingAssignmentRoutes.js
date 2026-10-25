const express = require("express");
const router = express.Router();
const trainingAssignmentController = require("../controllers/trainingAssignmentController");
const authMiddleware = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { ROLES } = require("../utils/constants");

router.use(authMiddleware);

router.get(
    "/scenarios",
    authorizeRoles(ROLES.ADMIN),
    trainingAssignmentController.listScenarios.bind(trainingAssignmentController)
);
router.post(
    "/",
    authorizeRoles(ROLES.ADMIN),
    trainingAssignmentController.createAssignment.bind(trainingAssignmentController)
);
router.post(
    "/to-trainee",
    authorizeRoles(ROLES.TRAINER),
    trainingAssignmentController.createTraineeAssignment.bind(trainingAssignmentController)
);
router.patch(
    "/:id/deadline",
    authorizeRoles(ROLES.TRAINER),
    trainingAssignmentController.updateTraineeAssignmentDeadline.bind(trainingAssignmentController)
);
router.get(
    "/mine",
    authorizeRoles(ROLES.TRAINER),
    trainingAssignmentController.listMyAssignments.bind(trainingAssignmentController)
);
router.get(
    "/for-me",
    authorizeRoles(ROLES.TRAINEE),
    trainingAssignmentController.listMyTraineeAssignments.bind(trainingAssignmentController)
);

module.exports = router;
