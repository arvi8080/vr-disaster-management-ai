from typing import Dict, Any
from pydantic import BaseModel, Field


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
    traineeId: str
    sessionId: str
    currentSkills: Dict[str, Any] = Field(default_factory=dict)
    performanceFeatures: PerformanceFeatures


class AnalyzeResponse(BaseModel):
    performanceScore: float
    riskLevel: str
    strengths: list[str]
    weaknesses: list[str]
    recommendations: list[str]
    skillPredictions: Dict[str, float]
    modelVersion: str