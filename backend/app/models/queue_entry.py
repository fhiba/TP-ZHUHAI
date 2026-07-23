import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.machine import MachineType


class QueueStatus(str, enum.Enum):
    waiting = "waiting"      # esperando en la cola
    notified = "notified"    # se liberó una máquina, tiene un hold para reclamarla
    claimed = "claimed"      # tomó la máquina
    expired = "expired"      # no reclamó a tiempo
    cancelled = "cancelled"  # salió de la cola


class QueueEntry(Base):
    __tablename__ = "queue_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    machine_type: Mapped[MachineType] = mapped_column(Enum(MachineType), nullable=False)
    status: Mapped[QueueStatus] = mapped_column(
        Enum(QueueStatus), default=QueueStatus.waiting, nullable=False
    )
    assigned_machine_id: Mapped[int | None] = mapped_column(
        ForeignKey("machines.id"), nullable=True
    )
    notified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
