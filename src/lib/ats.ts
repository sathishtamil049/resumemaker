import type { AtsCheck, AtsReport, CheckStatus, ResumeData } from "../types";
import { wordCount } from "./utils";

const ACTION_VERBS = [
  "led", "built", "shipped", "designed", "architected", "launched", "drove",
  "owned", "created", "developed", "implemented", "reduced", "increased",
  "improved", "delivered", "mentored", "automated", "scaled", "migrated",
  "optimized", "spearheaded", "managed", "coordinated", "negotiated",
  "streamlined", "refactored", "cut", "boosted", "won", "published",
  "presented", "taught", "founded", "grew", "saved", "accelerated",
];

const STOPWORDS = new Set(
  "a,an,the,and,or,of,to,in,on,for,with,is,are,was,be,been,our,we,you,your,their,they,will,that,this,as,at,by,from,have,has,had,it,its,can,able,across,who,whom,which,when,where,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,s,t,don,should,now,plus,per,via,etc,years,year,experience,experienced,skills,skill,strong,working,knowledge,familiar,bonus,plus,required,requirements,requirement,preferred,preferred,plus,hiring,hire,looking,join,team,teams,role,roles,position,work,job,company,companies,ideal,candidate,candidates,applicant,applicants,excellent,great,good,understanding,ability,proficient,proficiency,related,relevant,new,well,us".split(
    ","
  )
);

const TECH_TERMS = [
  "php", "laravel", "mysql", "postgresql", "redis", "docker", "kubernetes",
  "aws", "azure", "gcp", "react", "vue", "angular", "typescript", "javascript",
  "node.js", "nodejs", "python", "django", "flask", "java", "spring", "c#",
  ".net", "go", "golang", "rust", "swift", "kotlin", "flutter", "rest api",
  "rest", "graphql", "ci/cd", "cicd", "git", "agile", "scrum", "phpunit",
  "jest", "terraform", "linux", "nginx", "apache", "html", "css", "sass",
  "tailwind", "bootstrap", "jquery", "wordpress", "woocommerce", "mongodb",
  "clickhouse", "kafka", "rabbitmq", "elasticsearch", "microservices",
  "websockets", "oauth", "junit", "devops", "saas",
];

export function resumeFullText(d: ResumeData): string {
  const parts: string[] = [
    d.summary,
    ...d.experience.flatMap((e) => [e.role, e.company, ...e.bullets]),
    ...d.education.flatMap((e) => [e.degree, e.school, e.details]),
    ...d.skills.map((s) => s.name),
    ...d.technical.map((s) => s.name),
    ...d.projects.flatMap((p) => [p.name, p.tech, p.description]),
    ...d.certifications.map((c) => c.name),
    ...d.languages.map((l) => l.name),
    ...d.achievements.map((a) => a.text),
    ...d.custom.flatMap((c) => [c.title, ...c.items.map((i) => `${i.heading} ${i.text}`)]),
  ];
  return parts.join(" ").toLowerCase();
}

