const express = require("express");
const cors = require("cors");
const { db } = require("./config/firebase");
const rateLimitMiddleware = require("./middleware/rateLimitMiddleware");
const { errorMiddleware, notFoundMiddleware } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const scenarioRoutes = require("./routes/scenarioRoutes");
const trainingRoutes = require("./routes/trainingRoutes");
const eventRoutes = require("./routes/eventRoutes");
const skillTwinRoutes = require("./routes/skillTwinRoutes");
const skillRoutes = require("./routes/skillRoutes");
const performanceRoutes = require("./routes/performanceRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/aiRoutes");
const researchRoutes = require("./routes/researchRoutes");

const { swaggerUi, swaggerSpec } = require("./config/swagger");

const app = express();

app.use(cors());
app.use(express.json());
app.use(rateLimitMiddleware);

// Swagger API Documentation UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health & Root Endpoints
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "VR Disaster Training API is running"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "UP",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get("/api/health/firebase", async (req, res) => {
    try {
        const snapshot = await db.collection("system").doc("health").get();
        res.json({
            success: true,
            firebase: true,
            firestore: true,
            exists: snapshot.exists
        });
    } catch (error) {
        console.error("Firestore Error:", error);
        res.status(500).json({
            success: false,
            firebase: false,
            error: error.message
        });
    }
});

// Mount Feature API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/scenarios", scenarioRoutes);
app.use("/api/training", trainingRoutes);
app.use("/api/training", eventRoutes);
app.use("/api/skill-twin", skillTwinRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/research", researchRoutes);

// Global Error & 404 Handlers
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
