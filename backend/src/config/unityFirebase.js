const { db } = require("./firebase");

function getUnityFirestore() {
    return db;
}

module.exports = {
    getUnityFirestore
};
