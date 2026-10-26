const { initializeApp, cert, getApp, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const { getAuth } = require("firebase-admin/auth");

require("dotenv").config();

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    serviceAccount = require("../../firebase-service-account.json");
}

const app = getApps().length === 0
    ? initializeApp({
        credential: cert(serviceAccount)
    })
    : getApp();

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

module.exports = {
    app,
    db,
    auth,
    storage
};