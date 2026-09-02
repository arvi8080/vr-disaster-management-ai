const dotenv = require("dotenv");
dotenv.config();

module.exports = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",
    AI_SERVICE_URL: process.env.AI_SERVICE_URL || "http://localhost:8000",
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173"
};

