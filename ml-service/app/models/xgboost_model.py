<<<<<<< HEAD
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

    def predict(self, duration_sec: float, hazards_avoided: int, total_hazards: int,
                casualties_rescued: int, protocol_violations: int, avg_reaction_time_ms: float, avg_stress: float):
        
        hazard_rate = hazards_avoided / max(total_hazards, 1)
        rescue_rate = min(casualties_rescued / 3.0, 1.0)
        protocol_rate = max(1.0 - (protocol_violations * 0.2), 0.0)
        speed_factor = max(1.0 - (avg_reaction_time_ms / 3000.0), 0.1)
        stress_resilience = max(1.0 - avg_stress, 0.1)

        if self.model is not None:
            try:
                # Features: ['evacuation_time', 'avg_reaction_time', 'correct_decisions', 'wrong_decisions', 'safety_violations', 'hazards_detected', 'victims_rescued', 'objectives_completed']
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
                print(f"Inference warning, using feature calculation: {err}")
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
=======
import os
import joblib


BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "xgboost_model.pkl"
)


class XGBoostModel:

    def __init__(self):
        self.model = None
        self.load_model()

    def load_model(self):
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"XGBoost model not found at: {MODEL_PATH}"
            )

        self.model = joblib.load(MODEL_PATH)

        print(
            f"XGBoost model loaded successfully from: {MODEL_PATH}"
        )

    def predict(self, features):
        prediction = self.model.predict([features])
        return float(prediction[0])


xgboost_model = XGBoostModel()
>>>>>>> remotes/origin/ai
