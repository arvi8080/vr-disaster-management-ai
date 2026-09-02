from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.schemas.training_schema import (
    TrainingSessionInput,
    PredictionResponse,
    SkillAnalysisInput,
    SkillAnalysisResponse
)
from app.services.prediction_service import evaluate_training_session
from app.services.skill_analysis import analyze_digital_skill_twin

router = APIRouter(prefix="", tags=["ML Predictions & Skill Twin"])

class DirectAnalyzePayload(BaseModel):
    traineeId: Optional[str] = "trainee-01"
    sessionId: Optional[str] = "session-01"
    currentSkills: Optional[Dict[str, Any]] = {}
    performanceFeatures: Optional[Dict[str, Any]] = {}

@router.post("/analyze")
async def analyze_session_direct(payload: DirectAnalyzePayload):
    try:
        pf = payload.performanceFeatures or {}
        correct = pf.get("correctDecisions", 8)
        wrong = pf.get("wrongDecisions", 1)
        total_hazards = pf.get("hazardsDetected", correct + wrong)
        violations = pf.get("safetyViolations", 0)
        rescued = pf.get("victimsRescued", 3)
        duration = pf.get("evacuationTime", 300)

        session = TrainingSessionInput(
            user_id=payload.traineeId or "trainee-01",
            scenario_id=payload.sessionId or "SESS-01",
            scenario_name="Disaster Response Simulation",
            duration_seconds=duration,
            hazards_avoided=correct,
            total_hazards=total_hazards,
            casualties_rescued=rescued,
            protocol_violations=violations
        )

        pred = evaluate_training_session(session)

        return {
            "performanceScore": pred.predicted_score,
            "riskLevel": pred.risk_assessment,
            "strengths": [
                "High structural hazard detection efficiency",
                "Strict adherence to emergency evacuation protocols",
                "Rapid team coordination under simulated pressure"
            ],
            "weaknesses": [
                "Chemical foam isolation response latency"
            ],
            "recommendations": [
                "Practice hazmat chemical containment speed drills",
                "Maintain continuous thermal imaging contact"
            ],
            "skillPredictions": pred.metrics,
            "modelVersion": "v1.0-xgboost-trained"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@router.post("/api/ml/predict", response_model=PredictionResponse)
async def predict_performance(session: TrainingSessionInput):
    try:
        return evaluate_training_session(session)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.post("/api/ml/analyze-skills", response_model=SkillAnalysisResponse)
async def analyze_skills(input_data: SkillAnalysisInput):
    try:
        return analyze_digital_skill_twin(input_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill analysis error: {str(e)}")
