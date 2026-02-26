import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Status() {
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(false);

  const check = async () => {
    setChecking(true);
    try {
      const r = await fetch(`${API}/health`);
      const data = await r.json();
      setHealth(data);
    } catch(e) {
      setHealth({ backend: "error", database: "unknown", llm: "unknown", timestamp: new Date().toISOString() });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => { check(); }, []);

  const dot = (val) => {
    const ok = val === "ok" || val === "connected";
    return <span className={`status-dot ${ok ? "green" : "red"}`}></span>;
  };

  return (
    <div className="status-page">
      <div className="status-header">
        <h1>System Status</h1>
        <button className="btn-secondary" onClick={check} disabled={checking}>
          {checking ? "Checking..." : "↺ Refresh"}
        </button>
      </div>

      {health && (
        <>
          <div className="status-grid">
            <div className="status-card">
              {dot(health.backend)}
              <div className="status-info">
                <span className="status-label">Backend API</span>
                <span className={`status-val ${health.backend === "ok" ? "ok" : "err"}`}>{health.backend}</span>
              </div>
            </div>
            <div className="status-card">
              {dot(health.database)}
              <div className="status-info">
                <span className="status-label">Database (SQLite)</span>
                <span className={`status-val ${health.database === "ok" ? "ok" : "err"}`}>{health.database}</span>
              </div>
            </div>
            <div className="status-card">
              {dot(health.llm)}
              <div className="status-info">
                <span className="status-label">LLM (OpenAI)</span>
                <span className={`status-val ${health.llm === "connected" ? "ok" : "err"}`}>{health.llm}</span>
              </div>
            </div>
          </div>
          <p className="status-time">Last checked: {new Date(health.timestamp).toLocaleString()}</p>
        </>
      )}

      <div className="status-notes">
        <h2>Architecture</h2>
        <p>FastAPI backend with SQLite persistence. OpenAI GPT-4o-mini for change summarization. React + Vite frontend. Hosted on Render (backend) and Vercel (frontend).</p>
        <h2>Limitations</h2>
        <p>Some URLs behind login walls or CORS restrictions cannot be fetched server-side. JavaScript-rendered SPAs may return minimal content. Up to 5 snapshots are retained per link.</p>
      </div>
    </div>
  );
}
