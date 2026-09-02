from app.schemas.training_schema import SkillAnalysisInput, SkillAnalysisResponse, SkillTwinMetrics

def analyze_digital_skill_twin(input_data: SkillAnalysisInput) -> SkillAnalysisResponse:
    sessions = input_data.historical_sessions

    if not sessions:
        # Default baseline skill twin metrics
        metrics = SkillTwinMetrics(
            reflexes=88.0,
            tactical_awareness=92.5,
            hazard_mitigation=94.0,
            stress_resilience=86.5,
            protocol_compliance=95.0,
            overall_readiness=91.2
        )
        strengths = [
            "Rapid hazard detection in earthquake scenarios",
            "High compliance with evacuation safety protocols",
            "Effective civilian extraction speed"
        ]
        weaknesses = [
            "Hazmat foam deployment latency",
            "Slight stress elevated during secondary tremors"
        ]
        recommendations = [
            "Practice chemical isolation drills to improve reaction time by 15%",
            "Participate in multi-hazard simultaneous stress simulations"
        ]
    else:
        avg_hazards = sum(s.hazards_avoided / max(s.total_hazards, 1) for s in sessions) / len(sessions)
        avg_rescues = sum(min(s.casualties_rescued / 3.0, 1.0) for s in sessions) / len(sessions)
        avg_protocols = sum(max(1.0 - (s.protocol_violations * 0.2), 0.0) for s in sessions) / len(sessions)

        reflexes = round(float(avg_hazards * 100), 1)
        tactical = round(float(avg_rescues * 100), 1)
        compliance = round(float(avg_protocols * 100), 1)
        resilience = 88.0
        mitigation = round(float((reflexes + compliance) / 2.0), 1)
        overall = round(float((reflexes + tactical + compliance + resilience + mitigation) / 5.0), 1)

        metrics = SkillTwinMetrics(
            reflexes=reflexes,
            tactical_awareness=tactical,
            hazard_mitigation=mitigation,
            stress_resilience=resilience,
            protocol_compliance=compliance,
            overall_readiness=overall
        )
        strengths = ["Strong overall protocol compliance", "Effective decision speed"]
        weaknesses = ["Secondary hazard reaction under extreme stress"]
        recommendations = ["Continue advanced VR disaster scenario simulations"]

    return SkillAnalysisResponse(
        user_id=input_data.user_id,
        overall_readiness=metrics.overall_readiness,
        skill_metrics=metrics,
        strengths=strengths,
        weaknesses=weaknesses,
        ai_recommendations=recommendations
    )
