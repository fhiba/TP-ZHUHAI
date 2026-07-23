import { useAuth } from "../context/AuthContext";
import { NotificationBell } from "./NotificationBell";

export function TopBar() {
  const { user, logout } = useAuth();
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand__mark">LAVADERO</span>
        <span className="brand__sub">Turnos</span>
      </div>
      <div className="spacer" />
      <span className="topbar__user">@{user?.username}</span>
      <NotificationBell />
      <button className="btn btn--ghost btn--sm" onClick={logout}>
        Salir
      </button>
    </header>
  );
}
