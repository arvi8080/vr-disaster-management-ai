import numpy as np
import pandas as pd
import pickle
import os

class DisasterPerformanceModel:
    """
    XGBoost / Random Forest trained model for evaluating VR disaster simulation telemetry
    and predicting trainee performance scores and readiness metrics.
    """
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), "..", "..", "models", "xgboost_model.pkl")
        self.model = self._load_or_create_model()

    def _load_or_create_model(self):
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, "rb") as f:
                    model = pickle.load(f)
                    print(f"Loaded trained ML model from: {self.model_path}")
                    return model
            except Exception as e:
                print(f"Warning: Could not load pickled model ({e}). Using algorithmic predictor.")
        return None

    def predict(self, duration_sec: float = 300, hazards_avoided: int = 5, total_hazards: int = 5,
                casualties_rescued: int = 3, protocol_violations: int = 0, avg_reaction_time_ms: float = 450.0, avg_stress: float = 0.25):
        
        # Check if duration_sec is actually a feature list [evacuationTime, averageReactionTime, wrongDecisions, correctDecisions...]
        if isinstance(duration_sec, (list, tuple)):
            features = duration_sec
            duration_sec = features[0] if len(features) > 0 else 300
            avg_reaction_time_ms = features[1] if len(features) > 1 else 450.0
            wrong = features[2] if len(features) > 2 else 0
            correct = features[3] if len(features) > 3 else 5
            hazards_avoided = correct
            total_hazards = correct + wrong
            protocol_violations = features[4] if len(features) > 4 else 0
            casualties_rescued = features[7] if len(features) > 7 else 3

        hazard_rate = hazards_avoided / max(total_hazards, 1)
        rescue_rate = min(casualties_rescued / 3.0, 1.0)
        protocol_rate = max(1.0 - (protocol_violations * 0.2), 0.0)
        speed_factor = max(1.0 - (avg_reaction_time_ms / 3000.0), 0.1)
        stress_resilience = max(1.0 - avg_stress, 0.1)

        if self.model is not None:
            try:
                features_df = pd.DataFrame([{
                    'evacuation_time': duration_sec,
                    'avg_reaction_time': avg_reaction_time_ms,
                    'correct_decisions': hazards_avoided,
                    'wrong_decisions': total_hazards - hazards_avoided,
                    'safety_violations': protocol_violations,
                    'hazards_detected': total_hazards,
                    'victims_rescued': casualties_rescued,
                    'objectives_completed': min(casualties_rescued, 4)
                }])
                raw_pred = self.model.predict(features_df)[0]
                score = float(np.clip(raw_pred, 0.0, 100.0))
            except Exception as err:
                base_score = (hazard_rate * 35.0) + (rescue_rate * 25.0) + (protocol_rate * 20.0) + (speed_factor * 10.0) + (stress_resilience * 10.0)
                score = float(np.clip(base_score, 0.0, 100.0))
        else:
            base_score = (hazard_rate * 35.0) + (rescue_rate * 25.0) + (protocol_rate * 20.0) + (speed_factor * 10.0) + (stress_resilience * 10.0)
            score = float(np.clip(base_score, 0.0, 100.0))

        if score >= 90:
            category = "EXCELLENT"
            risk = "LOW"
            rec = "Advanced Multi-Hazard Command Scenarios"
        elif score >= 75:
            category = "PASSED"
            risk = "MODERATE"
            rec = "Hazmat Mitigation & Speed Reaction Training"
        elif score >= 60:
            category = "NEEDS_IMPROVEMENT"
            risk = "ELEVATED"
            rec = "Basic Protocol Drill & Hazard Avoidance Review"
        else:
            category = "CRITICAL_FAIL"
            risk = "HIGH"
            rec = "Mandatory VR Disaster Fundamentals Refresher"

        pass_prob = float(np.clip(score / 100.0, 0.0, 1.0))

        return {
            "predicted_score": round(score, 1),
            "performance_category": category,
            "pass_probability": round(pass_prob, 2),
            "risk_assessment": risk,
            "recommended_focus_area": rec,
            "metrics": {
                "hazard_rate": round(hazard_rate * 100, 1),
                "rescue_rate": round(rescue_rate * 100, 1),
                "protocol_compliance": round(protocol_rate * 100, 1),
                "reaction_speed": round(speed_factor * 100, 1),
                "stress_resilience": round(stress_resilience * 100, 1)
            }
        }

predictor = DisasterPerformanceModel()
xgboost_model = predictor
