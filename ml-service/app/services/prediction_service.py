from app.schemas.training_schema import TrainingSessionInput, PredictionResponse, AnalyzeResponse
from app.models.xgboost_model import predictor


def _get_value(source, key, default=None):
    if source is None:
        return default
    if isinstance(source, dict):
        return source.get(key, source.get(key.replace("_", ""), default))
    if hasattr(source, key):
        return getattr(source, key)
    snake_key = key.replace("_", "")
    if hasattr(source, snake_key):
        return getattr(source, snake_key)
    return default


def evaluate_training_session(session: TrainingSessionInput) -> PredictionResponse:
    if session.telemetry_events:
        avg_reaction = (
            sum(e.reaction_time_ms for e in session.telemetry_events)
            / len(session.telemetry_events)
        )
        avg_stress = (
            sum(e.stress_level for e in session.telemetry_events)
            / len(session.telemetry_events)
        )
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
    if pf is None and isinstance(payload, dict):
        pf = payload.get("performanceFeatures", {})
    if pf is None:
        pf = {}

    # Support both dict-style payloads and Pydantic models from FastAPI/JSON.
    evacuation_time = _get_value(pf, "evacuationTime", _get_value(pf, "evacuation_time", 0.0))
    reaction_time = _get_value(pf, "averageReactionTime", _get_value(pf, "average_reaction_time", 5.0))
    correct = _get_value(pf, "correctDecisions", _get_value(pf, "correct_decisions", 0))
    wrong = _get_value(pf, "wrongDecisions", _get_value(pf, "wrong_decisions", 0))
    violations = _get_value(pf, "safetyViolations", _get_value(pf, "safety_violations", 0))
    hazards_detected = _get_value(pf, "hazardsDetected", _get_value(pf, "hazards_detected", 0))
    rescued = _get_value(pf, "victimsRescued", _get_value(pf, "victims_rescued", 0))
    objectives = _get_value(pf, "objectivesCompleted", _get_value(pf, "objectives_completed", 0))

    # Unity currently does not provide a true evacuation time.
    # Backend may pass totalResponseTime as a documented proxy.
    total_hazards = hazards_detected

    pred = predictor.predict(
        duration_sec=evacuation_time,
        hazards_avoided=correct,
        total_hazards=total_hazards,
        casualties_rescued=rescued,
        protocol_violations=violations,
        avg_reaction_time_ms=reaction_time,
        avg_stress=0.25
    )

    strengths = []
    weaknesses = []

    # Only describe information actually available.
    if objectives > 0:
        strengths.append(
            f"Completed {objectives} recorded training objectives."
        )

    if correct > 0:
        strengths.append(
            f"Recorded {correct} correct decision(s)."
        )

    if rescued > 0:
        strengths.append(
            f"Successfully rescued {rescued} recorded victim(s)."
        )

    if violations > 0:
        weaknesses.append(
            f"Recorded {violations} safety/procedure violation(s)."
        )

    if wrong > 0:
        weaknesses.append(
            f"Recorded {wrong} incorrect decision(s)."
        )

    # Do not invent strengths/weaknesses when telemetry is unavailable.
    if not strengths:
        strengths.append(
            "No additional strengths could be established from the available Unity telemetry."
        )

    if not weaknesses:
        weaknesses.append(
            "No additional weaknesses could be established from the available Unity telemetry."
        )

    return AnalyzeResponse(
        performanceScore=pred["predicted_score"],
        riskLevel=pred["risk_assessment"],
        strengths=strengths,
        weaknesses=weaknesses,
        recommendations=[pred["recommended_focus_area"]],
        skillPredictions=pred["metrics"],
        modelVersion="v1.0-xgboost-trained"
    )