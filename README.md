# Lavadero · Turnos

Gestor de turnos de lavarropas/secarropas con visión por computadora. Los
estudiantes ven el estado de las máquinas en vivo, se encolan para la próxima
libre y reciben avisos cuando se libera o termina un ciclo.

Este repo es el **core funcional** del prototipo, pensado para que el equipo se
divida el trabajo. La visión por computadora real (celular con detección) se
conecta después contra un contrato de API ya definido.

## Stack

- **Backend**: FastAPI + SQLAlchemy + SQLite (Python 3.13)
- **Frontend**: React + Vite + TypeScript (sin librerías de UI; CSS propio)
- **Tiempo real**: polling + notificaciones in-app (sin WebSockets)
- **Auth**: usuario + contraseña interno (JWT)

## Cómo correr

### 1. Backend

```bash
cd backend
python3.13 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Al arrancar crea la base SQLite y siembra **3 lavarropas + 3 secarropas**.
Docs interactivas (Swagger): http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Abrí http://localhost:5173. Si el backend corre en otra URL, seteá
`VITE_API_URL` (por defecto `http://localhost:8000`).

## Probar el flujo completo

1. Registrate y logueate en la web.
2. En **Tu cola**, encolate a lavarropas.
3. Simulá que una máquina se libera posteando al contrato de visión (lo mismo
   que hará el celular con CV):

```bash
# marcar Lavarropas 1 como ocupada + corriendo
curl -X POST http://localhost:8000/api/vision/report \
  -H 'X-Vision-Key: dev-vision-key' -H 'Content-Type: application/json' \
  -d '{"detections":[{"machine_id":1,"occupied":true,"running":true}]}'

# marcar Lavarropas 1 como libre  -> notifica al primero de la cola
curl -X POST http://localhost:8000/api/vision/report \
  -H 'X-Vision-Key: dev-vision-key' -H 'Content-Type: application/json' \
  -d '{"detections":[{"machine_id":1,"occupied":false,"running":false}]}'
```

4. En pocos segundos (polling) aparece la notificación y el botón **Reservar**.

Estados de máquina según la detección: `occupied:false` → **libre**,
`occupied:true, running:true` → **en uso**, y `occupied:true, running:false`
sobre una máquina que estaba en uso → **terminado** (avisa "retirá la ropa").

## Estructura

```
backend/app/
  core/       config, db (SQLAlchemy), security (JWT + hashing)
  models/     User, Machine, QueueEntry, Notification
  schemas/    Pydantic (request/response)
  api/        auth, machines, queue, notifications, vision
  services/   queue_engine.py  (lógica de cola / notificaciones / hold)
  db/seed.py  siembra las 6 máquinas
frontend/src/
  api/client.ts        wrapper tipado del backend
  context/AuthContext   sesión + token
  hooks/usePolling      polling genérico
  components/           TopBar, StatBar, MachineCard, QueuePanel,
                        NotificationBell, LiveFeedPlaceholder
  pages/                AuthScreen, Dashboard
```

## Contrato de visión (para el equipo de CV)

El cliente de CV (celular) es el **único** que habla con `POST /api/vision/report`.
Envía, cada pocos segundos, el estado detectado de cada máquina:

```json
{
  "source": "phone-1",
  "detections": [
    { "machine_id": 1, "occupied": true, "running": true }
  ]
}
```

Header requerido: `X-Vision-Key` (por defecto `dev-vision-key`, configurable por
env `VISION_API_KEY`). El backend mapea las detecciones a estados y dispara el
motor de cola. No hace falta tocar nada más del backend para integrarlo.

## División de tareas sugerida

- **A · Auth**: `models/user`, `core/security`, `api/auth`, `pages/AuthScreen`, `AuthContext`.
- **B · Máquinas + Dashboard**: `models/machine`, `db/seed`, `api/machines`, `MachineCard`, `StatBar`, polling.
- **C · Cola + notificaciones**: `models/queue_entry`, `models/notification`, `services/queue_engine`, `api/queue`, `api/notifications`, `QueuePanel`, `NotificationBell`.
- **D · Visión**: `api/vision`, `schemas/vision`, y luego el CV real en el celular posteando al contrato.

## Fuera de scope (próximas iteraciones)

- Visión por computadora real desde el celular + streaming del live feed.
- Penalizaciones por no reservar / no retirar la ropa a tiempo (el hook ya está
  marcado en `queue_engine.py`).
- Verificación por one-time link al cargar la ropa.
- Combo lavarropa → secarropa encadenado.

## Configuración (env del backend)

| Variable | Default | Descripción |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./laundry.db` | Conexión a la base |
| `JWT_SECRET` | `dev-secret-change-me` | Firma de tokens |
| `VISION_API_KEY` | `dev-vision-key` | Key del cliente de visión |
| `CLAIM_HOLD_MINUTES` | `5` | Minutos para reservar tras el aviso |
