from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.machine import Machine, MachineType

# 3 lavarropas + 3 secarropas.
_MACHINES = [
    (MachineType.washer, "Lavarropas 1"),
    (MachineType.washer, "Lavarropas 2"),
    (MachineType.washer, "Lavarropas 3"),
    (MachineType.dryer, "Secarropas 1"),
    (MachineType.dryer, "Secarropas 2"),
    (MachineType.dryer, "Secarropas 3"),
]


def seed_machines(db: Session) -> None:
    """Create the 6 machines once. Idempotent: does nothing if any exist."""
    count = db.scalar(select(func.count()).select_from(Machine))
    if count:
        return
    db.add_all(Machine(type=t, label=label) for t, label in _MACHINES)
    db.commit()
