import type { Machine } from "../api/client";
import { STATUS_LABEL, STATUS_META, machineCode, timeAgo } from "../lib/format";

interface Props {
  machine: Machine;
  indexInGroup: number;
  isMine: boolean;
}

export function MachineCard({ machine, indexInGroup, isMine }: Props) {
  const meta = isMine && machine.status !== "available"
    ? "Tu ropa está acá"
    : STATUS_META[machine.status];

  return (
    <div className={`machine is-${machine.status}`}>
      <span className="machine__bar" />
      <div className="machine__top">
        <span className="machine__code">
          {machineCode(machine.type, indexInGroup)}
        </span>
        <span className="pill">
          <span className="dot" />
          {STATUS_LABEL[machine.status]}
        </span>
      </div>
      <p className="machine__label">{machine.label}</p>
      <p className="machine__meta">{meta}</p>
      <div className="machine__foot">
        <span>{machine.type === "washer" ? "Lavado" : "Secado"}</span>
        <span>{timeAgo(machine.updated_at)}</span>
      </div>
    </div>
  );
}
