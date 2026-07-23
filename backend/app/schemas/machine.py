from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.machine import MachineStatus, MachineType


class MachineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: MachineType
    label: str
    status: MachineStatus
    current_user_id: int | None
    cycle_ends_at: datetime | None
    updated_at: datetime
