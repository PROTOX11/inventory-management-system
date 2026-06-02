from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from database import get_db
from schemas import DashboardStatsResponse
from services import StatsService
from routes.auth import require_merchant

router = APIRouter(tags=["stats"])

@router.get("/api/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_merchant)
):
    
    stats = StatsService.get_dashboard_stats(db)
    return DashboardStatsResponse(**stats)
