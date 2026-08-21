import type { SectionKey } from "../types";

export interface TemplateTheme {
  id: string;
  name: string;
  blurb: string;
  tags: string[];
  free: boolean;
  accent: string;
  accentBright: string;
  ink: string;
  muted: string;
  headFont: string;
  bodyFont: string;
  headerStyle: "left" | "centered" | "banner";
  rule: "bar" | "line" | "hairline" | "center" | "none";
  levelStyle: "bar" | "dot" | "text";
  sidebar: null | { side: "left" | "right"; bg: string; text: string; dim: string };
  sidebarKeys: SectionKey[];
  chipBg: string;
  chipFg: string;
}

export const SECTION_LABELS: Record<SectionKey, string> = {
  summary: "Profile Summary",
  experience: "Work Experience",
  education: "Education",
  skills: "Core Skills",
  technical: "Technical Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
  achievements: "Achievements",
  hobbies: "Hobbies",
  references: "References",
  links: "Social Links",
  custom: "Custom Sections",
};

export const DEFAULT_ORDER: SectionKey[] = [
  "summary",
  "experience",
  "education",
  "technical",
  "skills",
  "projects",
  "certifications",
  "languages",
  "achievements",
  "hobbies",
  "references",
  "links",
  "custom",
];

export const ACCENT_SWATCHES = [
  "#157F4C",
  "#1D4E89",
  "#7C3AED",
  "#B45309",
  "#0F766E",
  "#9F1239",
  "#334155",
  "#8C6D2F",
];

