from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TelemetryEventSchema(BaseModel):
    timestamp: str = ""
    event_type: str = "general"
    hazard_type: Optional[str] = "General"
    reaction_time_ms: float = Field(default=500.0, ge=0.0)
    decision_correct: bool = True
    stress_level: float = Field(default=0.3, ge=0.0, le=1.0)
    safety_protocol_followed: bool = True

class TrainingSessionInput(BaseModel):
    user_id: str = "trainee-01"
    scenario_id: str = "SESS-01"
    scenario_name: str = "Disaster Response Simulation"
    duration_seconds: float = Field(default=600.0, ge=0.0)
    telemetry_events: List[TelemetryEventSchema] = []
    hazards_avoided: int = 5
    total_hazards: int = 5
    casualties_rescued: int = 3
    protocol_violations: int = 0

class PredictionResponse(BaseModel):
    predicted_score: float
    performance_category: str
    pass_probability: float
    risk_assessment: str
    recommended_focus_area: str
    metrics: Dict[str, float]

class SkillAnalysisInput(BaseModel):
    user_id: str
    historical_sessions: List[TrainingSessionInput] = []

class SkillTwinMetrics(BaseModel):
    reflexes: float
    tactical_awareness: float
    hazard_mitigation: float
    stress_resilience: float
    protocol_compliance: float
    overall_readiness: float

class SkillAnalysisResponse(BaseModel):
    user_id: str
    overall_readiness: float
    skill_metrics: SkillTwinMetrics
    strengths: List[str]
    weaknesses: List[str]
    ai_recommendations: List[str]

class PerformanceFeatures(BaseModel):
    evacuationTime: float = 0
    averageReactionTime: float = 5.0
    wrongDecisions: int = 0
    correctDecisions: int = 0
    safetyViolations: int = 0
    hazardsDetected: int = 0
    hazardsIgnored: int = 0
    victimsRescued: int = 0
    objectivesCompleted: int = 0

class AnalyzeRequest(BaseModel):
    traineeId: Optional[str] = "trainee-01"
    sessionId: Optional[str] = "session-01"
    currentSkills: Dict[str, Any] = Field(default_factory=dict)
    performanceFeatures: Optional[PerformanceFeatures] = Field(default_factory=PerformanceFeatures)

class AnalyzeResponse(BaseModel):
    performanceScore: float
    riskLevel: str
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    skillPredictions: Dict[str, float]
    modelVersion: str
