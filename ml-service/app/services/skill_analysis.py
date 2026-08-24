def calculate_skills(features):
    correct = features.correctDecisions
    wrong = features.wrongDecisions

    total_decisions = correct + wrong

    # Decision accuracy
    if total_decisions > 0:
        decision_accuracy = round(
            (correct / total_decisions) * 100
        )
    else:
        decision_accuracy = 100

    # 1. Decision Making
    decision_making = decision_accuracy

    if wrong > 2:
        decision_making -= wrong * 5

    decision_making = max(
        0, min(100, decision_making)
    )

    # 2. Situational Awareness
    situational_awareness = 60

    situational_awareness += (
        features.hazardsDetected * 10
    )

    situational_awareness -= (
        features.hazardsIgnored * 15
    )

    if features.averageReactionTime < 3.0:
        situational_awareness += 15

    situational_awareness = max(
        0,
        min(100, situational_awareness)
    )

    # 3. Safety Awareness
    safety_awareness = 100 - (
        features.safetyViolations * 20
    )

    safety_awareness = max(
        0,
        min(100, safety_awareness)
    )

    # 4. Evacuation Skill
    evacuation_skill = 85

    if (
        features.evacuationTime > 0
        and features.evacuationTime < 180
    ):
        evacuation_skill += 15

    elif features.evacuationTime > 300:
        evacuation_skill -= 15

    evacuation_skill = max(
        0,
        min(100, evacuation_skill)
    )

    # 5. Emergency Response
    emergency_response = 50

    emergency_response += (
        features.victimsRescued * 20
    )

    emergency_response += (
        features.objectivesCompleted * 10
    )

    if features.averageReactionTime < 4.0:
        emergency_response += 10

    emergency_response = max(
        0,
        min(100, emergency_response)
    )

    # Communication and teamwork
    # The current backend payload does not send
    # communicationActions or teamworkActions.
    communication = 50
    teamwork = 50

    skills = {
        "decisionMaking": round(decision_making),
        "situationalAwareness": round(
            situational_awareness
        ),
        "safetyAwareness": round(
            safety_awareness
        ),
        "evacuationSkill": round(
            evacuation_skill
        ),
        "emergencyResponse": round(
            emergency_response
        ),
        "communication": communication,
        "teamwork": teamwork,
    }

    overall_score = round(
        sum(skills.values()) / len(skills)
    )

    return skills, overall_score


def generate_analysis(
    skills,
    score,
    features
):
    strengths = []
    weaknesses = []
    recommendations = []

    # Identify strengths and weaknesses
    for skill, value in skills.items():

        skill_names = {
            "decisionMaking": "Decision Making",
            "situationalAwareness": "Situational Awareness",
            "safetyAwareness": "Safety Awareness",
            "evacuationSkill": "Evacuation Skill",
            "emergencyResponse": "Emergency Response",
            "communication": "Communication",
            "teamwork": "Teamwork",
        }

        name = skill_names.get(skill, skill)

        if value >= 75:
            strengths.append(name)

        elif value < 50:
            weaknesses.append(name)

    # Recommendations
    if features.safetyViolations > 0:
        recommendations.append(
            "Improve safety awareness and avoid safety violations."
        )

    if features.hazardsIgnored > 0:
        recommendations.append(
            "Improve hazard detection and response."
        )

    if features.wrongDecisions > 0:
        recommendations.append(
            "Practice decision-making during emergency scenarios."
        )

    if features.averageReactionTime >= 4:
        recommendations.append(
            "Improve reaction time to emergency events."
        )

    if features.evacuationTime > 300:
        recommendations.append(
            "Practice faster and more efficient evacuation."
        )

    if not recommendations:
        recommendations.append(
            "Continue practicing to maintain strong performance."
        )

    # Risk level
    if score >= 80:
        risk_level = "LOW"

    elif score >= 60:
        risk_level = "MEDIUM"

    else:
        risk_level = "HIGH"

    return (
        risk_level,
        strengths,
        weaknesses,
        recommendations,
    )