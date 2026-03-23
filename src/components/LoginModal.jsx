import { useState } from "react";

export function LoginModal({ onLogin, loading, error, onClearError }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password) return;
    onLogin(username.trim(), password);
  }

  return (
    <div className="modal-overlay" onClick={undefined}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Acceso administrador</h2>

        <label className="input-label">Usuario</label>
        <input
          className="input"
          value={username}
          onChange={(e) => { setUsername(e.target.value); onClearError(); }}
          placeholder="admin"
          autoFocus
          autoComplete="username"
        />

        <label className="input-label">Contraseña</label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); onClearError(); }}
          placeholder="••••••••"
          autoComplete="current-password"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
        />

        {error && (
          <p style={{ fontSize: "0.82rem", color: "var(--accent2)", marginTop: "-0.25rem" }}>
            {error}
          </p>
        )}

        <div className="modal-actions" style={{ marginTop: "0.5rem" }}>
          <button
            className="btn primary"
            onClick={handleSubmit}
            disabled={loading || !username.trim() || !password}
            style={{ width: "100%" }}
          >
            {loading ? "Verificando…" : "Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
