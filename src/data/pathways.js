export const pathways = [
  {
    id: "technical",
    name: "Technical",
    subtitle: "Technology & digital skills",
    description: "Explore programming, software development, AI and emerging digital technologies.",
    topics: ["Python", "Java", "JavaScript", "React", "HTML & CSS", "Full Stack Development", "Artificial Intelligence", "Machine Learning", "Data Science", "Data Analytics", "Cybersecurity"],
    icon: "code"
  },
  {
    id: "sales",
    name: "Sales",
    subtitle: "Sales & business development",
    description: "Explore customer engagement, sales strategy, negotiation and business development.",
    topics: ["B2B Sales", "Lead Generation", "CRM", "Sales Communication", "Negotiation", "Client Relationships", "Sales Strategy", "Business Development", "Sales Engineering"],
    icon: "trending"
  },
  {
    id: "bschool",
    name: "B-School",
    subtitle: "Business & corporate readiness",
    description: "Explore business operations, human resources, communication and workplace readiness.",
    topics: ["Human Resource Management", "Recruitment", "HRMS", "Payroll Concepts", "Business Communication", "Business Operations", "Management Fundamentals", "Professional Skills", "Corporate Readiness"],
    icon: "briefcase"
  }
];

export const PATHWAYS = pathways;

export function getPathway(name) {
  const value = String(name || "").toLowerCase();
  return pathways.find((item) => item.name.toLowerCase() === value || item.id === value);
}

export function getPathwayTopics(name) {
  return getPathway(name)?.topics || [];
}

export default pathways;
