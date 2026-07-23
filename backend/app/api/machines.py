from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.machine import Machine
from app.models.user import User
from app.schemas.machine import MachineResponse
from app.services import queue_engine

router = APIRouter(prefix="/api/machines", tags=["machines"])


@router.get("", response_model=list[MachineResponse])
def list_machines(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[Machine]:
    # Expire stale holds on read so the prototype needs no background scheduler.
    queue_engine.expire_stale_holds(db)
    return list(db.scalars(select(Machine).order_by(Machine.id.asc())).all())
