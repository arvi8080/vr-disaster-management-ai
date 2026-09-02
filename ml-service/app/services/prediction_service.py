from app.schemas.training_schema import TrainingSessionInput, PredictionResponse
from app.models.xgboost_model import predictor

def evaluate_training_session(session: TrainingSessionInput) -> PredictionResponse:
    # Compute aggregate reaction time and stress from telemetry events if present
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
