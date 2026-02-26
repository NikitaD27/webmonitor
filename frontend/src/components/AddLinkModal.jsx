import { useState } from "react";

export default function AddLinkModal({ api, onClose, onAdded }) {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [project, setProject] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setError("URL must start with http:// or https://");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`${api}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          label: label || url,
          project,
          tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : []
        })
      });
      if (!r.ok) {
        const d = await r.json();
        setError(d.detail || "Error adding link");
      } else {
        onAdded();
        onClose();
      }
    } catch(e) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add a Link</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <div className="modal-body">
          <label>URL *</label>
          <input className="modal-input" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/pricing" />
          <label>Label</label>
          <input className="modal-input" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Stripe Pricing" />
          <label>Project</label>
          <input className="modal-input" value={project} onChange={e => setProject(e.target.value)} placeholder="e.g. Competitor Research" />
          <label>Tags (comma separated)</label>
          <input className="modal-input" value={tags} onChange={e => setTags(e.target.value)} placeholder="pricing, competitor, docs" />
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={loading}>
            {loading ? "Adding..." : "Add Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
