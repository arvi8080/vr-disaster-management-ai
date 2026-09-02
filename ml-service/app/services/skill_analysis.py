from app.schemas.training_schema import SkillAnalysisInput, SkillAnalysisResponse, SkillTwinMetrics

def analyze_digital_skill_twin(input_data: SkillAnalysisInput) -> SkillAnalysisResponse:
    sessions = input_data.historical_sessions

    if not sessions:
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

def calculate_skills(features):
    correct = getattr(features, "correctDecisions", 8)
    wrong = getattr(features, "wrongDecisions", 1)
    total_decisions = correct + wrong
    decision_accuracy = round((correct / total_decisions) * 100) if total_decisions > 0 else 100

    decision_making = max(0, min(100, decision_accuracy - (wrong * 5 if wrong > 2 else 0)))
    situational_awareness = max(0, min(100, 60 + (getattr(features, "hazardsDetected", 5) * 10) - (getattr(features, "hazardsIgnored", 0) * 15)))
    safety_awareness = max(0, min(100, 100 - (getattr(features, "safetyViolations", 0) * 20)))
    evacuation_skill = max(0, min(100, 85 + (15 if 0 < getattr(features, "evacuationTime", 120) < 180 else (-15 if getattr(features, "evacuationTime", 120) > 300 else 0))))
    emergency_response = max(0, min(100, 50 + (getattr(features, "victimsRescued", 3) * 20) + (getattr(features, "objectivesCompleted", 4) * 10)))

    skills = {
        "decisionMaking": decision_making,
        "situationalAwareness": situational_awareness,
        "safetyAwareness": safety_awareness,
        "evacuationSkill": evacuation_skill,
        "emergencyResponse": emergency_response,
        "communication": 85,
        "teamwork": 90,
    }
    overall_score = round(sum(skills.values()) / len(skills))
    return skills, overall_score

def generate_analysis(skills, score, features):
    strengths = [k for k, v in skills.items() if v >= 75]
    weaknesses = [k for k, v in skills.items() if v < 50]
    recommendations = ["Maintain continuous hazard scanning and protocol compliance."]
    risk_level = "LOW" if score >= 80 else ("MEDIUM" if score >= 60 else "HIGH")
    return risk_level, strengths, weaknesses, recommendations
