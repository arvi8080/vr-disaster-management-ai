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