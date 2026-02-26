import { useState } from "react";
import DiffModal from "./DiffModal";

export default function LinkCard({ link, onRefresh, api }) {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(link.last_summary ? { 
    status: link.last_status, 
    summary: link.last_summary, 
    checked_at: link.last_checked 
  } : null);
  const [history, setHistory] = useState(null);
  const [showDiff, setShowDiff] = useState(false);
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(link.label || link.url);
  const [project, setProject] = useState(link.project || "");

  const check = async () => {
    setChecking(true);
    setResult(null); // Clear old result while checking
    try {
      const r = await fetch(`${api}/links/${link.id}/check`, { method: "POST" });
      const data = await r.json();
      setResult(data);
    } catch(e) {
      setResult({ status: "error", summary: "Network error" });
    } finally {
      setChecking(false);
    }
  };

  const loadHistory = async () => {
    const r = await fetch(`${api}/links/${link.id}/history`);
    const data = await r.json();
    setHistory(data);
    setShowDiff(true);
  };

  const save = async () => {
    await fetch(`${api}/links/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, project })
    });
    setEditing(false);
    onRefresh();
  };

  const remove = async () => {
    if (!confirm("Delete this link?")) return;
    await fetch(`${api}/links/${link.id}`, { method: "DELETE" });
    onRefresh();
  };

  const tags = (() => { try { return JSON.parse(link.tags || "[]"); } catch { return []; } })();

  return (
    <div className="link-card">
      <div className="card-top">
        {editing ? (
          <div className="edit-form">
            <input className="edit-input" value={label} onChange={e => setLabel(e.target.value)} placeholder="Label" />
            <input className="edit-input" value={project} onChange={e => setProject(e.target.value)} placeholder="Project" />
            <div className="edit-actions">
              <button className="btn-sm green" onClick={save}>Save</button>
              <button className="btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="card-title-row">
              <span className="card-label">{link.label || link.url}</span>
              <div className="card-actions">
                <button className="icon-btn" title="Edit" onClick={() => setEditing(true)}>✎</button>
                <button className="icon-btn red" title="Delete" onClick={remove}>✕</button>
              </div>
            </div>
            <a className="card-url" href={link.url} target="_blank" rel="noreferrer">{link.url}</a>
            {link.project && <span className="card-project">{link.project}</span>}
            {tags.length > 0 && (
              <div className="card-tags">
                {tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            )}
          </>
        )}
      </div>

      <div className="card-bottom">
        {result && (
          <div className={`result-banner ${result.status === "error" ? "err" : result.changed ? "changed" : "same"}`}>
             {result.status === "error" ? "⚠ " + result.summary :
              result.changed ? "● Changes detected" : 
              result.summary === "No changes detected since last check." ? "✓ No changes" : "✓ Snapshot verified"}
          </div>
        )}
        {result?.summary && result.status !== "error" && result.summary !== "No changes detected since last check." && (
          <div className="summary-box">
            <strong>Latest AI Summary</strong>
            <p>{result.summary}</p>
          </div>
        )}
        <div className="card-btns">
          <button className="btn-check" onClick={check} disabled={checking}>
            {checking ? <span className="spinner"></span> : "Check Now"}
          </button>
          <button className="btn-secondary-sm" onClick={loadHistory}>History</button>
        </div>
        <span className="card-date">Added {new Date(link.created_at).toLocaleDateString()}</span>
      </div>

      {showDiff && <DiffModal history={history} label={link.label || link.url} onClose={() => setShowDiff(false)} />}
    </div>
  );
}
