import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";

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
      setError(err instanceof ApiError ? err.message : "Algo salió mal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={onSubmit}>
        <div className="auth-card__brand">LAVADERO · TURNOS</div>
        <div className="auth-card__sub">
          {isLogin
            ? "Ingresá para ver el estado de las máquinas."
            : "Creá una cuenta para encolarte."}
        </div>

        <div className="field">
          <label className="micro">Usuario</label>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            required
          />
        </div>
        <div className="field">
          <label className="micro">Contraseña</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="btn btn--block" type="submit" disabled={busy}>
          {busy ? "…" : isLogin ? "Ingresar" : "Crear cuenta"}
        </button>

        <div className="auth-switch">
          {isLogin ? "¿No tenés cuenta? " : "¿Ya tenés cuenta? "}
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setMode(isLogin ? "register" : "login");
              setError(null);
            }}
          >
            {isLogin ? "Registrate" : "Ingresá"}
          </button>
        </div>
      </form>
    </div>
  );
}
