import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "./api.js";
import { useAuth } from "./AuthContext.jsx";
import { pathways, getPathway } from "./data/pathways.js";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function signOut() {
    logout();
    navigate("/");
  }

  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="Kompetenzen Technologies home">
        <span className="brand-main">Kompetenzen</span>
        <span className="brand-sub">TECHNOLOGIES</span>
      </Link>
      <nav className="main-nav">
        <Link className={location.pathname === "/" ? "nav-active" : ""} to="/">Home</Link>
        <Link className={location.pathname === "/programs" ? "nav-active" : ""} to="/programs">Programs</Link>
        {user?.role === "student" && <Link to="/student/dashboard">My Dashboard</Link>}
        {user?.role === "admin" && <Link to="/admin/dashboard">Admin</Link>}
      </nav>
      <div className="header-actions">
        {!user ? (
          <>
            <Link className="header-login" to="/login">Student Login</Link>
            <Link className="button button-small" to="/register">Get Started</Link>
          </>
        ) : (
          <>
            <span className="header-user">{user.name}</span>
            <button className="button button-small button-outline" onClick={signOut}>Log out</button>
          </>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Link className="footer-brand" to="/">Kompetenzen Technologies</Link>
        <p>Explore skills. Discover opportunities. Build your future.</p>
      </div>
      <div className="footer-links">
        <Link to="/programs">Programs</Link>
        <Link to="/enquiry">Enquiries</Link>
        <Link to="/admin/login">Admin</Link>
      </div>
      <span className="copyright">© {new Date().getFullYear()} Kompetenzen Technologies</span>
    </footer>
  );
}

function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={role === "admin" ? "/admin/login" : "/login"} replace />;
  if (user.role !== role) return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/student/dashboard"} replace />;
  return children;
}

