# VR Disaster Management & Training Platform - Backend API

Production-ready Node.js + Express backend service for a real-world **VR Disaster Management and Training Platform Using Digital Skill Twins with AI-Driven Feedback**.

---

## 🛠️ Tech Stack & Architecture

- **Runtime**: Node.js (CommonJS)
- **Framework**: Express.js
- **Database**: Cloud Firestore (Firebase Admin SDK)
- **Authentication**: Firebase Authentication (Bearer ID Tokens)
- **Storage**: Firebase Storage
- **AI Integration**: REST Client to Python FastAPI AI/ML Service
- **Testing**: Native Node.js Test Runner

```
+------------------+         +----------------------------+
| Unity VR Client  | ------> |                            |
+------------------+         |                            |
                             |  Node.js + Express Backend | ----> Firebase Auth
+------------------+         |   - Controllers            | ----> Cloud Firestore
| React Dashboard  | ------> |   - Services               | ----> Firebase Storage
+------------------+         |   - Middleware             | ----> Python FastAPI AI
                             |   - Skill Twin Engine      |
                             +----------------------------+
```

---

## 📁 Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── firebase.js          # Firebase Admin SDK, Firestore, Auth & Storage init
│   │   └── env.js               # Validated environment configuration
│   ├── controllers/
│   │   ├── authController.js    # /api/auth endpoints
│   │   ├── userController.js    # User management & profile CRUD
│   │   ├── scenarioController.js# Training scenario management
│   │   ├── trainingController.js# Session state & metrics
│   │   ├── eventController.js   # Unity VR telemetry events
│   │   ├── skillTwinController.js# Digital Skill Twin profile management
│   │   ├── feedbackController.js# AI & trainer feedback
│   │   ├── dashboardController.js# Trainee, trainer & admin metrics
│   │   └── adminController.js   # System administration
│   ├── services/
│   │   ├── userService.js       # Firestore user operations
│   │   ├── scenarioService.js   # Scenario collection service
│   │   ├── trainingService.js   # Session lifecycle & performance calculation
│   │   ├── eventService.js      # Unity event recording & retrieval
│   │   ├── skillTwinService.js  # Exponential Moving Average skill updater
│   │   ├── feedbackService.js   # Feedback collection operations
│   │   ├── aiService.js         # FastAPI REST service integration
│   │   └── storageService.js    # Firebase Storage service
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── scenarioRoutes.js
│   │   ├── trainingRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── skillTwinRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── adminRoutes.js
│   │   └── aiRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js    # Firebase ID token verification & user auto-provisioning
│   │   ├── roleMiddleware.js    # RBAC (trainee, trainer, admin)
│   │   ├── errorMiddleware.js   # Centralized error handler
│   │   ├── validationMiddleware.js# Input validation wrapper
│   │   └── rateLimitMiddleware.js# Rate limiting safeguard
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── scenarioValidator.js
│   │   ├── trainingValidator.js
│   │   └── eventValidator.js
│   ├── utils/
│   │   ├── response.js          # Standardized API response formatters
│   │   ├── logger.js            # Structured logger
│   │   ├── constants.js         # Roles, disaster types, event types
│   │   └── pagination.js        # Firestore offset pagination helper
│   ├── app.js                   # Express application setup
│   └── server.js                # Server entry point
├── tests/
│   ├── auth.test.js
│   ├── scenario.test.js
│   ├── training.test.js
│   └── skillTwin.test.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Place your `firebase-service-account.json` in the `backend/` directory root.
   *(This file is git-ignored for security)*

3. Configure `.env` variables:
   ```env
   PORT=5000
   NODE_ENV=development
   AI_SERVICE_URL=http://localhost:8000
   CLIENT_URL=http://localhost:5173
   ```

---

## 🚀 Installation & Running

```bash
# Install dependencies
npm install

# Start production server
npm start

# Start development server (with auto-reload)
npm run dev

# Run automated tests
npm test
```

---

## 🔑 Authentication & RBAC

All protected endpoints expect a Firebase Auth Bearer Token in the request header:
```http
Authorization: Bearer <Firebase_ID_TOKEN>
```

### Roles Supported:
- **`trainee`**: Can access own sessions, telemetry event posting, skill twin profile, feedback, and trainee dashboard.
- **`trainer`**: Can create/manage scenarios, inspect all trainees, and view trainer dashboard.
- **`admin`**: Full system administration privileges (managing users, system statistics, and all resources).

