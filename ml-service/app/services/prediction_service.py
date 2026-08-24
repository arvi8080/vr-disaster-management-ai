from app.models.xgboost_model import xgboost_model

from app.services.skill_analysis import (
    calculate_skills,
    generate_analysis,
)


def analyze(payload):

    features = payload.performanceFeatures

    model_features = [
        features.evacuationTime,
        features.averageReactionTime,
        features.wrongDecisions,
        features.correctDecisions,
        features.safetyViolations,
        features.hazardsDetected,
        features.hazardsIgnored,
        features.victimsRescued,
        features.objectivesCompleted,
    ]

    # XGBoost prediction
    performance_score = xgboost_model.predict(
        model_features
    )

    # Keep score within valid range
    performance_score = max(
        0,
        min(100, performance_score)
    )

    performance_score = round(
        performance_score,
        2
    )

    # Skill analysis
    skills, _ = calculate_skills(features)

    (
        risk_level,
        strengths,
        weaknesses,
        recommendations,
    ) = generate_analysis(
        skills,
        performance_score,
        features,
    )

    return {
        "performanceScore": performance_score,
        "riskLevel": risk_level,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "skillPredictions": skills,
        "modelVersion": "xgboost-v1.0",
    }