from app.schemas.training_schema import TrainingSessionInput, PredictionResponse, AnalyzeResponse
from app.models.xgboost_model import predictor

def evaluate_training_session(session: TrainingSessionInput) -> PredictionResponse:
    if session.telemetry_events:
        avg_reaction = sum(e.reaction_time_ms for e in session.telemetry_events) / len(session.telemetry_events)
        avg_stress = sum(e.stress_level for e in session.telemetry_events) / len(session.telemetry_events)
    else:
        avg_reaction = 450.0
        avg_stress = 0.25

    result = predictor.predict(
        duration_sec=session.duration_seconds,
        hazards_avoided=session.hazards_avoided,
        total_hazards=session.total_hazards,
        casualties_rescued=session.casualties_rescued,
        protocol_violations=session.protocol_violations,
        avg_reaction_time_ms=avg_reaction,
        avg_stress=avg_stress
    )

    return PredictionResponse(**result)

def analyze(payload) -> AnalyzeResponse:
    pf = getattr(payload, "performanceFeatures", None)
    
    evacuation_time = getattr(pf, "evacuationTime", 300.0) if pf else 300.0
    reaction_time = getattr(pf, "averageReactionTime", 450.0) if pf else 450.0
    correct = getattr(pf, "correctDecisions", 8) if pf else 8
    wrong = getattr(pf, "wrongDecisions", 1) if pf else 1
    violations = getattr(pf, "safetyViolations", 0) if pf else 0
    rescued = getattr(pf, "victimsRescued", 3) if pf else 3
    total_hazards = getattr(pf, "hazardsDetected", correct + wrong) if pf else (correct + wrong)

    pred = predictor.predict(
        duration_sec=evacuation_time,
        hazards_avoided=correct,
        total_hazards=total_hazards,
        casualties_rescued=rescued,
        protocol_violations=violations,
        avg_reaction_time_ms=reaction_time,
        avg_stress=0.25
    )

    return AnalyzeResponse(
        performanceScore=pred["predicted_score"],
        riskLevel=pred["risk_assessment"],
        strengths=[
            "High structural hazard detection efficiency",
            "Strict adherence to emergency evacuation protocols"
        ],
        weaknesses=["Chemical foam isolation response latency"],
        recommendations=["Practice hazmat chemical containment speed drills"],
        skillPredictions=pred["metrics"],
        modelVersion="v1.0-xgboost-trained"
    )
