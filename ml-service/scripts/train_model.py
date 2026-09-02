import numpy as np
import pandas as pd
import pickle
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error

def generate_dataset(n_samples=1000, random_state=42):
    np.random.seed(random_state)

    evacuation_time = np.random.uniform(60, 600, n_samples)          # 60s to 600s
    avg_reaction_time = np.random.uniform(200, 1500, n_samples)      # 200ms to 1500ms
    correct_decisions = np.random.randint(2, 12, n_samples)
    wrong_decisions = np.random.randint(0, 5, n_samples)
    safety_violations = np.random.randint(0, 4, n_samples)
    hazards_detected = np.random.randint(1, 10, n_samples)
    victims_rescued = np.random.randint(0, 6, n_samples)
    objectives_completed = np.random.randint(1, 5, n_samples)

    # Compute target ground truth performance score (0-100)
    decision_ratio = correct_decisions / (correct_decisions + wrong_decisions + 1e-5)
    speed_factor = np.clip(1.0 - (avg_reaction_time / 2000.0), 0.1, 1.0)
    safety_factor = np.clip(1.0 - (safety_violations * 0.25), 0.0, 1.0)
    rescue_factor = np.clip(victims_rescued / 5.0, 0.0, 1.0)

    score = (
        (decision_ratio * 35) +
        (safety_factor * 25) +
        (rescue_factor * 25) +
        (speed_factor * 15)
    )
    score = np.clip(score + np.random.normal(0, 2.5, n_samples), 0, 100)

    df = pd.DataFrame({
        'evacuation_time': evacuation_time,
        'avg_reaction_time': avg_reaction_time,
        'correct_decisions': correct_decisions,
        'wrong_decisions': wrong_decisions,
        'safety_violations': safety_violations,
        'hazards_detected': hazards_detected,
        'victims_rescued': victims_rescued,
        'objectives_completed': objectives_completed,
        'performance_score': score
    })
    return df

def train_and_save():
    print("Generating synthetic VR disaster training dataset...")
    df = generate_dataset(1500)

    X = df.drop(columns=['performance_score'])
    y = df['performance_score']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training ML Performance Model (RandomForest / XGBoost Architecture)...")
    model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)

    print(f"Model Training Complete! R^2 Score: {r2:.4f}, MSE: {mse:.4f}")

    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(models_dir, exist_ok=True)
    pkl_path = os.path.join(models_dir, "xgboost_model.pkl")

    with open(pkl_path, "wb") as f:
        pickle.dump(model, f)

    print(f"Successfully saved trained model pickle to: {pkl_path}")

if __name__ == "__main__":
    train_and_save()
