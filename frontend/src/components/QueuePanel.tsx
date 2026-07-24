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
    <section className="panel panel--fill">
      <div className="panel__head">
        <span className="panel__title">Your queue</span>
      </div>
      <div className="panel__body panel__body--queue">
        <div className="queue-actions">
          <button
            className="btn btn--ghost btn--sm"
            disabled={busyTypes.has("washer")}
            onClick={() => onJoin("washer")}
          >
            + Washer
          </button>
          <button
            className="btn btn--ghost btn--sm"
            disabled={busyTypes.has("dryer")}
            onClick={() => onJoin("dryer")}
          >
            + Dryer
          </button>
        </div>

        <div className="queue-list">
          {entries.length === 0 ? (
            <p className="empty">Not in a queue yet.</p>
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
                        ? "Ready to claim"
                        : `Position ${e.position ?? "?"}`}
                    </div>
                  </div>
                  {ready ? (
                    <button className="btn btn--accent btn--sm" onClick={() => onClaim(e.id)}>
                      Claim
                    </button>
                  ) : (
                    <button className="btn btn--danger btn--sm" onClick={() => onLeave(e.id)}>
                      Leave
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
