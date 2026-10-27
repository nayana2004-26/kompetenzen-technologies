require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "local-development-secret-change-before-deploy";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@kompetenzen.demo").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const ROOT = path.join(__dirname, "..");
const DB_FILE = process.env.DB_FILE || path.join(ROOT, "db", "db.json");
const DIST_DIR = path.join(ROOT, "dist");

const seedPrograms = [
  { id: "P001", pathway: "Technical", name: "Programming Fundamentals", focusAreas: "Python, Java, JavaScript", description: "Explore programming fundamentals and problem-solving skills.", status: "Available" },
  { id: "P002", pathway: "Technical", name: "Full Stack Development", focusAreas: "HTML, CSS, React, Node.js", description: "Explore frontend and backend web development concepts.", status: "Available" },
  { id: "P003", pathway: "Technical", name: "AI, ML and Data Science", focusAreas: "Artificial Intelligence, Machine Learning, Data Analytics", description: "Explore modern AI concepts and data-driven problem solving.", status: "Available" },
  { id: "P004", pathway: "Technical", name: "Cybersecurity Fundamentals", focusAreas: "Cybersecurity, Network Safety, Security Awareness", description: "Learn introductory cybersecurity concepts and safe computing practices.", status: "Available" },
  { id: "P005", pathway: "Sales", name: "Sales and Business Development", focusAreas: "Lead Generation, CRM, Sales Strategy", description: "Explore sales processes, customer engagement and business development.", status: "Available" },
  { id: "P006", pathway: "Sales", name: "B2B Sales and Negotiation", focusAreas: "B2B Sales, Negotiation, Client Relationships", description: "Build foundational knowledge of business-to-business selling and negotiation.", status: "Available" },
  { id: "P007", pathway: "B-School", name: "Business Management Fundamentals", focusAreas: "Management, Business Operations, Communication", description: "Explore business management concepts and professional communication.", status: "Available" },
  { id: "P008", pathway: "B-School", name: "HR and Corporate Readiness", focusAreas: "HR, Recruitment, HRMS, Workplace Readiness", description: "Explore human resources concepts and corporate-readiness skills.", status: "Available" }
];

function ensureDb() {
  const folder = path.dirname(DB_FILE);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], programs: seedPrograms, enquiries: [] }, null, 2));
  }
}

function readDb() {
  ensureDb();
  const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  db.users = Array.isArray(db.users) ? db.users : [];
  db.programs = Array.isArray(db.programs) ? db.programs : [...seedPrograms];
  db.enquiries = Array.isArray(db.enquiries) ? db.enquiries : [];
  return db;
}

function writeDb(db) {
  ensureDb();
  const temp = `${DB_FILE}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(temp, DB_FILE);
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function publicUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

function makeToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ message: "Please log in first." });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = readDb().users.find((entry) => entry.id === payload.id && entry.role === payload.role);
    if (!user) return res.status(401).json({ message: "Account not found." });
    req.user = publicUser(user);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session. Please log in again." });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Administrator access is required." });
  next();
}

function validPathway(value) {
  return ["Technical", "Sales", "B-School"].includes(value);
}

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/programs", (req, res) => {
  try {
    const db = readDb();
    let items = db.programs;
    const pathway = text(req.query.pathway);
    const search = text(req.query.search).toLowerCase();
    if (pathway && pathway !== "All") items = items.filter((p) => p.pathway === pathway);
    if (search) {
      items = items.filter((p) => [p.id, p.name, p.pathway, p.focusAreas, p.description, p.status]
        .some((v) => String(v || "").toLowerCase().includes(search)));
    }
    res.json(items);
  } catch (error) {
    console.error("GET programs error:", error);
    res.status(500).json({ message: "Could not read programs." });
  }
});

app.post("/api/enquiries", (req, res) => {
  try {
    const studentName = text(req.body.studentName || req.body.name);
    const email = text(req.body.email).toLowerCase();
    const phone = text(req.body.phone);
    const city = text(req.body.city);
    const pathway = text(req.body.pathway);
    const selectedItem = text(req.body.selectedItem || req.body.interest);
    const itemType = text(req.body.itemType) || "general";
    const message = text(req.body.message || req.body.learningGoal);

    if (!studentName || !email || !phone || !validPathway(pathway) || !selectedItem) {
      return res.status(400).json({ message: "Please complete your name, email, phone, pathway and topic/program." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Phone number must contain exactly 10 digits." });
    }
    if (studentName.length > 100 || city.length > 100 || selectedItem.length > 150 || message.length > 1000) {
      return res.status(400).json({ message: "One or more fields are too long." });
    }

    const db = readDb();
    const now = new Date().toISOString();
    const enquiry = {
      id: `enq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      studentId: null,
      studentName,
      email,
      phone,
      city,
      pathway,
      selectedItem,
      itemType,
      learningGoal: message,
      message,
      status: "New",
      createdAt: now
    };
    db.enquiries.push(enquiry);
    writeDb(db);
    return res.status(201).json({ message: "Your enquiry has been submitted successfully.", enquiry });
  } catch (error) {
    console.error("Public enquiry error:", error);
    return res.status(500).json({ message: "Could not submit the enquiry. Please try again." });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const name = text(req.body.name);
    const email = text(req.body.email).toLowerCase();
    const phone = text(req.body.phone);
    const city = text(req.body.city);
    const qualification = text(req.body.qualification);
    const pathway = text(req.body.pathway);
    const learningGoal = text(req.body.learningGoal);
    const password = req.body.password;

    if (!name || !email || !phone || !city || !qualification || !validPathway(pathway) || !learningGoal || typeof password !== "string") {
      return res.status(400).json({ message: "Please complete all required fields." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address." });
    if (!/^\d{10}$/.test(phone)) return res.status(400).json({ message: "Phone number must contain exactly 10 digits." });
    if (password.length < 8) return res.status(400).json({ message: "Password must contain at least 8 characters." });
    if (password.length > 128) return res.status(400).json({ message: "Password is too long." });

    const db = readDb();
    if (db.users.some((user) => user.email === email)) return res.status(409).json({ message: "This email is already registered. Please log in or use another email." });

    const now = new Date().toISOString();
    const student = {
      id: `stu-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name, email, phone, city, qualification, pathway, learningGoal,
      passwordHash: await bcrypt.hash(password, 10),
      role: "student",
      createdAt: now
    };
    db.users.push(student);
    const enquiry = {
      id: `enq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      studentId: student.id,
      studentName: student.name,
      email: student.email,
      phone: student.phone,
      pathway: student.pathway,
      learningGoal: student.learningGoal,
      status: "New",
      createdAt: now
    };
    db.enquiries.push(enquiry);
    writeDb(db);
    res.status(201).json({ message: "Registration successful.", token: makeToken(student), user: publicUser(student), enquiryId: enquiry.id });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed. Check the backend terminal." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = text(req.body.email).toLowerCase();
    const password = req.body.password;
    const role = req.body.role === "admin" ? "admin" : "student";
    if (!email || typeof password !== "string" || !password) return res.status(400).json({ message: "Enter your email and password." });
    const user = readDb().users.find((entry) => entry.email === email && entry.role === role);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: "Invalid email or password." });
    res.json({ message: "Login successful.", token: makeToken(user), user: publicUser(user) });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed. Check the backend terminal." });
  }
});