---

## 📊 Cloud Firestore Collections

- **`users/{uid}`**: `{ uid, name, email, role, photoURL, createdAt, updatedAt }`
- **`scenarios/{scenarioId}`**: `{ title, description, disasterType, difficulty, duration, objectives, active, createdBy, createdAt }`
- **`trainingSessions/{sessionId}`**: `{ traineeId, scenarioId, status, startedAt, completedAt, duration, score, evacuationTime, mistakes, actionsCompleted }`
- **`trainingEvents/{eventId}`**: `{ sessionId, traineeId, eventType, timestamp, location, metadata, createdAt }`
- **`skillProfiles/{traineeId}`**: `{ traineeId, decisionMaking, situationalAwareness, communication, safetyAwareness, evacuationSkill, teamwork, emergencyResponse, overallScore, trainingCount, lastUpdated }`
- **`aiAnalysis/{analysisId}`**: `{ traineeId, sessionId, riskLevel, performanceScore, strengths, weaknesses, recommendations, modelVersion, createdAt }`
- **`feedback/{feedbackId}`**: `{ traineeId, sessionId, type, message, recommendations, strengths, weaknesses, riskLevel, createdAt }`

---

## 🎮 Unity VR Integration Guide

### Base URL:
`http://localhost:5000/api`

### Headers Required:
```http
Authorization: Bearer <Firebase_ID_TOKEN>
Content-Type: application/json
```

### 1. Start Training Session
- **Endpoint**: `POST /training/sessions`
- **Body**:
  ```json
  {
    "scenarioId": "SCENARIO_DOC_ID"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "session123",
      "status": "created",
      "scenarioId": "SCENARIO_DOC_ID"
    }
  }
  ```

- **Endpoint**: `POST /training/sessions/session123/start`

### 2. Send VR Telemetry Events
- **Endpoint**: `POST /training/events`
- **Body**:
  ```json
  {
    "sessionId": "session123",
    "eventType": "VICTIM_RESCUED",
    "timestamp": "2026-08-08T10:30:00Z",
    "location": { "x": 10.5, "y": 1.2, "z": 5.0 },
    "metadata": { "victimId": "victim_01" }
  }
  ```
- **Supported Event Types**:
  `SCENARIO_STARTED`, `PLAYER_MOVED`, `HAZARD_DETECTED`, `VICTIM_DETECTED`, `VICTIM_RESCUED`, `FIRE_EXTINGUISHED`, `DOOR_OPENED`, `WRONG_DECISION`, `SAFETY_VIOLATION`, `EVACUATION_STARTED`, `EVACUATION_COMPLETED`, `SCENARIO_COMPLETED`.

### 3. Complete Training Session
- **Endpoint**: `POST /training/sessions/session123/complete`
- **Response**: Calculates performance metrics, updates status to `completed`, and triggers Digital Skill Twin profile recalculation.

---

## 💻 React Frontend Integration Guide

- **`GET /api/auth/me`**: Fetch current user profile.
- **`GET /api/dashboard/trainee`**: Trainee stats, scores, skill profile summary, and trend data.
- **`GET /api/dashboard/trainer`**: Trainer metrics, at-risk trainees, and recent sessions.
- **`GET /api/skill-twin/me`**: Fetch logged-in user's Digital Skill Twin.
- **`GET /api/feedback/me`**: Fetch AI feedback and recommendations.
- **`GET /api/scenarios`**: List disaster scenarios with filters (`?disasterType=earthquake&difficulty=medium`).

---

## 🤖 Python FastAPI AI Integration

- Trigger AI session analysis via: `POST /api/ai/analyze/:sessionId`
- Node.js fetches session data, events, and skill profile, then sends POST to `${AI_SERVICE_URL}/analyze`.
- If the AI service is unreachable, a 503 error is returned without fabricating results.

---

## 🧪 Testing

Execute automated unit tests covering auth middleware, role checking, scenario CRUD, session calculation, and skill twin updates:

```bash
npm test
```

---

## 🔒 Security Practices

- Token verification via Firebase Admin SDK.
- Firestore user profile role enforcement on every request.
- Centralized error handling preventing stack trace leaks.
- Strict request validation rejecting malformed inputs.
- In-memory rate limiting to prevent DDoS.
- Credentials and service account keys are git-ignored.
