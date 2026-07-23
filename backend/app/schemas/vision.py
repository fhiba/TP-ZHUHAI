from pydantic import BaseModel, Field


class Detection(BaseModel):
    """A single machine reading coming from the CV client (phone camera)."""

    machine_id: int
    occupied: bool  # ¿hay ropa / alguien usando la máquina?
    running: bool = False  # ¿el ciclo está corriendo? (vibración, luz, etc.)


class VisionReport(BaseModel):
    source: str = Field(default="unknown", description="ID of the reporting camera")
    detections: list[Detection]


class VisionReportResult(BaseModel):
    updated: int  # cuántas máquinas cambiaron de estado