function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ programs: 0 });
  useEffect(() => {
    api.get("/programs").then((response) => setStats({ programs: response.data.length })).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero-section" id="home">
        <div className="hero-copy">
          <span className="eyebrow-pill">LEARN · DEVELOP · SUCCEED</span>
          <h1>Build Your Skills,<br /><span>Shape Your Future.</span></h1>
          <p>Discover learning pathways in technology, sales and business. Find the direction that matches your interests and career goals.</p>
          <div className="hero-actions">
            <Link className="button" to="/programs">Explore Programs <span aria-hidden="true">→</span></Link>
            <Link className="button button-light" to="/enquiry">Make an Enquiry</Link>
          </div>
          <div className="hero-note"><span className="check-dot">✓</span> Explore pathways. Discover possibilities.</div>
        </div>
        <div className="hero-art" aria-label="Learning pathway overview">
          <div className="art-orb" />
          <div className="learning-preview">
            <div className="preview-star">✦</div>
            <p className="preview-eyebrow">YOUR NEXT CAREER STEP</p>
            <h2>Learn with<br />purpose.</h2>
            <p className="preview-copy">Choose a pathway and start exploring your learning opportunities.</p>
            {pathways.map((pathway, index) => (
              <button className="preview-pathway" key={pathway.id} onClick={() => navigate(`/programs?pathway=${encodeURIComponent(pathway.name)}`)}>
                <span className="preview-icon">{["T", "S", "B"][index]}</span>
                <span className="preview-text"><strong>{pathway.name}</strong><small>{pathway.subtitle}</small></span>
                <span className="preview-arrow">↗</span>
              </button>
            ))}
          </div>
          <div className="floating-badge"><span>✓</span> A pathway for your goals</div>
        </div>
      </section>

      <section className="section-block benefits-section" id="about">
        <SectionHeading label="WHY KOMPETENZEN?" title="Find a pathway that moves you forward" subtitle="Explore learning areas and discover opportunities to develop relevant skills." />
        <div className="benefit-grid">
          <article className="benefit-card"><div className="benefit-number">01</div><h3>Explore different fields</h3><p>Discover technology, sales and business topics in one place.</p></article>
          <article className="benefit-card"><div className="benefit-number">02</div><h3>Identify your interests</h3><p>Compare learning areas and find a pathway that matches your goals.</p></article>
          <article className="benefit-card"><div className="benefit-number">03</div><h3>Take the next step</h3><p>Share your interest through the enquiry and registration form.</p></article>
        </div>
        {stats.programs > 0 && <p className="program-count-note">Currently showing {stats.programs} program options in the catalogue.</p>}
      </section>

      <section className="section-block pathway-section" id="pathways">
        <SectionHeading label="EXPLORE OUR PATHWAYS" title="Discover your area of interest" subtitle="Select a pathway to view learning topics or submit an enquiry." />
        <div className="pathway-grid">
          {pathways.map((pathway, index) => (
            <article className="pathway-card" key={pathway.id}>
              <div className="pathway-card-top"><span className="pathway-num">0{index + 1}</span><span className="pathway-arrow">↗</span></div>
              <h3>{pathway.name}</h3>
              <h4>{pathway.subtitle}</h4>
              <p>{pathway.description}</p>
              <div className="topic-chips">{pathway.topics.map((topic) => (
                <button type="button" className="topic-chip-button" key={topic} onClick={() => navigate(`/enquiry?pathway=${encodeURIComponent(pathway.name)}&item=${encodeURIComponent(topic)}&type=topic`)}>{topic}</button>
              ))}</div>
              <div className="card-actions">
                <button className="button button-outline" onClick={() => navigate(`/programs?pathway=${encodeURIComponent(pathway.name)}`)}>View Topics</button>
                <button className="button" onClick={() => navigate(`/enquiry?pathway=${encodeURIComponent(pathway.name)}`)}>Make an Enquiry <span>→</span></button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function SectionHeading({ label, title, subtitle }) {
  return <div className="section-heading"><span className="section-eyebrow">{label}</span><h2>{title}</h2><p>{subtitle}</p></div>;
}

function ProgramsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [search, setSearch] = useState("");
  const requestedPathway = new URLSearchParams(location.search).get("pathway") || "All";
  const [category, setCategory] = useState(requestedPathway);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => setCategory(requestedPathway), [requestedPathway]);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.get("/programs")
      .then((response) => { if (alive) setPrograms(response.data); })
      .catch((err) => { if (alive) setError(getErrorMessage(err)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const filteredPrograms = useMemo(() => programs.filter((program) => {
    const categoryMatch = category === "All" || program.pathway === category;
    const query = search.toLowerCase();
    const searchMatch = [program.name, program.pathway, program.focusAreas, program.description].some((value) => String(value || "").toLowerCase().includes(query));
    return categoryMatch && searchMatch;
  }), [programs, category, search]);

  return (
    <main className="page-wrap">
      <section className="page-intro"><span className="section-eyebrow">PROGRAM CATALOGUE</span><h1>Explore learning programs</h1><p>Search program options across Technical, Sales and B-School pathways.</p></section>
      <section className="catalogue-panel">
        <div className="catalogue-controls">
          <div className="filter-row">{["All", "Technical", "Sales", "B-School"].map((item) => <button type="button" key={item} className={`filter-chip ${category === item ? "selected" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}</div>
          <input className="search-box" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search programs or topics..." aria-label="Search programs" />
        </div>
        {error && <div className="alert alert-error">{error} <button className="text-button" onClick={() => window.location.reload()}>Retry</button></div>}
        {loading ? <div className="empty-state">Loading programs...</div> : (
          <div className="program-grid">
            {filteredPrograms.map((program) => (
              <article className="program-card" key={program.id}>
                <div className="program-meta"><span className="program-id">{program.id}</span><span className={`status-pill ${program.status === "Available" ? "status-open" : "status-closed"}`}>{program.status}</span></div>
                <span className="program-category">{program.pathway}</span>
                <h3>{program.name}</h3>
                <p>{program.description}</p>
                <div className="program-focus"><strong>Focus areas — click a topic to enquire</strong><div className="topic-chips program-topic-chips">{String(program.focusAreas || "").split(",").map((topic) => topic.trim()).filter(Boolean).map((topic) => <button type="button" className="topic-chip-button" key={topic} onClick={() => navigate(`/enquiry?pathway=${encodeURIComponent(program.pathway)}&item=${encodeURIComponent(topic)}&type=topic`)}>{topic}</button>)}</div></div>
                <button className="button button-block" disabled={program.status !== "Available"} onClick={() => navigate(`/enquiry?pathway=${encodeURIComponent(program.pathway)}&item=${encodeURIComponent(program.name)}&type=program`)}>{program.status === "Available" ? "Make an Enquiry →" : "Currently Unavailable"}</button>
              </article>
            ))}
            {filteredPrograms.length === 0 && <div className="empty-state">No programs match your search. Try another keyword or category.</div>}
          </div>
        )}
      </section>
    </main>
  );
}

function EnquiryPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialPathway = getPathway(params.get("pathway"))?.name || "";
  const initialInterest = params.get("item") || "";
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", pathway: initialPathway, interest: initialInterest, message: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const current = new URLSearchParams(location.search);
    setForm((previous) => ({
      ...previous,
      pathway: getPathway(current.get("pathway"))?.name || "",
      interest: current.get("item") || ""
    }));
    setError("");
    setSuccess("");
  }, [location.search]);

  function change(event) {
    const { name, value } = event.target;
    if (name === "phone" && !/^\d{0,10}$/.test(value)) return;
    setForm((previous) => name === "pathway"
      ? { ...previous, pathway: value, interest: "" }
      : { ...previous, [name]: value });
    setError("");
    setSuccess("");
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!/^\d{10}$/.test(form.phone)) return setError("Enter a valid 10-digit phone number.");
    if (!form.pathway) return setError("Please choose a pathway.");
    if (!form.interest.trim()) return setError("Please enter the topic or program you want to enquire about.");
    setLoading(true);
    try {
      const response = await api.post("/enquiries", {
        studentName: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        city: form.city.trim(),
        pathway: form.pathway,
        selectedItem: form.interest.trim(),
        itemType: new URLSearchParams(location.search).get("type") || "general",
        learningGoal: form.message.trim(),
        message: form.message.trim()
      });
      setSuccess(response.data?.message || "Your enquiry has been submitted successfully.");
      setForm((previous) => ({ ...previous, name: "", email: "", phone: "", city: "", message: "" }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const selectedPathway = getPathway(form.pathway);

  return (
    <main className="auth-page register-page enquiry-page">
      <section className="auth-intro">
        <span className="section-eyebrow">KOMPETENZEN TECHNOLOGIES</span>
        <h1>Ask about a<br /><span>learning option.</span></h1>
        <p>Send an enquiry about the exact topic or program you selected. You do not need to create a student account to ask a question.</p>
        <ul className="check-list">
          <li>✓ Enquire about any Technical topic or program</li>
          <li>✓ Enquire about Sales and B-School topics</li>
          <li>✓ Your enquiry is sent to the administrator</li>
          <li>✓ Student login and registration remain separate</li>
        </ul>
        {(selectedPathway || form.interest) && <div className="selected-pathway-card">
          <span className="mini-label">YOUR ENQUIRY</span>
          {selectedPathway && <h3>{selectedPathway.name}</h3>}
          {form.interest && <p><strong>Interested in:</strong> {form.interest}</p>}
          {selectedPathway && <p>{selectedPathway.description}</p>}
        </div>}
      </section>
      <section className="auth-card register-card enquiry-card">
        <div className="auth-card-heading"><h2>Make an Enquiry</h2><p>Tell us how to contact you and what you want to learn. No account is created by this form.</p></div>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        {success && <div className="alert alert-success" role="status">{success}</div>}
        <form onSubmit={submit}>
          <FormField label="Full name *" id="enq-name"><input id="enq-name" name="name" value={form.name} onChange={change} placeholder="Enter your full name" autoComplete="name" maxLength={100} required /></FormField>
          <div className="form-grid two-cols">
            <FormField label="Email address *" id="enq-email"><input id="enq-email" name="email" type="email" value={form.email} onChange={change} placeholder="name@example.com" autoComplete="email" required /></FormField>
            <FormField label="Contact number *" id="enq-phone"><input id="enq-phone" name="phone" type="tel" inputMode="numeric" pattern="[0-9]{10}" title="Enter a valid 10-digit phone number" placeholder="10-digit phone number" value={form.phone} onChange={change} maxLength={10} autoComplete="tel" required /></FormField>
          </div>
          <FormField label="City" id="enq-city"><input id="enq-city" name="city" value={form.city} onChange={change} placeholder="Your city (optional)" maxLength={100} autoComplete="address-level2" /></FormField>
          <FormField label="Choose pathway *" id="enq-pathway"><select id="enq-pathway" name="pathway" value={form.pathway} onChange={change} required><option value="">Select a pathway</option>{pathways.map((item) => <option value={item.name} key={item.id}>{item.name} — {item.subtitle}</option>)}</select></FormField>
          <FormField label="Topic or program *" id="enq-interest"><input id="enq-interest" name="interest" value={form.interest} onChange={change} placeholder="e.g. Python, B2B Sales, HR Management" maxLength={150} required /><small className="field-help">This is prefilled when you click an enquiry button on a topic or program.</small></FormField>
          <FormField label="Your question (optional)" id="enq-message"><textarea id="enq-message" name="message" value={form.message} onChange={change} rows="3" maxLength={1000} placeholder="Tell us what you would like to know about this topic or program." /></FormField>
          <button className="button button-block form-submit" type="submit" disabled={loading}>{loading ? "Sending Enquiry…" : "Submit Enquiry →"}</button>
          <p className="form-disclaimer">Submitting this form sends an enquiry only. It does not create a student login account.</p>
        </form>
      </section>
    </main>
  );
}

function StudentRegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", qualification: "", pathway: "", learningGoal: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chosen = location.state?.pathway || params.get("pathway") || "";
    const pathway = getPathway(chosen);
    if (pathway) setForm((previous) => ({ ...previous, pathway: pathway.name }));
  }, [location.search, location.state]);

  const selectedPathway = getPathway(form.pathway);
  function change(event) {
    const { name, value } = event.target;
    if (name === "phone" && !/^\d{0,10}$/.test(value)) return;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!/^\d{10}$/.test(form.phone)) return setError("Enter a valid 10-digit phone number.");
    if (form.password.length < 8) return setError("Password must contain at least 8 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone, city: form.city.trim(), qualification: form.qualification, pathway: form.pathway, learningGoal: form.learningGoal.trim(), password: form.password });
      navigate("/student/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page register-page">
      <section className="auth-intro">
        <span className="section-eyebrow">KOMPETENZEN TECHNOLOGIES</span>
        <h1>Start your<br /><span>learning journey.</span></h1>
        <p>Create your student account, choose a pathway and explore topics that match your learning goals.</p>
        <ul className="check-list"><li>✓ Technical, Sales and B-School pathways</li><li>✓ Program and topic information</li><li>✓ Student dashboard for your selected pathway</li></ul>
        {selectedPathway && <div className="selected-pathway-card"><span className="mini-label">SELECTED PATHWAY</span><h3>{selectedPathway.name}</h3><p>{selectedPathway.description}</p><div className="topic-chips">{selectedPathway.topics.slice(0, 8).map((topic) => <span key={topic}>{topic}</span>)}</div></div>}
      </section>
      <section className="auth-card register-card">
        <div className="auth-card-heading"><h2>Create your student account</h2><p>Complete the form below. Fields marked * are required.</p></div>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <form onSubmit={submit}>
          <FormField label="Full name *" id="reg-name"><input id="reg-name" name="name" value={form.name} onChange={change} placeholder="Enter your full name" autoComplete="name" maxLength={100} required /></FormField>
          <div className="form-grid two-cols">
            <FormField label="Email address *" id="reg-email"><input id="reg-email" name="email" type="email" value={form.email} onChange={change} placeholder="name@example.com" autoComplete="email" required /></FormField>
            <FormField label="Contact number *" id="reg-phone"><input id="reg-phone" name="phone" type="tel" inputMode="numeric" pattern="[0-9]{10}" title="Enter a valid 10-digit phone number" placeholder="10-digit phone number" value={form.phone} onChange={change} maxLength={10} autoComplete="tel" required /></FormField>
            <FormField label="City *" id="reg-city"><input id="reg-city" name="city" value={form.city} onChange={change} placeholder="Your city" maxLength={100} autoComplete="address-level2" required /></FormField>
            <FormField label="Highest qualification *" id="reg-qualification"><select id="reg-qualification" name="qualification" value={form.qualification} onChange={change} required><option value="">Select qualification</option><option>High School</option><option>Diploma</option><option>Undergraduate</option><option>Graduate</option><option>Postgraduate</option><option>Other</option></select></FormField>
          </div>
          <FormField label="Choose your pathway *" id="reg-pathway"><select id="reg-pathway" name="pathway" value={form.pathway} onChange={change} required><option value="">Select a learning pathway</option>{pathways.map((item) => <option value={item.name} key={item.id}>{item.name} — {item.subtitle}</option>)}</select><small className="field-help">A pathway is preselected when you start from a pathway card.</small></FormField>
          {selectedPathway && <div className="pathway-preview"><strong>Topics in {selectedPathway.name}</strong><p>{selectedPathway.description}</p><div className="topic-chips">{selectedPathway.topics.map((topic) => <span key={topic}>{topic}</span>)}</div></div>}
          <FormField label="What would you like to learn? *" id="reg-goal"><textarea id="reg-goal" name="learningGoal" value={form.learningGoal} onChange={change} rows="3" maxLength={1000} placeholder="Describe your learning interests and career goals" required /></FormField>
          <div className="form-grid two-cols">
            <FormField label="Create password *" id="reg-password"><div className="password-input-wrap"><input id="reg-password" name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={change} minLength={8} maxLength={128} autoComplete="new-password" placeholder="At least 8 characters" required /><button type="button" onClick={() => setShowPassword((v) => !v)}>{showPassword ? "Hide" : "Show"}</button></div></FormField>
            <FormField label="Confirm password *" id="reg-confirm"><div className="password-input-wrap"><input id="reg-confirm" name="confirmPassword" type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={change} minLength={8} maxLength={128} autoComplete="new-password" placeholder="Re-enter password" required /><button type="button" onClick={() => setShowConfirm((v) => !v)}>{showConfirm ? "Hide" : "Show"}</button></div></FormField>
          </div>
          <button className="button button-block form-submit" type="submit" disabled={loading}>{loading ? "Creating account…" : "Create Student Account →"}</button>
          <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
          <p className="form-disclaimer">This coursework demo submits details to its local API server.</p>
        </form>
      </section>
    </main>
  );
}

function FormField({ label, id, children }) {
  return <div className="form-field"><label htmlFor={id}>{label}</label>{children}</div>;
}

function LoginPage({ role = "student" }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const isAdmin = role === "admin";
  const [email, setEmail] = useState(isAdmin ? "admin@kompetenzen.demo" : "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password, role);
      navigate(isAdmin ? "/admin/dashboard" : "/student/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page login-page">
      <section className="auth-intro"><span className="section-eyebrow">{isAdmin ? "ADMINISTRATOR ACCESS" : "WELCOME BACK"}</span><h1>{isAdmin ? <>Manage programs,<br /><span>support learning.</span></> : <>Continue your<br /><span>learning journey.</span></>}</h1><p>{isAdmin ? "Manage programs, review enquiries and view registered students." : "Log in to see your selected pathway and explore related program topics."}</p><ul className="check-list"><li>✓ Professional blue-and-white learning platform</li><li>✓ Pathway-specific program information</li><li>✓ Secure server-side role verification for this demo</li></ul></section>
      <section className="auth-card login-card"><div className="auth-card-heading"><h2>{isAdmin ? "Admin Login" : "Welcome back!"}</h2><p>{isAdmin ? "Sign in with your administrator credentials." : "Enter your student account details."}</p></div>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <form onSubmit={submit}>
          <FormField label="Email address *" id="login-email"><input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" placeholder="name@example.com" required /></FormField>
          <FormField label="Password *" id="login-password"><div className="password-input-wrap"><input id="login-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Enter your password" required /><button type="button" onClick={() => setShowPassword((v) => !v)}>{showPassword ? "Hide" : "Show"}</button></div></FormField>
          <button className="button button-block form-submit" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign In →"}</button>
        </form>
        {!isAdmin && <p className="auth-switch">Don't have an account? <Link to="/register">Register now</Link></p>}
        {isAdmin && <p className="form-disclaimer">Local demo credentials are listed in README.md. Change them before deployment.</p>}
      </section>
    </main>
  );
}

function StudentDashboard() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [error, setError] = useState("");
  const pathway = getPathway(user?.pathway);
  useEffect(() => {
    api.get("/programs", { params: { pathway: user?.pathway } }).then((response) => setPrograms(response.data)).catch((err) => setError(getErrorMessage(err)));
  }, [user?.pathway]);

  return <main className="page-wrap dashboard-wrap"><section className="dashboard-welcome"><span className="section-eyebrow">STUDENT DASHBOARD</span><h1>Welcome, {user?.name || "Student"}</h1><p>Your selected pathway is <strong>{user?.pathway || "Not selected"}</strong>. Explore the relevant topics and program descriptions below.</p><div className="dashboard-summary"><div><span>Account</span><strong>{user?.email}</strong></div><div><span>Qualification</span><strong>{user?.qualification || "—"}</strong></div><div><span>Pathway</span><strong>{user?.pathway || "—"}</strong></div></div></section>
    {pathway && <section className="section-block dashboard-section"><SectionHeading label="YOUR LEARNING PATHWAY" title={pathway.name} subtitle={pathway.description} /><div className="topic-list-large">{pathway.topics.map((topic) => <span key={topic}>{topic}</span>)}</div></section>}
    <section className="section-block dashboard-section"><SectionHeading label="RELATED PROGRAMS" title="Programs for your pathway" subtitle="These are the programs currently listed for your selected pathway." />{error && <div className="alert alert-error">{error}</div>}<div className="program-grid">{programs.map((program) => <article className="program-card" key={program.id}><span className="program-category">{program.pathway}</span><h3>{program.name}</h3><p>{program.description}</p><div className="program-focus"><strong>Focus areas</strong><span>{program.focusAreas}</span></div><span className={`status-pill ${program.status === "Available" ? "status-open" : "status-closed"}`}>{program.status}</span></article>)}{!programs.length && !error && <div className="empty-state">No programs are currently listed for this pathway.</div>}</div></section>
  </main>;
}

function AdminDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [tab, setTab] = useState(location.pathname === "/admin/programs" ? "programs" : "students");
  const [students, setStudents] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newProgram, setNewProgram] = useState({ pathway: "Technical", name: "", focusAreas: "", description: "", status: "Available" });

  async function loadData() {
    setLoading(true); setError("");
    try {
      const [studentResponse, enquiryResponse, programResponse] = await Promise.all([
        api.get("/admin/students"), api.get("/admin/enquiries"), api.get("/programs")
      ]);
      setStudents(studentResponse.data); setEnquiries(enquiryResponse.data); setPrograms(programResponse.data);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadData(); }, []);

  function startEdit(program) { setEditingId(program.id); setDraft({ ...program }); setNotice(""); setError(""); }
  function cancelEdit() { setEditingId(null); setDraft(null); }
  function changeDraft(event) { setDraft((current) => ({ ...current, [event.target.name]: event.target.value })); }
  function changeNew(event) { setNewProgram((current) => ({ ...current, [event.target.name]: event.target.value })); }

  async function saveEdit() {
    setError(""); setNotice("");
    try {
      const response = await api.put(`/programs/${encodeURIComponent(editingId)}`, draft);
      setPrograms((current) => current.map((program) => program.id === editingId ? response.data : program));
      setEditingId(null); setDraft(null); setNotice("Program updated successfully.");
    } catch (err) { setError(getErrorMessage(err)); }
  }
  async function deleteProgram(program) {
    if (!window.confirm(`Delete ${program.name}?`)) return;
    setError(""); setNotice("");
    try {
      await api.delete(`/programs/${encodeURIComponent(program.id)}`);
      setPrograms((current) => current.filter((item) => item.id !== program.id));
      setEditingId(null); setDraft(null); setNotice("Program deleted successfully.");
    } catch (err) { setError(getErrorMessage(err)); }
  }
  async function addProgram(event) {
    event.preventDefault(); setError(""); setNotice("");
    try {
      const response = await api.post("/programs", newProgram);
      setPrograms((current) => [...current, response.data]);
      setNewProgram({ pathway: "Technical", name: "", focusAreas: "", description: "", status: "Available" });
      setShowAdd(false); setNotice("Program added successfully.");
    } catch (err) { setError(getErrorMessage(err)); }
  }
  async function updateEnquiry(enquiry, status) {
    setError(""); setNotice("");
    try {
      const response = await api.put(`/admin/enquiries/${encodeURIComponent(enquiry.id)}`, { status });
      setEnquiries((current) => current.map((item) => item.id === enquiry.id ? response.data : item));
      setNotice("Enquiry status updated.");
    } catch (err) { setError(getErrorMessage(err)); }
  }
  function adminLogout() { logout(); window.location.href = "/admin/login"; }

  return <main className="page-wrap admin-wrap"><section className="dashboard-welcome admin-welcome"><div className="admin-title-row"><div><span className="section-eyebrow">KOMPETENZEN TECHNOLOGIES</span><h1>Admin Dashboard</h1><p>Welcome, {user?.name || "Administrator"}. Manage the learning platform.</p></div><button className="button button-outline" onClick={adminLogout}>Log out</button></div><div className="dashboard-summary"><div><span>Registered students</span><strong>{students.length}</strong></div><div><span>Enquiries</span><strong>{enquiries.length}</strong></div><div><span>Programs</span><strong>{programs.length}</strong></div></div></section>
    <section className="admin-management"><div className="admin-tabs"><button className={tab === "students" ? "admin-tab active" : "admin-tab"} onClick={() => setTab("students")}>Students ({students.length})</button><button className={tab === "enquiries" ? "admin-tab active" : "admin-tab"} onClick={() => setTab("enquiries")}>Enquiries ({enquiries.length})</button><button className={tab === "programs" ? "admin-tab active" : "admin-tab"} onClick={() => setTab("programs")}>Program CRUD ({programs.length})</button><button className="admin-tab refresh-tab" onClick={loadData}>Refresh</button></div>
      {error && <div className="alert alert-error" role="alert">{error}</div>}{notice && <div className="alert alert-success" role="status">{notice}</div>}
      {loading ? <div className="empty-state">Loading admin data…</div> : <>
        {tab === "students" && <DataTable headers={["Name", "Email", "Phone", "City", "Qualification", "Pathway"]} rows={students.map((student) => [student.name, student.email, student.phone, student.city, student.qualification, student.pathway])} empty="No student registrations yet." />}
        {tab === "enquiries" && <div className="table-scroll"><table className="data-table"><thead><tr>{["Name", "Email", "Phone", "Pathway", "Interested In", "Question / Learning goal", "Date", "Status"].map((head) => <th key={head}>{head}</th>)}</tr></thead><tbody>{enquiries.map((entry) => <tr key={entry.id}><td>{entry.studentName || "—"}</td><td>{entry.email}</td><td>{entry.phone || "—"}</td><td>{entry.pathway}</td><td>{entry.selectedItem || entry.interest || "General enquiry"}</td><td>{entry.learningGoal || entry.message || "—"}</td><td>{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : "—"}</td><td><select className="table-select" value={entry.status} onChange={(e) => updateEnquiry(entry, e.target.value)}><option>New</option><option>Contacted</option><option>Closed</option></select></td></tr>)}{!enquiries.length && <tr><td colSpan="8" className="empty-cell">No enquiries yet.</td></tr>}</tbody></table></div>}
        {tab === "programs" && <>
          <div className="program-admin-toolbar"><div><h2>Program Management</h2><p>Update shows edit fields; Save persists changes through Axios.</p></div><button className="button" onClick={() => { setShowAdd((v) => !v); setEditingId(null); setDraft(null); }}>{showAdd ? "Close Add Form" : "+ Add Program"}</button></div>
          {showAdd && <form className="program-editor add-editor" onSubmit={addProgram}><h3>Add new program</h3><ProgramFields value={newProgram} onChange={changeNew} /><div className="editor-actions"><button className="button" type="submit">Save Program</button><button className="button button-outline" type="button" onClick={() => setShowAdd(false)}>Cancel</button></div></form>}
          <div className="table-scroll"><table className="data-table"><thead><tr>{["ID", "Pathway", "Program", "Focus Areas / Description", "Status", "Actions"].map((head) => <th key={head}>{head}</th>)}</tr></thead><tbody>{programs.map((program) => { const editing = editingId === program.id; return <tr key={program.id}>
            <td>{program.id}</td>
            <td>{editing ? <select className="table-input" name="pathway" value={draft.pathway} onChange={changeDraft}><option>Technical</option><option>Sales</option><option>B-School</option></select> : program.pathway}</td>
            <td>{editing ? <input className="table-input" name="name" value={draft.name} onChange={changeDraft} required /> : <strong>{program.name}</strong>}</td>
            <td>{editing ? <div className="inline-edit-fields"><input className="table-input" name="focusAreas" value={draft.focusAreas} onChange={changeDraft} required placeholder="Focus areas" /><textarea className="table-input" name="description" rows="2" value={draft.description} onChange={changeDraft} required placeholder="Description" /></div> : <><span>{program.focusAreas}</span><small className="table-description">{program.description}</small></>}</td>
            <td>{editing ? <select className="table-input" name="status" value={draft.status} onChange={changeDraft}><option>Available</option><option>Not Available</option></select> : <span className={`status-pill ${program.status === "Available" ? "status-open" : "status-closed"}`}>{program.status}</span>}</td>
            <td className="action-cell">{editing ? <div className="row-actions"><button className="mini-button save" onClick={saveEdit}>Save</button><button className="mini-button delete" onClick={() => deleteProgram(program)}>Delete</button><button className="mini-button cancel" onClick={cancelEdit}>Cancel</button></div> : <button className="mini-button update" onClick={() => startEdit(program)}>Update</button>}</td>
          </tr>; })}{!programs.length && <tr><td colSpan="6" className="empty-cell">No programs available.</td></tr>}</tbody></table></div>
        </>}
      </>}
    </section>
  </main>;
}

function ProgramFields({ value, onChange }) {
  return <div className="program-fields-grid"><label>Pathway<select name="pathway" value={value.pathway} onChange={onChange}><option>Technical</option><option>Sales</option><option>B-School</option></select></label><label>Program name<input name="name" value={value.name} onChange={onChange} required maxLength="150" /></label><label>Focus areas<input name="focusAreas" value={value.focusAreas} onChange={onChange} required maxLength="500" /></label><label>Status<select name="status" value={value.status} onChange={onChange}><option>Available</option><option>Not Available</option></select></label><label className="field-wide">Description<textarea name="description" value={value.description} onChange={onChange} required rows="3" maxLength="1500" /></label></div>;
}

function DataTable({ headers, rows, empty }) {
  return <div className="table-scroll"><table className="data-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((value, i) => <td key={i}>{value || "—"}</td>)}</tr>)}{!rows.length && <tr><td className="empty-cell" colSpan={headers.length}>{empty}</td></tr>}</tbody></table></div>;
}

function NotFound() {
  return <main className="page-wrap not-found"><span className="section-eyebrow">404</span><h1>Page not found</h1><p>The page you requested does not exist.</p><Link className="button" to="/">Return to Home</Link></main>;
}

export default function App() {
  return <div className="app-shell"><Header /><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/programs" element={<ProgramsPage />} />
    <Route path="/enquiry" element={<EnquiryPage />} />
    <Route path="/register" element={<StudentRegisterPage />} />
    <Route path="/login" element={<LoginPage role="student" />} />
    <Route path="/admin/login" element={<LoginPage role="admin" />} />
    <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
    <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/programs" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes><Footer /></div>;
}
