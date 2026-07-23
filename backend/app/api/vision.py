"""Computer-vision ingest contract.

This is the ONLY endpoint the CV client (a phone camera running detection)
needs to talk to. For the demo you can POST the same payload from Swagger/curl;
when the real CV is ready it posts identical bodies. See schemas/vision.py.
"""

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.models.machine import Machine
from app.schemas.vision import VisionReport, VisionReportResult
from app.services import queue_engine

router = APIRouter(prefix="/api/vision", tags=["vision"])


def require_vision_key(x_vision_key: str = Header(...)) -> None:
    if x_vision_key != settings.vision_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="X-Vision-Key inválida.",
        )


@router.post(
    "/report",
    response_model=VisionReportResult,
    dependencies=[Depends(require_vision_key)],
)
def report(body: VisionReport, db: Session = Depends(get_db)) -> VisionReportResult:
    """Ingest per-machine detections and drive the queue on any state change."""
    updated = 0
    for det in body.detections:
        machine = db.get(Machine, det.machine_id)
        if machine is None:
            continue
        new_status = queue_engine.status_from_detection(
            machine, det.occupied, det.running
        )
        if queue_engine.set_machine_status(db, machine, new_status):
            updated += 1
    db.commit()
    return VisionReportResult(updated=updated)
