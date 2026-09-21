const { db } = require("../config/firebase");
const { sendError } = require("../utils/response");
const { ERROR_CODES, ROLES } = require("../utils/constants");

function hasScenarioAccess(userAllowedScenarios, disasterType) {
    if (!userAllowedScenarios || !Array.isArray(userAllowedScenarios)) {
        return false;
    }
    if (userAllowedScenarios.includes("*")) {
        return true;
    }
    if (!disasterType) {
        return true;
    }
    const normalizedType = disasterType.toLowerCase().trim();
    return userAllowedScenarios.some(sc => sc.toLowerCase().trim() === normalizedType || sc === "*");
}

function authorizeScenarioPermission(getDisasterType) {
    return (req, res, next) => {
        if (!req.user) {
            return sendError(res, "Authentication required", ERROR_CODES.UNAUTHORIZED, 401);
        }

        if (req.user.role === ROLES.ADMIN) {
            return next();
        }

        const disasterType = typeof getDisasterType === "function" ? getDisasterType(req) : req.body.disasterType || req.query.disasterType;

        if (!hasScenarioAccess(req.user.allowedScenarios, disasterType)) {
            return sendError(
                res,
                `Access denied: You do not have permission for disaster scenario '${disasterType || "requested"}'`,
                ERROR_CODES.FORBIDDEN,
                403
            );
        }

        next();
    };
}

async function isTraineeAssignedToTrainer(trainerUid, traineeUid) {
    const traineeDoc = await db.collection("users").doc(traineeUid).get();
    if (!traineeDoc.exists) {
        return false;
    }
    const traineeData = traineeDoc.data();
    return traineeData.assignedTrainerId === trainerUid;
}

function authorizeTraineeAccess(traineeIdParam = "traineeId") {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return sendError(res, "Authentication required", ERROR_CODES.UNAUTHORIZED, 401);
            }

            const targetTraineeId = req.params[traineeIdParam] || req.body[traineeIdParam] || req.query[traineeIdParam];

            if (!targetTraineeId) {
                return next();
            }

            // Admins can access all trainees
            if (req.user.role === ROLES.ADMIN) {
                return next();
            }

            // Trainees can only access themselves
            if (req.user.role === ROLES.TRAINEE) {
                if (req.user.uid === targetTraineeId) {
                    return next();
                }
                return sendError(res, "Access denied: Cannot access another trainee's data", ERROR_CODES.FORBIDDEN, 403);
            }

            // Trainers can access trainees assigned to them
            if (req.user.role === ROLES.TRAINER) {
                if (req.user.uid === targetTraineeId) {
                    return next();
                }

                // Check assignedTraineeIds on req.user or check Firestore
                const isAssigned = (req.user.assignedTraineeIds && req.user.assignedTraineeIds.includes(targetTraineeId)) ||
                                  await isTraineeAssignedToTrainer(req.user.uid, targetTraineeId);

                if (isAssigned) {
                    return next();
                }

                return sendError(
                    res,
                    "Access denied: This trainee is not assigned to you",
                    ERROR_CODES.FORBIDDEN,
                    403
                );
            }

            return sendError(res, "Access denied", ERROR_CODES.FORBIDDEN, 403);
        } catch (error) {
            next(error);
        }
    };
}

module.exports = {
    hasScenarioAccess,
    authorizeScenarioPermission,
    authorizeTraineeAccess,
    isTraineeAssignedToTrainer
};
