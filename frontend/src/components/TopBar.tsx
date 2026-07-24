import { useAuth } from "../context/AuthContext";
import { NotificationBell } from "./NotificationBell";
import { BrandMark } from "./DrumIcon";

export function TopBar() {
  const { user, logout } = useAuth();
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand__logo" aria-hidden>
          <BrandMark size={18} />
        </span>
        <span className="brand__name">Laundry</span>
        <span className="brand__sub">· Queue</span>
      </div>
      <div className="spacer" />
      <span className="topbar__user">@{user?.username}</span>
      <NotificationBell />
      <button className="btn btn--ghost btn--sm" onClick={logout}>
        Log out
      </button>
    </header>
  );
}
