import { useEffect, useRef, useState } from "react";
import { api, type Notification } from "../api/client";
import { usePolling } from "../hooks/usePolling";
import { timeAgo } from "../lib/format";

export function NotificationBell() {
  const { data, refresh } = usePolling<Notification[]>(api.notifications, 5000);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const notifs = data ?? [];
  const unread = notifs.filter((n) => !n.read).length;

  // Close when clicking outside the popover.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function markAll() {
    await Promise.all(notifs.filter((n) => !n.read).map((n) => api.markRead(n.id)));
    refresh();
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className="bell"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificaciones"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unread > 0 && <span className="bell__count">{unread}</span>}
      </button>

      {open && (
        <div className="popover">
          <div className="panel__head">
            <span className="micro">Notificaciones</span>
            {unread > 0 && (
              <button className="link-btn" onClick={markAll}>
                marcar leídas
              </button>
            )}
          </div>
          {notifs.length === 0 ? (
            <div className="empty" style={{ padding: "14px" }}>
              Sin novedades.
            </div>
          ) : (
            notifs.map((n) => (
              <div key={n.id} className={`notif ${n.read ? "" : "is-unread"}`}>
                <span className="notif__dot" />
                <div>
                  <div className="notif__msg">{n.message}</div>
                  <div className="notif__time">{timeAgo(n.created_at)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
