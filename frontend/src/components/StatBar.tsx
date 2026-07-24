import type { Machine } from "../api/client";

interface Props {
  machines: Machine[];
}

export function StatBar({ machines }: Props) {
  const count = (s: Machine["status"]) =>
    machines.filter((m) => m.status === s).length;

  const cells: { key: string; num: number; label: string }[] = [
    { key: "available", num: count("available"), label: "Free" },
    { key: "in_use", num: count("in_use"), label: "Busy" },
    { key: "finished", num: count("finished"), label: "Done" },
  ];

  return (
    <div className="statpills">
      {cells.map((c) => (
        <div className={`statpill statpill--${c.key}`} key={c.key}>
          <span className="statpill__num">{c.num}</span>
          <span className="statpill__label">{c.label}</span>
        </div>
      ))}
    </div>
  );
}
