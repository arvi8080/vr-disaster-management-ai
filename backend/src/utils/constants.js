const ROLES = {
  TRAINEE: "trainee",
  TRAINER: "trainer",
  ADMIN: "admin"
};

const DISASTER_TYPES = [
    "earthquake",
    "fire",
    "flood",
    "cyclone",
    "buildingCollapse",
    "industrialAccident"
];

const DIFFICULTY_LEVELS = ["easy", "medium", "hard"];

const SESSION_STATUS = {
    CREATED: "created",
    STARTED: "started",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    ABANDONED: "abandoned"
};

const EVENT_TYPES = [
    "SCENARIO_STARTED",
    "PLAYER_MOVED",
    "HAZARD_DETECTED",
    "HAZARD_IGNORED",
    "VICTIM_DETECTED",
    "VICTIM_RESCUED",
    "FIRE_EXTINGUISHED",
    "DOOR_OPENED",
    "WRONG_DECISION",
    "CORRECT_DECISION",
    "SAFETY_VIOLATION",
    "EVACUATION_STARTED",
    "EVACUATION_COMPLETED",
    "OBJECTIVE_COMPLETED",
    "COMMUNICATION_ACTION",
    "TEAMWORK_ACTION",
    "SCENARIO_COMPLETED"
];

const ERROR_CODES = {
    UNAUTHORIZED: "UNAUTHORIZED",
    FORBIDDEN: "FORBIDDEN",
    NOT_FOUND: "NOT_FOUND",
    BAD_REQUEST: "BAD_REQUEST",
    CONFLICT: "CONFLICT",
    TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
    SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE"
};

const SKILL_DIMENSIONS = [
    "decisionMaking",
    "situationalAwareness",
    "safetyAwareness",
    "evacuationSkill",
    "emergencyResponse",
    "communication",
    "teamwork"
];

const SKILL_UPDATE_WEIGHTS = {
    HISTORICAL: 0.7,
    CURRENT: 0.3
};

const TRENDS = {
    IMPROVING: "IMPROVING",
    DECLINING: "DECLINING",
    STABLE: "STABLE"
};

module.exports = {
    ROLES,
    DISASTER_TYPES,
    DIFFICULTY_LEVELS,
    SESSION_STATUS,
    EVENT_TYPES,
    ERROR_CODES,
    SKILL_DIMENSIONS,
    SKILL_UPDATE_WEIGHTS,
    TRENDS
};

