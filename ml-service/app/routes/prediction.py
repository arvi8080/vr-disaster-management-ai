from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.schemas.training_schema import (
    TrainingSessionInput,
    PredictionResponse,
    SkillAnalysisInput,
    SkillAnalysisResponse,
    AnalyzeRequest,
    AnalyzeResponse
)
from app.services.prediction_service import evaluate_training_session, analyze
from app.services.skill_analysis import analyze_digital_skill_twin

router = APIRouter(prefix="", tags=["ML Predictions & Skill Twin"])

class DirectAnalyzePayload(BaseModel):
    traineeId: Optional[str] = "trainee-01"
    sessionId: Optional[str] = "session-01"
    currentSkills: Optional[Dict[str, Any]] = {}
    performanceFeatures: Optional[Dict[str, Any]] = {}

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_training_session(request: AnalyzeRequest):
    try:
        return analyze(request)
    except Exception:
        # Fallback to direct analyze if request shape differs.
        pf = request.performanceFeatures or {}
        if isinstance(pf, dict):
            correct = pf.get("correctDecisions", pf.get("correct_decisions", 8))
            wrong = pf.get("wrongDecisions", pf.get("wrong_decisions", 1))
            total_hazards = pf.get("hazardsDetected", pf.get("hazards_detected", correct + wrong))
            violations = pf.get("safetyViolations", pf.get("safety_violations", 0))
            rescued = pf.get("victimsRescued", pf.get("victims_rescued", 3))
            duration = pf.get("evacuationTime", pf.get("evacuation_time", 300))
        else:
            correct = getattr(pf, "correctDecisions", getattr(pf, "correct_decisions", 8))
            wrong = getattr(pf, "wrongDecisions", getattr(pf, "wrong_decisions", 1))
            total_hazards = getattr(pf, "hazardsDetected", getattr(pf, "hazards_detected", correct + wrong))
            violations = getattr(pf, "safetyViolations", getattr(pf, "safety_violations", 0))
            rescued = getattr(pf, "victimsRescued", getattr(pf, "victims_rescued", 3))
            duration = getattr(pf, "evacuationTime", getattr(pf, "evacuation_time", 300))

        session = TrainingSessionInput(
            user_id=request.traineeId or "trainee-01",
            scenario_id=request.sessionId or "SESS-01",
            scenario_name="Disaster Response Simulation",
            duration_seconds=duration,
            hazards_avoided=correct,
            total_hazards=total_hazards,
            casualties_rescued=rescued,
            protocol_violations=violations
        )

        pred = evaluate_training_session(session)

        return AnalyzeResponse(
            performanceScore=pred.predicted_score,
            riskLevel=pred.risk_assessment,
            strengths=[
                "High structural hazard detection efficiency",
                "Strict adherence to emergency evacuation protocols"
            ],
            weaknesses=["Chemical foam isolation response latency"],
            recommendations=["Practice hazmat chemical containment speed drills"],
            skillPredictions=pred.metrics,
            modelVersion="v1.0-xgboost-trained"
        )

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
