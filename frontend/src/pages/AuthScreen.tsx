import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { BrandMark } from "../components/DrumIcon";

type Mode = "login" | "register";

export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isLogin = mode === "login";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isLogin) await login(username.trim(), password);
      else await register(username.trim(), password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={onSubmit}>
        <div className="auth-logo" aria-hidden>
          <BrandMark size={24} />
        </div>
        <div className="auth-card__title">
          {isLogin ? "Welcome back" : "Create your account"}
        </div>
        <div className="auth-card__sub">
          {isLogin
            ? "Sign in to see machine status."
            : "Register to join the queue and get notified."}
        </div>

        <div className="field">
          <label className="micro">Username</label>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your username"
            autoComplete="username"
            autoFocus
            required
          />
        </div>
        <div className="field">
          <label className="micro">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="btn btn--block" type="submit" disabled={busy}>
          {busy ? "…" : isLogin ? "Sign in" : "Create account"}
        </button>

        <div className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setMode(isLogin ? "register" : "login");
              setError(null);
            }}
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}
