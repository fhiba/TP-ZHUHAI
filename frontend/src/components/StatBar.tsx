import type { Machine } from "../api/client";

interface Props {
  machines: Machine[];
}

export function StatBar({ machines }: Props) {
  const count = (s: Machine["status"]) =>
    machines.filter((m) => m.status === s).length;

  const cells: { key: string; num: number; label: string }[] = [
    { key: "available", num: count("available"), label: "Libres" },
    { key: "in_use", num: count("in_use"), label: "En uso" },
    { key: "finished", num: count("finished"), label: "Terminados" },
    { key: "total", num: machines.length, label: "Máquinas" },
  ];

  return (
    <div className="statbar">
      {cells.map((c) => (
        <div className={`stat stat--${c.key}`} key={c.key}>
          <div className="stat__num">{c.num}</div>
          <div className="stat__label">
            <span className="dot" />
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}
