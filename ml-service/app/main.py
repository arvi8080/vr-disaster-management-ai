from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.prediction import router as prediction_router

app = FastAPI(
    title="VR Disaster Management AI/ML Service",
    description="Python AI Service providing XGBoost performance predictions and Digital Skill Twin analytics.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "running",
        "service": "VR Disaster Management AI/ML Engine",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "model": "XGBoost Disaster Performance Predictor"}

app.include_router(prediction_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
