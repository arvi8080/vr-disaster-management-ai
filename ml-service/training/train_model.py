import os

import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor


# --------------------------------------------------
# Configuration
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "xgboost_model.pkl")

DATA_PATH = os.path.join(
    BASE_DIR,
    "training",
    "training_data.csv"
)

os.makedirs(MODEL_DIR, exist_ok=True)


# --------------------------------------------------
# Generate synthetic training data
# --------------------------------------------------

np.random.seed(42)

NUM_SAMPLES = 1000

data = {
    "evacuationTime": np.random.uniform(
        60, 600, NUM_SAMPLES
    ),

    "averageReactionTime": np.random.uniform(
        1, 10, NUM_SAMPLES
    ),

    "wrongDecisions": np.random.randint(
        0, 8, NUM_SAMPLES
    ),

    "correctDecisions": np.random.randint(
        1, 15, NUM_SAMPLES
    ),

    "safetyViolations": np.random.randint(
        0, 6, NUM_SAMPLES
    ),

    "hazardsDetected": np.random.randint(
        0, 10, NUM_SAMPLES
    ),

    "hazardsIgnored": np.random.randint(
        0, 8, NUM_SAMPLES
    ),

    "victimsRescued": np.random.randint(
        0, 10, NUM_SAMPLES
    ),

    "objectivesCompleted": np.random.randint(
        0, 10, NUM_SAMPLES
    ),
}

df = pd.DataFrame(data)


# --------------------------------------------------
# Generate target performance score
# --------------------------------------------------

score = (
    100

    - df["evacuationTime"] * 0.05

    - df["averageReactionTime"] * 2

    - df["wrongDecisions"] * 5

    + df["correctDecisions"] * 2

    - df["safetyViolations"] * 8

    + df["hazardsDetected"] * 2

    - df["hazardsIgnored"] * 4

    + df["victimsRescued"] * 3

    + df["objectivesCompleted"] * 3
)

# Add small noise so the model learns a realistic relationship
noise = np.random.normal(
    0,
    3,
    NUM_SAMPLES
)

df["performanceScore"] = score + noise

# Keep score between 0 and 100
df["performanceScore"] = (
    df["performanceScore"]
    .clip(0, 100)
    .round(2)
)


# --------------------------------------------------
# Save training dataset
# --------------------------------------------------

df.to_csv(
    DATA_PATH,
    index=False
)

print(
    f"Training dataset saved to: {DATA_PATH}"
)


# --------------------------------------------------
# Prepare features and target
# --------------------------------------------------

FEATURES = [
    "evacuationTime",
    "averageReactionTime",
    "wrongDecisions",
    "correctDecisions",
    "safetyViolations",
    "hazardsDetected",
    "hazardsIgnored",
    "victimsRescued",
    "objectivesCompleted",
]

TARGET = "performanceScore"

X = df[FEATURES]
y = df[TARGET]


# --------------------------------------------------
# Train / Test split
# --------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


# --------------------------------------------------
# XGBoost model
# --------------------------------------------------

model = XGBRegressor(
    n_estimators=300,
    max_depth=5,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="reg:squarederror",
    random_state=42
)


print("Training XGBoost model...")

model.fit(
    X_train,
    y_train
)


# --------------------------------------------------
# Evaluate model
# --------------------------------------------------

predictions = model.predict(X_test)

mae = mean_absolute_error(
    y_test,
    predictions
)

rmse = np.sqrt(
    mean_squared_error(
        y_test,
        predictions
    )
)

r2 = r2_score(
    y_test,
    predictions
)

print("\nModel Evaluation")
print("----------------")
print(f"MAE  : {mae:.2f}")
print(f"RMSE : {rmse:.2f}")
print(f"R²   : {r2:.4f}")


# --------------------------------------------------
# Save trained model
# --------------------------------------------------

joblib.dump(
    model,
    MODEL_PATH
)

print(
    f"\nModel saved to: {MODEL_PATH}"
)

print("\nTraining completed successfully!")