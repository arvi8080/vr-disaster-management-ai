from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TelemetryEventSchema(BaseModel):
    timestamp: str
    event_type: str
    hazard_type: Optional[str] = "General"
    reaction_time_ms: float = Field(default=500.0, ge=0.0)
    decision_correct: bool = True
    stress_level: float = Field(default=0.3, ge=0.0, le=1.0)
    safety_protocol_followed: bool = True

class TrainingSessionInput(BaseModel):
    user_id: str
    scenario_id: str
    scenario_name: str
    duration_seconds: float = Field(default=600.0, ge=0.0)
    telemetry_events: List[TelemetryEventSchema] = []
    hazards_avoided: int = 5
    total_hazards: int = 5
    casualties_rescued: int = 3
    protocol_violations: int = 0

class PredictionResponse(BaseModel):
    predicted_score: float
    performance_category: str  # EXCELLENT, PASSED, NEEDS_IMPROVEMENT, CRITICAL_FAIL
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
