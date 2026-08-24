from fastapi import FastAPI

from app.routes.prediction import router as prediction_router


app = FastAPI(
    title="VR Disaster Management AI Service",
    version="1.0.0",
    description="AI service for VR training performance analysis",
)


@app.get("/")
def root():
    return {
        "message": "VR Disaster Management AI Service",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


app.include_router(prediction_router)