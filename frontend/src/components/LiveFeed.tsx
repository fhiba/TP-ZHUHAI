import { useEffect, useRef, useState } from "react";
import type { Machine } from "../api/client";
import { useDemoPlayback } from "../hooks/useDemoPlayback";
import { START_OFFSET, DEMO_DURATION } from "../lib/demoScript";

const STATUS_STYLES: Record<string, { border: string; label: string }> = {
  available: { border: "rgba(255,255,255,0.45)", label: "FREE" },
  in_use: { border: "#22c55e", label: "IN USE" },
  finished: { border: "#f59e0b", label: "DONE" },
  offline: { border: "#ef4444", label: "OFFLINE" },
};

const ROI_POSITIONS = [
  { top: "2%", left: "1%", width: "31%", height: "46%" },
  { top: "2%", left: "34%", width: "31%", height: "46%" },
  { top: "2%", left: "67%", width: "31%", height: "46%" },
  { top: "52%", left: "1%", width: "31%", height: "46%" },
  { top: "52%", left: "34%", width: "31%", height: "46%" },
  { top: "52%", left: "67%", width: "31%", height: "46%" },
];

function fmt(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function LiveFeed({ machines }: { machines: Machine[] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const { currentTime, start, stop, reset, isPlaying } = useDemoPlayback(playing);

  useEffect(() => {
    if (currentTime >= DEMO_DURATION && isPlaying) {
      videoRef.current?.pause();
      setPlaying(false);
      stop();
    }
  }, [currentTime, isPlaying, stop]);

  function handleStart() {
    const v = videoRef.current;
    if (v) {
      v.currentTime = START_OFFSET;
      void v.play().catch(() => {});
    }
    reset();
    setPlaying(true);
    start();
  }

  function handleStop() {
    videoRef.current?.pause();
    setPlaying(false);
    stop();
  }

  const machineMap = new Map(machines.map((m) => [m.id, m]));
  const live = playing && isPlaying;

  return (
    <section className="feed">
      <div className="feed__bar">
        <div className="feed__meta">
          <strong>Live camera</strong>
          {live ? (
            <span className="feed-live">● LIVE</span>
          ) : (
            <span className="micro">Idle</span>
          )}
          {live && (
            <span className="micro feed-time">
              {fmt(currentTime)} / {fmt(DEMO_DURATION)}
            </span>
          )}
        </div>
        {!live ? (
          <button className="btn btn--sm btn--primary" onClick={handleStart}>
            ▶ Demo
          </button>
        ) : (
          <button className="btn btn--sm btn--ghost" onClick={handleStop}>
            ⏹ Stop
          </button>
        )}
      </div>

      {/* Stage hugs the video box — full frame, no crop, no letterbox void */}
      <div className="feed__stage">
        <div className="feed__frame">
          <video
            ref={videoRef}
            src="/demo/laundry.mp4"
            muted
            playsInline
            preload="metadata"
            className="feed__video"
          />
          {ROI_POSITIONS.map((pos, i) => {
            const machineId = i + 1;
            const machine = machineMap.get(machineId);
            const st =
              STATUS_STYLES[machine?.status ?? "available"] ??
              STATUS_STYLES.available;
            return (
              <div
                key={machineId}
                className="feed__roi"
                style={{
                  top: pos.top,
                  left: pos.left,
                  width: pos.width,
                  height: pos.height,
                  borderColor: st.border,
                }}
              >
                <span className="feed__roi-label">
                  #{machineId} {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
