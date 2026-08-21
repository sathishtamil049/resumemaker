import type { Resume, ResumeData } from "../types";
import { DEFAULT_ORDER } from "./templates";
import { slugify, todayKey, uid } from "./utils";

export function emptyData(): ResumeData {
  return {
    personal: {
      fullName: "",
      jobTitle: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    technical: [],
    projects: [],
    certifications: [],
    languages: [],
    achievements: [],
    hobbies: [],
    references: [],
    links: [],
    custom: [],
  };
}

export function sampleData(): ResumeData {
  return {
    personal: {
      fullName: "Sathish VT",
      jobTitle: "Senior Software Developer",
      email: "sathish.vt@example.com",
      phone: "+91 98765 43210",
      location: "Bengaluru, India",
      website: "sathishvt.dev",
      linkedin: "linkedin.com/in/sathish-vt",
      github: "github.com/sathishvt",
    },
    summary:
      "Software developer with 6+ years of experience designing, building and shipping web applications end-to-end. Strong in PHP, Laravel and modern JavaScript stacks, with a track record of cutting page-load times, raising test coverage and mentoring junior engineers. Comfortable owning features from database schema to pixel-perfect UI.",
    experience: [
      {
        id: "x1",
        role: "Senior Software Developer",
        company: "Nimbus Labs",
        location: "Bengaluru",
        start: "Mar 2022",
        end: "",
        current: true,
        bullets: [
          "Lead a team of 5 building a multi-tenant billing platform serving 40,000+ merchants on PHP 8.3 and Laravel.",
          "Re-architected the reporting pipeline, cutting p95 query time from 4.2s to 380ms.",
          "Introduced contract tests and CI gates, raising release confidence and reducing rollbacks by 70%.",
          "Mentor 3 junior developers through weekly pairing sessions and code-review clinics.",
        ],
      },
      {
        id: "x2",
        role: "Software Developer",
        company: "Brightpath Technologies",
        location: "Chennai",
        start: "Jun 2019",
        end: "Feb 2022",
        current: false,
        bullets: [
          "Built and maintained 12 client-facing portals with Laravel, MySQL and Vue, handling 1M+ requests per day.",
          "Shipped a real-time notification service with WebSockets adopted by 9 enterprise clients.",
          "Reduced cloud spend 28% by profiling slow jobs and right-sizing queues and workers.",
        ],
      },
      {
        id: "x3",
        role: "Junior Web Developer",
        company: "Craftline Studio",
        location: "Coimbatore",
        start: "Jul 2017",
        end: "May 2019",
        current: false,
        bullets: [
          "Developed responsive marketing sites and WooCommerce stores for 20+ small businesses.",
          "Automated deployment with shell scripts, cutting release time from 40 minutes to 5.",
        ],
      },
    ],
    education: [
      {
        id: "e1",
        degree: "B.E. Computer Science & Engineering",
        school: "PSG College of Technology",
        location: "Coimbatore",
        start: "2013",
        end: "2017",
        grade: "8.7 / 10 CGPA",
        details: "Final-year project: distributed task scheduler in Erlang. Member, ACM student chapter.",
      },
      {
        id: "e2",
        degree: "Higher Secondary (Maths & CS)",
        school: "GVS Hr. Sec. School",
        location: "Coimbatore",
        start: "2011",
        end: "2013",
        grade: "94.2%",
        details: "",
      },
    ],
    skills: [
      { id: "s1", name: "Problem Solving", level: 5 },
      { id: "s2", name: "Team Leadership", level: 4 },
      { id: "s3", name: "Communication", level: 4 },
      { id: "s4", name: "Agile / Scrum", level: 4 },
      { id: "s5", name: "Code Review", level: 5 },
      { id: "s6", name: "Time Management", level: 4 },
    ],
    technical: [
      { id: "t1", name: "PHP / Laravel", level: 5 },
      { id: "t2", name: "MySQL / PostgreSQL", level: 4 },
      { id: "t3", name: "JavaScript / TypeScript", level: 4 },
      { id: "t4", name: "React / Vue", level: 4 },
      { id: "t5", name: "Docker / CI-CD", level: 3 },
      { id: "t6", name: "Redis / Queues", level: 4 },
    ],
    projects: [
      {
        id: "p1",
        name: "InvoiceForge",
        link: "github.com/sathishvt/invoiceforge",
        tech: "Laravel · MySQL · Vue",
        description:
          "Open-source invoicing tool with GST-ready templates; 1.2k GitHub stars and 30+ contributors.",
      },
      {
        id: "p2",
        name: "QueryLens",
        link: "querylens.dev",
        tech: "TypeScript · Node · ClickHouse",
        description:
          "Developer tool that visualizes slow-query logs and suggests index changes; used by 3 teams internally.",
      },
    ],
    certifications: [
      { id: "c1", name: "AWS Certified Developer — Associate", issuer: "Amazon Web Services", year: "2023" },
      { id: "c2", name: "Laravel Certified Architect (path)", issuer: "Laracasts", year: "2022" },
    ],
    languages: [
      { id: "l1", name: "English", level: 5 },
      { id: "l2", name: "Tamil", level: 5 },
      { id: "l3", name: "Hindi", level: 3 },
    ],
    achievements: [
      { id: "a1", text: "Winner — Smart India Hackathon 2016 (fintech track, 1 of 40 teams)." },
      { id: "a2", text: "Speaker — Laravel Meetup Bengaluru: “Taming N+1s at scale” (2023)." },
      { id: "a3", text: "Employee of the Quarter, Q2 2021 at Brightpath Technologies." },
    ],
    hobbies: [
      { id: "h1", name: "Street photography" },
      { id: "h2", name: "Trail running" },
      { id: "h3", name: "Chess puzzles" },
      { id: "h4", name: "Mechanical keyboards" },
    ],
    references: [
      {
        id: "r1",
        name: "Anita Krishnan",
        role: "Engineering Manager, Nimbus Labs",
        contact: "anita.k@nimbuslabs.io · +91 98450 11223",
      },
      {
        id: "r2",
        name: "Rahul Menon",
        role: "CTO, Brightpath Technologies",
        contact: "rahul@brightpath.tech",
      },
    ],
    links: [
      { id: "k1", label: "Portfolio", url: "sathishvt.dev" },
      { id: "k2", label: "GitHub", url: "github.com/sathishvt" },
      { id: "k3", label: "LinkedIn", url: "linkedin.com/in/sathish-vt" },
    ],
    custom: [
      {
        id: "cu1",
        title: "Volunteering",
        items: [
          {
            id: "ci1",
            heading: "Teaching Assistant — Code for Kids",
            sub: "Weekend Python workshops",
            date: "2020 — 2022",
            text: "Taught basics of programming to 60+ school students across 8 workshops.",
          },
        ],
      },
    ],
  };
}

export function buildResume(
  ownerId: string,
  title: string,
  templateId: string,
  data: ResumeData,
  extra?: Partial<Resume>
): Resume {
  const now = Date.now();
  return {
    id: uid(),
    ownerId,
    title,
    slug: slugify(data.personal.fullName || title) + "-" + uid().slice(0, 3),
    isPublic: false,
    templateId,
    accent: null,
    fontScale: 1,
    sectionOrder: [...DEFAULT_ORDER],
    data,
    createdAt: now,
    updatedAt: now,
    downloads: 0,
    views: 0,
    activity: {},
    ...extra,
  };
}

export const SAMPLE_JD = `We are hiring a Senior PHP Developer to own our billing platform.
Requirements: 5+ years with PHP 8 and Laravel, deep MySQL optimisation,
Redis caching, queue workers, REST API design, Docker and CI/CD pipelines,
unit testing with PHPUnit, and working knowledge of AWS. Experience
mentoring junior engineers and shipping high-traffic production systems
is a strong plus. TypeScript and React familiarity is a bonus.`;
