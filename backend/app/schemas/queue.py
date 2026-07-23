from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.machine import MachineType
from app.models.queue_entry import QueueStatus


class QueueJoinRequest(BaseModel):
    type: MachineType


class QueueEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    machine_type: MachineType
    status: QueueStatus
    assigned_machine_id: int | None
    position: int | None = None  # 1-based place among waiting entries of the same type
    created_at: datetime