app.get("/api/auth/me", authenticate, (req, res) => res.json({ user: req.user }));

app.get("/api/admin/students", authenticate, requireAdmin, (req, res) => {
  res.json(readDb().users.filter((user) => user.role === "student").map(publicUser));
});

app.get("/api/admin/enquiries", authenticate, requireAdmin, (req, res) => {
  const enquiries = readDb().enquiries.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(enquiries);
});

app.put("/api/admin/enquiries/:id", authenticate, requireAdmin, (req, res) => {
  const status = text(req.body.status);
  if (!["New", "Contacted", "Closed"].includes(status)) return res.status(400).json({ message: "Choose New, Contacted, or Closed." });
  const db = readDb();
  const entry = db.enquiries.find((item) => item.id === req.params.id);
  if (!entry) return res.status(404).json({ message: "Enquiry not found." });
  entry.status = status;
  writeDb(db);
  res.json(entry);
});

app.post("/api/programs", authenticate, requireAdmin, (req, res) => {
  const db = readDb();
  const program = {
    id: `P${Date.now()}`,
    pathway: text(req.body.pathway),
    name: text(req.body.name),
    focusAreas: text(req.body.focusAreas),
    description: text(req.body.description),
    status: text(req.body.status) || "Available"
  };
  if (!validPathway(program.pathway) || !program.name || !program.focusAreas || !program.description || !["Available", "Not Available"].includes(program.status)) {
    return res.status(400).json({ message: "Complete the program fields correctly." });
  }
  db.programs.push(program);
  writeDb(db);
  res.status(201).json(program);
});

app.put("/api/programs/:id", authenticate, requireAdmin, (req, res) => {
  const db = readDb();
  const index = db.programs.findIndex((p) => p.id === req.params.id);
  if (index < 0) return res.status(404).json({ message: "Program not found." });
  const program = {
    ...db.programs[index],
    pathway: text(req.body.pathway),
    name: text(req.body.name),
    focusAreas: text(req.body.focusAreas),
    description: text(req.body.description),
    status: text(req.body.status)
  };
  if (!validPathway(program.pathway) || !program.name || !program.focusAreas || !program.description || !["Available", "Not Available"].includes(program.status)) {
    return res.status(400).json({ message: "Complete the program fields correctly." });
  }
  db.programs[index] = program;
  writeDb(db);
  res.json(program);
});

app.delete("/api/programs/:id", authenticate, requireAdmin, (req, res) => {
  const db = readDb();
  const index = db.programs.findIndex((p) => p.id === req.params.id);
  if (index < 0) return res.status(404).json({ message: "Program not found." });
  const [program] = db.programs.splice(index, 1);
  writeDb(db);
  res.json({ message: "Program deleted.", program });
});

app.use("/api", (_req, res) => res.status(404).json({ message: "API endpoint not found." }));

// In production, Express serves the built React app and API from one origin.
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
}

async function start() {
  ensureDb();
  const db = readDb();
  if (!db.users.some((user) => user.email === ADMIN_EMAIL && user.role === "admin")) {
    db.users.push({
      id: "admin-main",
      name: "Kompetenzen Administrator",
      email: ADMIN_EMAIL,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: "admin",
      phone: "",
      city: "",
      qualification: "",
      pathway: "",
      learningGoal: "",
      createdAt: new Date().toISOString()
    });
    writeDb(db);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API running at http://localhost:${PORT}`);
    console.log(`Admin email: ${ADMIN_EMAIL}`);
    if (fs.existsSync(DIST_DIR)) console.log("Production React build is being served by Express.");
  });
}

start().catch((error) => {
  console.error("Could not start the API:", error);
  process.exit(1);
});
