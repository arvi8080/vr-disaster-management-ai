const { auth, db } = require("../config/firebase");
const { FieldValue } = require("firebase-admin/firestore");
const { sendError } = require("../utils/response");
const { ERROR_CODES, ROLES } = require("../utils/constants");
const logger = require("../utils/logger");

async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendError(res, "Authentication required", ERROR_CODES.UNAUTHORIZED, 401);
        }

        const idToken = authHeader.split("Bearer ")[1].trim();
        if (!idToken) {
            return sendError(res, "Authentication token missing", ERROR_CODES.UNAUTHORIZED, 401);
        }

        let decodedToken;
        try {
            decodedToken = await auth.verifyIdToken(idToken);
        } catch (tokenError) {
            logger.warn("Token verification failed", { error: tokenError.message });
            return sendError(res, "Invalid or expired authentication token", ERROR_CODES.UNAUTHORIZED, 401);
        }

        const { uid, email, name, picture } = decodedToken;

        // Fetch Firestore user doc
        const userDocRef = db.collection("users").doc(uid);
        let userDoc = await userDocRef.get();

        let userData;
        if (!userDoc.exists) {
            // Auto-provision user doc in Firestore upon first authentication
            userData = {
                uid,
                name: name || (email ? email.split("@")[0] : "Trainee"),
                email: email || "",
                role: ROLES.TRAINEE,
                photoURL: picture || null,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
            };
            await userDocRef.set(userData);
            logger.info(`Auto-created Firestore profile for user ${uid}`);
        } else {
            userData = userDoc.data();
        }

        // Attach user info to req.user
        req.user = {
            uid,
            email: userData.email,
            role: userData.role || ROLES.TRAINEE,
            name: userData.name,
            photoURL: userData.photoURL || null
        };

        next();
    } catch (error) {
        logger.error("Error in authMiddleware", { error: error.message });
        return sendError(res, "Internal authentication error", ERROR_CODES.INTERNAL_SERVER_ERROR, 500);
    }
}

module.exports = authMiddleware;

