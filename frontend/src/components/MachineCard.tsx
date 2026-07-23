import type { Machine } from "../api/client";
import { STATUS_LABEL, STATUS_META, machineCode, timeAgo } from "../lib/format";
import { DrumIcon } from "./DrumIcon";

interface Props {
  machine: Machine;
  indexInGroup: number;
  isMine: boolean;
}

export function MachineCard({ machine, indexInGroup, isMine }: Props) {
  const meta =
    isMine && machine.status !== "available"
      ? "Tu ropa está acá"
      : STATUS_META[machine.status];

  return (
    <div className={`machine is-${machine.status}`}>
      <div className="machine__top">
        <span className="drum">
          <DrumIcon size={24} />
        </span>
        <span className="chip">
          <span className="dot" />
          {STATUS_LABEL[machine.status]}
        </span>
      </div>
      <div className="machine__code">
        {machineCode(machine.type, indexInGroup)}
      </div>
      <h3 className="machine__label">{machine.label}</h3>
      <p className="machine__meta">
        <b>{meta}</b>
        <span className="machine__upd"> · {timeAgo(machine.updated_at)}</span>
      </p>
    </div>
  );
}
