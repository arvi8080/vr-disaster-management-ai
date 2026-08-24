from fastapi import APIRouter

from app.schemas.training_schema import (
    AnalyzeRequest,
    AnalyzeResponse,
)

from app.services.prediction_service import analyze


router = APIRouter()


@router.post(
    "/analyze",
    response_model=AnalyzeResponse
)
def analyze_training_session(
    request: AnalyzeRequest
):
    return analyze(request)