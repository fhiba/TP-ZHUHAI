import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class MachineType(str, enum.Enum):
    washer = "washer"
    dryer = "dryer"


class MachineStatus(str, enum.Enum):
    available = "available"  # libre
    in_use = "in_use"        # ocupada, ciclo corriendo
    finished = "finished"    # terminó el ciclo, ropa adentro
    offline = "offline"      # fuera de servicio


class Machine(Base):
    __tablename__ = "machines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    type: Mapped[MachineType] = mapped_column(Enum(MachineType), nullable=False)
    label: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[MachineStatus] = mapped_column(
        Enum(MachineStatus), default=MachineStatus.available, nullable=False
    )
    current_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )
    cycle_started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    cycle_ends_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
