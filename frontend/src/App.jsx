import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Status from "./pages/Status";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">◎</span>
          <span className="brand-name">WebMonitor</span>
        </div>
        <div className="nav-links">
          <button className={page === "home" ? "nav-btn active" : "nav-btn"} onClick={() => setPage("home")}>Monitor</button>
          <button className={page === "status" ? "nav-btn active" : "nav-btn"} onClick={() => setPage("status")}>Status</button>
        </div>
      </nav>
      <main className="main-content">
        {page === "home" ? <Home /> : <Status />}
      </main>
    </div>
  );
}
