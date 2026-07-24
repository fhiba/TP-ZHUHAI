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
import { LiveFeed } from "../components/LiveFeed";
import { DryerMark, WasherMark } from "../components/DrumIcon";
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
      setError(e instanceof ApiError ? e.message : "Could not complete the action.");
    }
  }

  return (
    <div className="app-shell">
      <TopBar />
      <div className="board">
        <div className="board__main">
          <LiveFeed machines={machines} />
          <div className="board__queue">
            {error && <p className="form-error form-error--compact">{error}</p>}
            <QueuePanel
              entries={entries}
              busyTypes={busyTypes}
              onJoin={(t) => run(() => api.joinQueue(t))}
              onLeave={(id) => run(() => api.leaveQueue(id))}
              onClaim={(id) => run(() => api.claim(id))}
            />
          </div>
        </div>

        <section className="board__machines panel">
          <div className="panel__head">
            <span className="panel__title">Machines</span>
            <StatBar machines={machines} />
          </div>
          <div className="board__machines-body">
            {GROUPS.map((type) => {
              const group = machines
                .filter((m) => m.type === type)
                .sort((a, b) => a.id - b.id);
              return (
                <div className="machine-group" key={type}>
                  <div className="machine-group__head">
                    <span className="machine-group__title">
                      <span className="machine-group__mark">
                        {type === "dryer" ? (
                          <DryerMark size={14} />
                        ) : (
                          <WasherMark size={14} />
                        )}
                      </span>
                      {TYPE_LABEL[type]}s
                    </span>
                    <span className="machine-group__count">
                      {group.filter((m) => m.status === "available").length} free
                    </span>
                  </div>
                  <div className="machine-list">
                    {group.map((m, i) => (
                      <MachineCard
                        key={m.id}
                        machine={m}
                        indexInGroup={i}
                        isMine={m.current_user_id === user?.id}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