export function extractKeywords(jd: string): string[] {
  const lower = jd.toLowerCase().replace(/[^a-z0-9+#./\s-]/g, " ");
  const found = new Set<string>();
  for (const term of TECH_TERMS) {
    const probe = term.replace(/[.#/]/g, "[.#/]?");
    if (new RegExp(`\\b${probe}`, "i").test(lower)) found.add(term);
  }
  const freq: Record<string, number> = {};
  for (const tok of lower.split(/[^a-z0-9+#.]+/)) {
    if (tok.length < 3 || STOPWORDS.has(tok) || /^\d+$/.test(tok)) continue;
    freq[tok] = (freq[tok] || 0) + 1;
  }
  const ranked = Object.entries(freq)
    .filter(([t]) => !found.has(t))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14)
    .map(([t]) => t);
  return [...found, ...ranked].slice(0, 20);
}

const mk = (id: string, label: string, status: CheckStatus, detail: string): AtsCheck => ({
  id,
  label,
  status,
  detail,
});

export function computeATS(d: ResumeData, jd?: string): AtsReport {
  const checks: AtsCheck[] = [];
  let score = 0;
  const p = d.personal;

  // contact
  const contactBits = [!!p.email, !!p.phone, !!p.location].filter(Boolean).length;
  if (contactBits === 3) {
    checks.push(mk("contact", "Contact information", "pass", "Email, phone and location are all present."));
    score += 10;
  } else if (contactBits > 0) {
    checks.push(mk("contact", "Contact information", "warn", "Add the missing pieces — email, phone, location."));
    score += 6;
  } else {
    checks.push(mk("contact", "Contact information", "fail", "No contact details found. Recruiters can't reach you."));
  }

  // summary
  const sw = wordCount(d.summary);
  if (sw >= 25 && sw <= 90) {
    checks.push(mk("summary", "Profile summary", "pass", `${sw} words — a tight, scannable pitch.`));
    score += 10;
  } else if (sw > 0) {
    checks.push(mk("summary", "Profile summary", "warn", sw < 25 ? `Only ${sw} words — expand it toward 30–60 words.` : `${sw} words — trim it toward 30–60 words.`));
    score += 6;
  } else {
    checks.push(mk("summary", "Profile summary", "warn", "Add a 2–3 sentence summary with your title, years and strengths."));
  }

  // experience
  const jobs = d.experience.length;
  if (jobs >= 2) {
    checks.push(mk("exp", "Work experience", "pass", `${jobs} roles listed with dates.`));
    score += 14;
  } else if (jobs === 1) {
    checks.push(mk("exp", "Work experience", "warn", "One role listed — add internships or freelance work if you have any."));
    score += 8;
  } else {
    checks.push(mk("exp", "Work experience", "fail", "No work experience entries. Add roles, internships or freelance projects."));
  }

  // bullets
  const allBullets = d.experience.flatMap((e) => e.bullets);
  const avg = jobs ? allBullets.length / jobs : 0;
  if (avg >= 3) {
    checks.push(mk("bullets", "Experience detail", "pass", `Averaging ${avg.toFixed(1)} bullet points per role.`));
    score += 8;
  } else if (avg >= 2) {
    checks.push(mk("bullets", "Experience detail", "warn", "Aim for 3–5 bullet points per role."));
    score += 5;
  } else {
    checks.push(mk("bullets", "Experience detail", "fail", jobs ? "Your roles need achievement bullets, not just titles." : "Add bullet points under each role."));
  }

  // action verbs
  const verbHits = allBullets.filter((b) =>
    ACTION_VERBS.includes(b.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") ?? "")
  ).length;
  const verbPct = allBullets.length ? verbHits / allBullets.length : 0;
  if (allBullets.length && verbPct >= 0.6) {
    checks.push(mk("verbs", "Action verbs", "pass", `${Math.round(verbPct * 100)}% of bullets open with strong verbs like “led” or “shipped”.`));
    score += 5;
  } else if (allBullets.length && verbPct >= 0.3) {
    checks.push(mk("verbs", "Action verbs", "warn", "Start more bullets with verbs — led, built, reduced, shipped…"));
    score += 3;
  } else {
    checks.push(mk("verbs", "Action verbs", "warn", "Open each bullet with an action verb instead of “Responsible for…”."));
    score += 1;
  }

  // quantified results
  const numHits = allBullets.filter((b) => /\d/.test(b)).length;
  const numPct = allBullets.length ? numHits / allBullets.length : 0;
  if (allBullets.length && numPct >= 0.4) {
    checks.push(mk("nums", "Quantified results", "pass", `${Math.round(numPct * 100)}% of bullets include numbers — metrics recruiters trust.`));
    score += 6;
  } else if (numHits > 0) {
    checks.push(mk("nums", "Quantified results", "warn", "Add more numbers: %, time saved, users served, revenue impact."));
    score += 3;
  } else {
    checks.push(mk("nums", "Quantified results", "warn", "No numbers found. Quantify at least a few bullets (%, ₹/$, counts)."));
    score += 1;
  }

  // education
  if (d.education.length) {
    checks.push(mk("edu", "Education", "pass", `${d.education.length} ${d.education.length === 1 ? "entry" : "entries"} with institution and dates.`));
    score += 10;
  } else {
    checks.push(mk("edu", "Education", "fail", "Add your highest qualification — most ATS filters require it."));
  }

  // skills
  const skillCount = d.skills.length + d.technical.length;
  if (skillCount >= 8) {
    checks.push(mk("skills", "Skills section", "pass", `${skillCount} skills listed — good keyword surface for parsers.`));
    score += 10;
  } else if (skillCount >= 5) {
    checks.push(mk("skills", "Skills section", "warn", `${skillCount} skills — list 8–12 to widen keyword matching.`));
    score += 6;
  } else if (skillCount > 0) {
    checks.push(mk("skills", "Skills section", "warn", "Only a handful of skills — mirror the keywords from target job posts."));
    score += 3;
  } else {
    checks.push(mk("skills", "Skills section", "fail", "No skills listed. ATS engines rank resumes heavily on skill keywords."));
  }

  // dates
  const withDates = d.experience.filter((e) => e.start).length;
  if (jobs && withDates === jobs) {
    checks.push(mk("dates", "Employment dates", "pass", "Every role has a start date."));
    score += 5;
  } else if (withDates > 0) {
    checks.push(mk("dates", "Employment dates", "warn", "Some roles are missing dates — gaps make parsers suspicious."));
    score += 3;
  } else {
    checks.push(mk("dates", "Employment dates", "warn", jobs ? "Add dates to every role." : "Dates will appear once you add experience."));
    score += 1;
  }

  // links
  if (p.linkedin || p.github || p.website || d.links.length) {
    checks.push(mk("links", "Online presence", "pass", "Portfolio / social links found."));
    score += 5;
  } else {
    checks.push(mk("links", "Online presence", "warn", "Add a LinkedIn, GitHub or portfolio link."));
    score += 2;
  }

  // extra sections
  if (d.projects.length || d.certifications.length) {
    checks.push(mk("extra", "Projects & certifications", "pass", "Extra sections add credibility and keywords."));
    score += 7;
  } else {
    checks.push(mk("extra", "Projects & certifications", "warn", "Add projects or certifications — cheap credibility."));
    score += 3;
  }

  // volume
  const total = wordCount(resumeFullText(d));
  if (total >= 350) {
    checks.push(mk("volume", "Content depth", "pass", `${total} words — comfortably fills one page, likely two.`));
    score += 10;
  } else if (total >= 180) {
    checks.push(mk("volume", "Content depth", "warn", `${total} words — a little thin. Flesh out bullets and projects.`));
    score += 6;
  } else {
    checks.push(mk("volume", "Content depth", "fail", `${total} words — too little substance for recruiters or parsers.`));
  }

  // keywords vs JD
  let keywords: AtsReport["keywords"] = null;
  if (jd && jd.trim().length > 40) {
    const text = resumeFullText(d);
    const kws = extractKeywords(jd);
    const matched = kws.filter((k) => text.includes(k));
    const missing = kws.filter((k) => !text.includes(k));
    const coverage = kws.length ? Math.round((matched.length / kws.length) * 100) : 100;
    keywords = { matched, missing, coverage };
    score = Math.round(score * 0.8 + coverage * 0.2);
  }

  score = Math.min(100, Math.max(2, score));
  const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : "D";
  return { score, grade, wordCount: total, checks, keywords };
}
