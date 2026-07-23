"""Core turn-management logic.

Single source of truth for how machine state changes drive the queue:
notifying the next person, holding a machine while they claim it, expiring
stale holds, and claiming. Called from the vision and queue routers.
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.machine import Machine, MachineStatus, MachineType
from app.models.notification import Notification
from app.models.queue_entry import QueueEntry, QueueStatus

_TYPE_LABEL = {MachineType.washer: "lavarropas", MachineType.dryer: "secarropas"}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _notify(db: Session, user_id: int, message: str, kind: str = "info") -> None:
    db.add(Notification(user_id=user_id, message=message, kind=kind))


def status_from_detection(machine: Machine, occupied: bool, running: bool) -> MachineStatus:
    """Map a raw CV detection to a machine status.

    Vision can't always tell "loading" from "finished" (both are occupied and
    idle), so we use the previous status: a machine that WAS running and is now
    occupied-but-idle has just finished its cycle.
    """
    if not occupied:
        return MachineStatus.available
    if running:
        return MachineStatus.in_use
    # occupied but not running
    if machine.status in (MachineStatus.in_use, MachineStatus.finished):
        return MachineStatus.finished
    return MachineStatus.in_use


def set_machine_status(db: Session, machine: Machine, new_status: MachineStatus) -> bool:
    """Apply a status to a machine and run the side effects of the transition.

    Returns True if the status actually changed.
    """
    old = machine.status
    if old == new_status:
        return False

    machine.status = new_status

    if new_status == MachineStatus.available:
        machine.current_user_id = None
        machine.cycle_started_at = None
        machine.cycle_ends_at = None
        _notify_next(db, machine)
    elif new_status == MachineStatus.in_use:
        machine.cycle_started_at = _now()
    elif new_status == MachineStatus.finished:
        if machine.current_user_id is not None:
            _notify(
                db,
                machine.current_user_id,
                f"Terminó el ciclo de {machine.label}. Retirá tu ropa.",
                kind="finished",
            )
        # 2da iteración: acá va el hook de penalización si no retira a tiempo.

    return True


def _notify_next(db: Session, machine: Machine) -> None:
    """Give the first person waiting for this machine type a hold to claim it."""
    entry = db.scalars(
        select(QueueEntry)
        .where(
            QueueEntry.machine_type == machine.type,
            QueueEntry.status == QueueStatus.waiting,
        )
        .order_by(QueueEntry.created_at.asc())
    ).first()
    if entry is None:
        return

    entry.status = QueueStatus.notified
    entry.assigned_machine_id = machine.id
    entry.notified_at = _now()
    _notify(
        db,
        entry.user_id,
        f"Se liberó {machine.label}. Tenés {settings.claim_hold_minutes} min "
        f"para reservarlo antes de perder el turno.",
        kind="available",
    )


def expire_stale_holds(db: Session) -> None:
    """Expire holds older than the configured window and pass the turn on.

    Called opportunistically on read endpoints so no background scheduler is
    needed for the prototype.
    """
    cutoff = _now() - timedelta(minutes=settings.claim_hold_minutes)
    stale = db.scalars(
        select(QueueEntry).where(
            QueueEntry.status == QueueStatus.notified,
            QueueEntry.notified_at < cutoff,
        )
    ).all()

    changed = False
    for entry in stale:
        entry.status = QueueStatus.expired
        _notify(
            db,
            entry.user_id,
            "Perdiste el turno por no reservar a tiempo.",
            kind="expired",
        )
        machine = db.get(Machine, entry.assigned_machine_id)
        if machine is not None and machine.status == MachineStatus.available:
            _notify_next(db, machine)
        changed = True

    if changed:
        db.commit()


def claim(db: Session, entry: QueueEntry, user_id: int) -> Machine:
    """Claim the machine a notified queue entry points to."""
    if entry.user_id != user_id:
        raise PermissionError("Esta entrada de cola no es tuya.")
    if entry.status != QueueStatus.notified:
        raise ValueError("No tenés una máquina para reservar en este momento.")

    machine = db.get(Machine, entry.assigned_machine_id)
    if machine is None or machine.status != MachineStatus.available:
        entry.status = QueueStatus.expired
        raise ValueError("La máquina ya no está disponible.")

    machine.status = MachineStatus.in_use
    machine.current_user_id = user_id
    machine.cycle_started_at = _now()
    entry.status = QueueStatus.claimed
    _notify(db, user_id, f"Reservaste {machine.label}. ¡A lavar!", kind="claimed")
    return machine


def waiting_position(db: Session, entry: QueueEntry) -> int | None:
    """1-based position among still-waiting entries of the same type."""
    if entry.status != QueueStatus.waiting:
        return None
    ahead = len(
        db.scalars(
            select(QueueEntry).where(
                QueueEntry.machine_type == entry.machine_type,
                QueueEntry.status == QueueStatus.waiting,
                QueueEntry.created_at < entry.created_at,
            )
        ).all()
    )
    return ahead + 1
