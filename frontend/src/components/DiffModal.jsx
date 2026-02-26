import { createPortal } from "react-dom";

export default function DiffModal({ history, label, onClose }) {
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>History — {label}</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body history-body">
          {!history || history.length === 0 ? (
            <p className="muted">No checks yet. Click "Check Now" on the card first.</p>
          ) : history.map((snap, i) => (
            <div key={snap.id} className="snap-block">
              <div className="snap-header">
                <span className={`snap-status ${snap.status}`}>{snap.status === "ok" ? "●" : "⚠"}</span>
                <strong>{new Date(snap.checked_at + "Z").toLocaleString()}</strong>
                {i === 0 && <span className="badge">Latest</span>}
              </div>
              {snap.summary && (
                <div className="snap-summary">
                  <strong>Summary</strong>
                  <p>{snap.summary}</p>
                </div>
              )}
              {snap.diff_html ? (
                <pre className="diff-view" dangerouslySetInnerHTML={{ __html: snap.diff_html }} />
              ) : (
                <p className="muted">No diff — first check or no content change.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
