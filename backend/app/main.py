from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, machines, notifications, queue, vision
from app.core.config import settings
from app.core.db import Base, SessionLocal, engine
from app.db.seed import seed_machines

# Import models so their tables register on Base before create_all.
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Prototype: create tables directly (swap for Alembic migrations later).
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_machines(db)
    yield


app = FastAPI(title="Laundry Turn Manager", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(machines.router)
app.include_router(queue.router)
app.include_router(notifications.router)
app.include_router(vision.router)


@app.get("/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok"}
