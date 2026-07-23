import { useState } from "react";
import {
  api,
  ApiError,
  type Machine,
  type MachineType,
  type QueueEntry,
} from "../api/client";
import { useAuth } from "../context/AuthContext";
import { usePolling } from "../hooks/usePolling";
import { TopBar } from "../components/TopBar";
import { StatBar } from "../components/StatBar";
import { MachineCard } from "../components/MachineCard";
import { QueuePanel } from "../components/QueuePanel";
import { LiveFeedPlaceholder } from "../components/LiveFeedPlaceholder";
import { TYPE_LABEL } from "../lib/format";

const GROUPS: MachineType[] = ["washer", "dryer"];

export function Dashboard() {
  const { user } = useAuth();
  const machinesP = usePolling<Machine[]>(api.machines, 4000);
  const queueP = usePolling<QueueEntry[]>(api.myQueue, 4000);
  const [error, setError] = useState<string | null>(null);

  const machines = machinesP.data ?? [];
  const entries = queueP.data ?? [];
  const busyTypes = new Set(entries.map((e) => e.machine_type));

  function refresh() {
    machinesP.refresh();
    queueP.refresh();
  }

  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
      refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo completar la acción.");
    }
  }

  return (
    <>
      <TopBar />
      <div className="container">
        <div className="layout">
          <main>
            <StatBar machines={machines} />
            {GROUPS.map((type) => {
              const group = machines
                .filter((m) => m.type === type)
                .sort((a, b) => a.id - b.id);
              return (
                <section className="section" key={type}>
                  <div className="section__head">
                    <span className="micro">{TYPE_LABEL[type]}</span>
                  </div>
                  <div className="machine-grid">
                    {group.map((m, i) => (
                      <MachineCard
                        key={m.id}
                        machine={m}
                        indexInGroup={i}
                        isMine={m.current_user_id === user?.id}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </main>

          <aside>
            {error && <p className="form-error">{error}</p>}
            <QueuePanel
              entries={entries}
              busyTypes={busyTypes}
              onJoin={(t) => run(() => api.joinQueue(t))}
              onLeave={(id) => run(() => api.leaveQueue(id))}
              onClaim={(id) => run(() => api.claim(id))}
            />
            <LiveFeedPlaceholder />
          </aside>
        </div>
      </div>
    </>
  );
}
