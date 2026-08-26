const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "VR Disaster Management and Training Platform API",
            version: "1.0.0",
            description: "Production-ready REST API & Research Data Pipeline for VR Disaster Management Training Platform using Digital Skill Twins with AI-Driven Feedback."
        },
        servers: [
            {
                url: "http://localhost:5000",
                description: "Local Development Server"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "FirebaseIDToken",
                    description: "Enter your Firebase ID Token (JWT) acquired from client-side Firebase Auth."
                }
            },
            schemas: {
                ApiResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        message: { type: "string", example: "Operation executed successfully" },
                        data: { type: "object" }
                    }
                },
                ApiError: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: { type: "string", example: "Human readable error description" },
                        errorCode: { type: "string", example: "UNAUTHORIZED" }
                    }
                },
                User: {
                    type: "object",
                    properties: {
                        uid: { type: "string", example: "usr_abc123" },
                        name: { type: "string", example: "John Doe" },
                        email: { type: "string", example: "john@example.com" },
                        role: { type: "string", enum: ["trainee", "trainer", "admin"], example: "trainee" },
                        photoURL: { type: "string", nullable: true, example: "https://example.com/avatar.jpg" },
                        createdAt: { type: "string", example: "2026-08-08T10:00:00Z" },
                        updatedAt: { type: "string", example: "2026-08-08T10:00:00Z" }
                    }
                },
                SkillProfile: {
                    type: "object",
                    properties: {
                        traineeId: { type: "string", example: "user_uid_123" },
                        skills: {
                            type: "object",
                            properties: {
                                decisionMaking: { type: "number", example: 74 },
                                situationalAwareness: { type: "number", example: 84 },
                                safetyAwareness: { type: "number", example: 91 },
                                evacuationSkill: { type: "number", example: 68 },
                                emergencyResponse: { type: "number", example: 76 },
                                communication: { type: "number", example: 80 },
                                teamwork: { type: "number", example: 78 }
                            }
                        },
                        overallScore: { type: "number", example: 79 },
                        trainingCount: { type: "integer", example: 4 },
                        trend: { type: "string", enum: ["IMPROVING", "DECLINING", "STABLE"], example: "IMPROVING" },
                        lastSessionScore: { type: "number", example: 82 },
                        lastUpdated: { type: "string" }
                    }
                },
                ResearchMetrics: {
                    type: "object",
                    properties: {
                        totalSessions: { type: "integer", example: 25 },
                        completedSessions: { type: "integer", example: 20 },
                        averageEvacuationTime: { type: "number", example: 145.5 },
                        averageReactionTime: { type: "number", example: 4.2 },
                        averagePerformanceScore: { type: "number", example: 78.4 },
                        averageSkillImprovement: { type: "number", example: 12.8 },
                        scenarioCompletionRate: { type: "number", example: 80.0 },
                        safetyViolationRate: { type: "number", example: 0.5 },
                        decisionAccuracy: { type: "number", example: 88.5 },
                        timestamp: { type: "string" }
                    }
                }
            }
        },
        paths: {
            "/": {
                get: {
                    summary: "Root Welcome Endpoint",
                    tags: ["Health"],
                    responses: { 200: { description: "API status" } }
                }
            },
            "/api/health": {
                get: {
                    summary: "Server Health Check",
                    tags: ["Health"],
                    responses: { 200: { description: "Server uptime and status" } }
                }
            },
            "/api/health/firebase": {
                get: {
                    summary: "Firebase Firestore Health Check",
                    tags: ["Health"],
                    responses: { 200: { description: "Firebase connectivity status" } }
                }
            },
            "/api/auth/me": {
                get: {
                    summary: "Get Authenticated User Profile",
                    tags: ["Auth"],
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "User profile data" } }
                }
            },
            "/api/users": {
                get: {
                    summary: "List Users (Admin Only)",
                    tags: ["Users"],
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Paginated list of users" } }
                }
            },
            "/api/scenarios": {
                get: {
                    summary: "List Scenarios",
                    tags: ["Scenarios"],
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Scenarios list" } }
                },
                post: {
                    summary: "Create Scenario",
                    tags: ["Scenarios"],
                    security: [{ bearerAuth: [] }],
                    responses: { 201: { description: "Scenario created" } }
                }
            },
            "/api/training/sessions": {
                post: {
                    summary: "Create Training Session",
                    tags: ["Training Sessions"],
                    security: [{ bearerAuth: [] }],
                    responses: { 201: { description: "Session created" } }
                }
            },
            "/api/training/events": {
                post: {
                    summary: "Record Unity VR Telemetry Event",
                    tags: ["Training Events"],
                    security: [{ bearerAuth: [] }],
                    responses: { 201: { description: "Event recorded" } }
                }
            },
            "/api/skill-twin/me": {
                get: {
                    summary: "Get Authenticated Trainee Skill Twin Profile",
                    tags: ["Digital Skill Twin"],
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Skill Twin profile" } }
                }
            },
            "/api/skill-twin/me/history": {
                get: {
                    summary: "Get Logged-in Trainee Skill Evolution History",
                    tags: ["Digital Skill Twin"],
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Skill evolution snapshots" } }
                }
            },
            "/api/skill-twin/me/progress": {
                get: {
                    summary: "Get Trainee Skill Progress & Dimension Trends",
                    tags: ["Digital Skill Twin"],
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Skill progress and trends" } }
                }
            },
            "/api/ai/analyze/{sessionId}": {
                post: {
                    summary: "Trigger Python FastAPI AI Performance Analysis",
                    tags: ["AI Integration"],
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "AI analysis results" } }
                }
            },
            "/api/feedback/me": {
                get: {
                    summary: "Get Trainee Feedback",
                    tags: ["Feedback"],
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Personalized feedback" } }
                }
            },
            "/api/dashboard/trainee": {
                get: {
                    summary: "Get Trainee Dashboard Metrics & Research Pipeline Summary",
                    tags: ["Dashboard"],
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Trainee dashboard payload" } }
                }
            },
            "/api/dashboard/trainer": {
                get: {
                    summary: "Get Trainer Dashboard Metrics & Trainee Trends",
                    tags: ["Dashboard"],
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Trainer dashboard payload" } }
                }
            },
            "/api/research/metrics": {
                get: {
                    summary: "Get Platform-wide Research Evaluation Metrics",
                    tags: ["Research Evaluation"],
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Aggregated research evaluation metrics" } }
                }
            }
        }
    },
    apis: []
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    swaggerSpec
};
