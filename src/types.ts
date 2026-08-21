export type Plan = "free" | "pro" | "premium";

export type SectionKey =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "technical"
  | "projects"
  | "certifications"
  | "languages"
  | "achievements"
  | "hobbies"
  | "references"
  | "links"
  | "custom";

export interface Personal {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  location: string;
  start: string;
  end: string;
  grade: string;
  details: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  link: string;
  tech: string;
  description: string;
}

export interface CertItem {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: number; // 1..5
}

export interface LanguageItem {
  id: string;
  name: string;
  level: number; // 1..5
}

export interface ReferenceItem {
  id: string;
  name: string;
  role: string;
  contact: string;
}

export interface LinkItem {
  id: string;
  label: string;
  url: string;
}

export interface CustomSectionItem {
  id: string;
  heading: string;
  sub: string;
  date: string;
  text: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export interface ResumeData {
  personal: Personal;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  technical: SkillItem[];
  projects: ProjectItem[];
  certifications: CertItem[];
  languages: LanguageItem[];
  achievements: { id: string; text: string }[];
  hobbies: { id: string; name: string }[];
  references: ReferenceItem[];
  links: LinkItem[];
  custom: CustomSection[];
}

export interface Resume {
  id: string;
  ownerId: string;
  title: string;
  slug: string;
  isPublic: boolean;
  templateId: string;
  accent: string | null;
  fontScale: number; // 0.9 .. 1.15
  sectionOrder: SectionKey[];
  data: ResumeData;
  createdAt: number;
  updatedAt: number;
  downloads: number;
  views: number;
  activity: Record<string, { d: number; v: number }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  pass: string;
  plan: Plan;
  isAdmin?: boolean;
  suspended?: boolean;
  createdAt: number;
}

export type CheckStatus = "pass" | "warn" | "fail";

export interface AtsCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface KeywordReport {
  matched: string[];
  missing: string[];
  coverage: number; // 0..100
}

export interface AtsReport {
  score: number;
  grade: string;
  wordCount: number;
  checks: AtsCheck[];
  keywords: KeywordReport | null;
}
