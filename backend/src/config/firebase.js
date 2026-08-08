const { initializeApp, cert, getApp, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = require("../../firebase-service-account.json");

const app = getApps().length === 0 ? initializeApp({
    credential: cert(serviceAccount)
}) : getApp();

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

module.exports = {
    app,
    db,
    auth,
    storage
};