export const THEMES: TemplateTheme[] = [
  {
    id: "green",
    name: "Modern Green",
    blurb: "Two-column with a deep evergreen sidebar and leaf-bright skill bars.",
    tags: ["Two-column", "Sidebar", "Popular"],
    free: true,
    accent: "#1E7A4A",
    accentBright: "#9CD08B",
    ink: "#1f2a24",
    muted: "#5c6b62",
    headFont: "'Trebuchet MS', 'Segoe UI', sans-serif",
    bodyFont: "'Calibri', 'Segoe UI', sans-serif",
    headerStyle: "left",
    rule: "bar",
    levelStyle: "bar",
    sidebar: { side: "left", bg: "#173F2E", text: "#EAF3EA", dim: "#A9C4AE" },
    sidebarKeys: ["technical", "skills", "languages", "certifications", "hobbies", "links"],
    chipBg: "rgba(30,122,74,0.10)",
    chipFg: "#1E7A4A",
  },
  {
    id: "blue",
    name: "Professional Blue",
    blurb: "Classic single-column with a confident navy band and serif headings.",
    tags: ["Single-column", "Corporate"],
    free: false,
    accent: "#1D4E89",
    accentBright: "#1D4E89",
    ink: "#232a31",
    muted: "#5a6672",
    headFont: "'Cambria', Georgia, serif",
    bodyFont: "'Calibri', 'Segoe UI', sans-serif",
    headerStyle: "left",
    rule: "line",
    levelStyle: "dot",
    sidebar: null,
    sidebarKeys: [],
    chipBg: "rgba(29,78,137,0.08)",
    chipFg: "#1D4E89",
  },
  {
    id: "black",
    name: "Minimal Black",
    blurb: "Swiss-style restraint — hairlines, tracking, and nothing else.",
    tags: ["Single-column", "Minimal"],
    free: false,
    accent: "#111111",
    accentBright: "#111111",
    ink: "#1a1a1a",
    muted: "#6b6b6b",
    headFont: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    bodyFont: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    headerStyle: "left",
    rule: "hairline",
    levelStyle: "dot",
    sidebar: null,
    sidebarKeys: [],
    chipBg: "rgba(0,0,0,0.06)",
    chipFg: "#1a1a1a",
  },
  {
    id: "purple",
    name: "Creative Purple",
    blurb: "Bold violet banner and right sidebar for design-forward roles.",
    tags: ["Two-column", "Creative"],
    free: false,
    accent: "#6D28D9",
    accentBright: "#C4B5FD",
    ink: "#2b2436",
    muted: "#6f6680",
    headFont: "'Trebuchet MS', 'Segoe UI', sans-serif",
    bodyFont: "'Segoe UI', Calibri, sans-serif",
    headerStyle: "banner",
    rule: "bar",
    levelStyle: "bar",
    sidebar: { side: "right", bg: "#4C1D95", text: "#F3EEFE", dim: "#C9B8F0" },
    sidebarKeys: ["skills", "technical", "languages", "hobbies", "links"],
    chipBg: "rgba(109,40,217,0.10)",
    chipFg: "#6D28D9",
  },
  {
    id: "exec",
    name: "Executive",
    blurb: "Centered serif masthead with antique-gold rules. Boardroom ready.",
    tags: ["Single-column", "Serif", "Leadership"],
    free: false,
    accent: "#8C6D2F",
    accentBright: "#8C6D2F",
    ink: "#26231e",
    muted: "#6e675c",
    headFont: "Georgia, 'Times New Roman', serif",
    bodyFont: "Georgia, 'Times New Roman', serif",
    headerStyle: "centered",
    rule: "center",
    levelStyle: "text",
    sidebar: null,
    sidebarKeys: [],
    chipBg: "rgba(140,109,47,0.10)",
    chipFg: "#8C6D2F",
  },
  {
    id: "ats",
    name: "ATS-Friendly",
    blurb: "Zero graphics, zero columns — parses perfectly in every ATS.",
    tags: ["Single-column", "Parser-safe"],
    free: true,
    accent: "#333333",
    accentBright: "#333333",
    ink: "#222222",
    muted: "#555555",
    headFont: "Arial, Helvetica, sans-serif",
    bodyFont: "Arial, Helvetica, sans-serif",
    headerStyle: "left",
    rule: "line",
    levelStyle: "text",
    sidebar: null,
    sidebarKeys: [],
    chipBg: "transparent",
    chipFg: "#222222",
  },
  {
    id: "fresher",
    name: "Student / Fresher",
    blurb: "Compact teal layout that leads with education and projects.",
    tags: ["Single-column", "Entry-level"],
    free: false,
    accent: "#0F766E",
    accentBright: "#0F766E",
    ink: "#22302e",
    muted: "#5f7370",
    headFont: "'Verdana', 'Segoe UI', sans-serif",
    bodyFont: "'Calibri', 'Segoe UI', sans-serif",
    headerStyle: "left",
    rule: "bar",
    levelStyle: "dot",
    sidebar: null,
    sidebarKeys: [],
    chipBg: "rgba(15,118,110,0.10)",
    chipFg: "#0F766E",
  },
  {
    id: "duo",
    name: "Two-Column Modern",
    blurb: "Charcoal sidebar, amber highlights — engineered and editorial.",
    tags: ["Two-column", "Sidebar", "Modern"],
    free: false,
    accent: "#B45309",
    accentBright: "#F2B65C",
    ink: "#23282d",
    muted: "#5d666e",
    headFont: "'Segoe UI', 'Helvetica Neue', sans-serif",
    bodyFont: "'Segoe UI', Calibri, sans-serif",
    headerStyle: "left",
    rule: "bar",
    levelStyle: "bar",
    sidebar: { side: "left", bg: "#232B33", text: "#ECEFF2", dim: "#A8B3BD" },
    sidebarKeys: ["technical", "skills", "languages", "certifications", "references", "links"],
    chipBg: "rgba(180,83,9,0.10)",
    chipFg: "#B45309",
  },
];

export const getTheme = (id: string): TemplateTheme =>
  THEMES.find((t) => t.id === id) ?? THEMES[0];

export const FREE_TEMPLATE_IDS = THEMES.filter((t) => t.free).map((t) => t.id);
