import { useState, useEffect } from "react";
import LinkCard from "../components/LinkCard";
import AddLinkModal from "../components/AddLinkModal";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Home() {
  const [links, setLinks] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLinks = async () => {
    try {
      const r = await fetch(`${API}/links`);
      const data = await r.json();
      setLinks(data);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLinks(); }, []);

  const projects = [...new Set(links.map(l => l.project).filter(Boolean))];

  const filtered = links.filter(l => {
    const matchText = !filter || l.label?.toLowerCase().includes(filter.toLowerCase()) || l.url.toLowerCase().includes(filter.toLowerCase());
    const matchProject = !projectFilter || l.project === projectFilter;
    return matchText && matchProject;
  });

  return (
    <div className="home-page">
      <div className="hero">
        <h1 className="hero-title">Track what matters.</h1>
        <p className="hero-sub">Monitor up to 8 pages. Get AI-powered change summaries. Never miss an update.</p>
        <div className="hero-steps">
          <div className="step"><span className="step-num">01</span><span>Add a URL</span></div>
          <div className="step-arrow">→</div>
          <div className="step"><span className="step-num">02</span><span>Click Check Now</span></div>
          <div className="step-arrow">→</div>
          <div className="step"><span className="step-num">03</span><span>See what changed</span></div>
        </div>
      </div>

      <div className="controls">
        <input
          className="search-input"
          placeholder="Search links..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <select className="project-select" value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
          <option value="">All projects</option>
          {projects.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button
          className="btn-primary"
          onClick={() => setShowAdd(true)}
          disabled={links.length >= 8}
        >
          + Add Link
        </button>
        {links.length >= 8 && <span className="limit-msg">Max 8 links reached</span>}
      </div>

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⊙</div>
          <p>{links.length === 0 ? "No links yet. Add your first URL to monitor." : "No results match your search."}</p>
        </div>
      ) : (
        <div className="links-grid">
          {filtered.map(link => (
            <LinkCard key={link.id} link={link} onRefresh={fetchLinks} api={API} />
          ))}
        </div>
      )}

      {showAdd && <AddLinkModal api={API} onClose={() => setShowAdd(false)} onAdded={fetchLinks} />}
    </div>
  );
}
