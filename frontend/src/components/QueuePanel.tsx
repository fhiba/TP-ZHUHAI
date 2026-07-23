import type { MachineType, QueueEntry } from "../api/client";
import { TYPE_LABEL } from "../lib/format";

interface Props {
  entries: QueueEntry[];
  busyTypes: Set<MachineType>;
  onJoin: (type: MachineType) => void;
  onLeave: (id: number) => void;
  onClaim: (id: number) => void;
}

export function QueuePanel({ entries, busyTypes, onJoin, onLeave, onClaim }: Props) {
  return (
    <section className="panel">
      <div className="panel__head">
        <span className="panel__title">Tu cola</span>
      </div>
      <div className="panel__body">
        <div className="queue-actions">
          <button
            className="btn btn--ghost btn--sm"
            disabled={busyTypes.has("washer")}
            onClick={() => onJoin("washer")}
          >
            + Lavarropas
          </button>
          <button
            className="btn btn--ghost btn--sm"
            disabled={busyTypes.has("dryer")}
            onClick={() => onJoin("dryer")}
          >
            + Secarropas
          </button>
        </div>

        {entries.length === 0 ? (
          <p className="empty">No estás en ninguna cola.</p>
        ) : (
          entries.map((e) => {
            const ready = e.status === "notified";
            return (
              <div key={e.id} className={`queue-item ${ready ? "is-ready" : ""}`}>
                <div className="queue-item__pos">
                  {ready ? "✓" : (e.position ?? "–")}
                </div>
                <div className="queue-item__body">
                  <div className="queue-item__type">
                    {TYPE_LABEL[e.machine_type]}
                  </div>
                  <div className="queue-item__state">
                    {ready
                      ? "¡Máquina libre! Reservá tu turno"
                      : `En espera · puesto ${e.position ?? "?"}`}
                  </div>
                </div>
                {ready ? (
                  <button className="btn btn--accent btn--sm" onClick={() => onClaim(e.id)}>
                    Reservar
                  </button>
                ) : (
                  <button className="btn btn--danger btn--sm" onClick={() => onLeave(e.id)}>
                    Salir
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
