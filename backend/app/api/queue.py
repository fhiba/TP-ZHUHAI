from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.queue_entry import QueueEntry, QueueStatus
from app.models.user import User
from app.schemas.queue import QueueEntryResponse, QueueJoinRequest
from app.services import queue_engine

router = APIRouter(prefix="/api/queue", tags=["queue"])

# Statuses that represent an "open" spot in the queue (still relevant to the user).
_ACTIVE = (QueueStatus.waiting, QueueStatus.notified)


def _to_response(db: Session, entry: QueueEntry) -> QueueEntryResponse:
    resp = QueueEntryResponse.model_validate(entry)
    resp.position = queue_engine.waiting_position(db, entry)
    return resp


@router.post("", response_model=QueueEntryResponse, status_code=status.HTTP_201_CREATED)
def join_queue(
    body: QueueJoinRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> QueueEntryResponse:
    already = db.scalar(
        select(QueueEntry).where(
            QueueEntry.user_id == user.id,
            QueueEntry.machine_type == body.type,
            QueueEntry.status.in_(_ACTIVE),
        )
    )
    if already is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya estás en la cola para ese tipo de máquina.",
        )
    entry = QueueEntry(user_id=user.id, machine_type=body.type)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return _to_response(db, entry)


@router.get("/me", response_model=list[QueueEntryResponse])
def my_queue(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[QueueEntryResponse]:
    queue_engine.expire_stale_holds(db)
    entries = db.scalars(
        select(QueueEntry)
        .where(
            QueueEntry.user_id == user.id,
            QueueEntry.status.in_(_ACTIVE),
        )
        .order_by(QueueEntry.created_at.asc())
    ).all()
    return [_to_response(db, e) for e in entries]


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def leave_queue(
    entry_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    entry = db.get(QueueEntry, entry_id)
    if entry is None or entry.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrada.")
    entry.status = QueueStatus.cancelled
    db.commit()


@router.post("/{entry_id}/claim", response_model=QueueEntryResponse)
def claim_machine(
    entry_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> QueueEntryResponse:
    entry = db.get(QueueEntry, entry_id)
    if entry is None or entry.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No encontrada.")
    try:
        queue_engine.claim(db, entry, user.id)
    except (PermissionError, ValueError) as exc:
        db.commit()  # persist any state change (e.g. entry marked expired)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    db.commit()
    db.refresh(entry)
    return _to_response(db, entry)
