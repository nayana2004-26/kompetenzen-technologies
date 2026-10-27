import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../api";
import { PATHWAYS } from "../data/pathways";

export default function Courses() {
  const [programs, setPrograms] = useState([]);
  const [search, setSearch] = useState("");
  const [pathwayFilter, setPathwayFilter] = useState("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const initialPathway = searchParams.get("pathway");
    if (initialPathway && PATHWAYS.some((item) => item.name === initialPathway)) setPathwayFilter(initialPathway);
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;
    api.get("/programs")
      .then((response) => { if (mounted) setPrograms(response.data); })
      .catch((requestError) => { if (mounted) setError(getErrorMessage(requestError)); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filteredPrograms = useMemo(() => programs.filter((program) => {
    const matchesPathway = pathwayFilter === "All" || program.pathway === pathwayFilter;
    const searchText = `${program.name} ${program.pathway} ${program.focusAreas} ${program.description}`.toLowerCase();
    return matchesPathway && searchText.includes(search.toLowerCase().trim());
  }), [programs, pathwayFilter, search]);

  return (
    <main>
      <section className="page-hero compact-hero"><div className="container"><span className="section-kicker">PROGRAM CATALOGUE</span><h1>Explore Program Topics</h1><p>Review the example programs and topic areas listed for this website demonstration.</p></div></section>
      <section className="container page-content">
        <div className="catalogue-toolbar">
          <div className="filter-group" aria-label="Filter by pathway">
            {["All", "Technical", "Sales", "B-School"].map((pathway) => <button key={pathway} className={`filter-button ${pathwayFilter === pathway ? "selected" : ""}`} type="button" onClick={() => setPathwayFilter(pathway)}>{pathway}</button>)}
          </div>
          <label className="search-control"><span className="sr-only">Search programs</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search programs or topics..." /></label>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {loading ? <div className="loading-state">Loading program catalogue...</div> : filteredPrograms.length === 0 ? <div className="empty-state"><h3>No matching programs</h3><p>Try a different search term or category.</p></div> : (
          <div className="catalogue-grid">
            {filteredPrograms.map((program) => <article className="catalogue-card" key={program.id}>
              <div className="catalogue-card-top"><span className="program-id">{program.id}</span><span className={`status-pill ${program.status === "Available" ? "status-available" : "status-unavailable"}`}>{program.status}</span></div>
              <span className="pathway-tag">{program.pathway}</span>
              <h2>{program.name}</h2>
              <p>{program.description}</p>
              <div className="focus-area"><strong>Focus areas</strong><span>{program.focusAreas}</span></div>
              <Link className={`button ${program.status === "Available" ? "button-primary" : "button-disabled"}`} to={program.status === "Available" ? `/register?pathway=${encodeURIComponent(program.pathway)}` : "#programs"} onClick={program.status !== "Available" ? (event) => event.preventDefault() : undefined} aria-disabled={program.status !== "Available"}>{program.status === "Available" ? "Enquire & Register →" : "Currently unavailable"}</Link>
            </article>)}
          </div>
        )}
        <p className="small-note">The catalogue describes proposed learning topics for this frontend project and does not confirm course dates, fees, or current availability outside this demo.</p>
      </section>
    </main>
  );
}

