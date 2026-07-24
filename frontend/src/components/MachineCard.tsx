import type { Machine } from "../api/client";
import { STATUS_LABEL, STATUS_META, machineCode, timeAgo } from "../lib/format";
import { DryerMark, WasherMark } from "./DrumIcon";

interface Props {
  machine: Machine;
  indexInGroup: number;
  isMine: boolean;
}

export function MachineCard({ machine, indexInGroup, isMine }: Props) {
  const meta =
    isMine && machine.status !== "available"
      ? "Your laundry is here"
      : STATUS_META[machine.status];

  const Mark = machine.type === "dryer" ? DryerMark : WasherMark;

  return (
    <div className={`mrow is-${machine.status}`}>
      <span className="mrow__mark" title={machine.label}>
        <span className="mrow__icon">
          <Mark size={20} />
        </span>
        <span className="mrow__code">{machineCode(machine.type, indexInGroup)}</span>
      </span>
      <div className="mrow__main">
        <div className="mrow__name">{machine.label}</div>
        <div className="mrow__meta">
          {meta}
          <span className="mrow__ago"> · {timeAgo(machine.updated_at)}</span>
        </div>
      </div>
      <span className={`chip chip--${machine.status}`}>
        <span className="dot" />
        {STATUS_LABEL[machine.status]}
      </span>
    </div>
  );
}
