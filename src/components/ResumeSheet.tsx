import React from "react";
import type { Resume, SectionKey } from "../types";
import { getTheme, SECTION_LABELS, type TemplateTheme } from "../lib/templates";
import { initials, rangeLabel } from "../lib/utils";

const ph = (v: string, fallback: string) => v || fallback;

function Dots({ level, dark }: { level: number; dark?: boolean }) {
  return (
    <span className={`rs-dotrow ${dark ? "rs-dotrow-dark" : ""}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={i <= level ? "on" : ""} />
      ))}
    </span>
  );
}

function LevelViz({
  level,
  theme,
  dark,
}: {
  level: number;
  theme: TemplateTheme;
  dark?: boolean;
}) {
  if (theme.levelStyle === "bar")
    return (
      <span className={`rs-track block w-full mt-[0.35em] ${dark ? "rs-track-dark" : ""}`}>
        <span className="rs-fill block" style={{ width: `${level * 20}%` }} />
      </span>
    );
  if (theme.levelStyle === "dot") return <Dots level={level} dark={dark} />;
  return (
    <span style={{ fontSize: "0.85em", color: dark ? undefined : theme.muted }}>
      {["Familiar", "Basic", "Intermediate", "Advanced", "Expert"][level - 1] ?? "—"}
    </span>
  );
}

function SectionHeading({
  title,
  theme,
  accent,
  dark,
}: {
  title: string;
  theme: TemplateTheme;
  accent: string;
  dark?: boolean;
}) {
  if (dark && theme.sidebar) {
    return (
      <div className="mb-[0.9em]">
        <div className="rs-h" style={{ color: theme.sidebar.text, fontSize: "0.95em", letterSpacing: "0.18em" }}>
          {title}
        </div>
        <div style={{ width: "2.2em", height: "0.22em", background: theme.accentBright, marginTop: "0.45em", borderRadius: 2 }} />
      </div>
    );
  }
  const style: React.CSSProperties = {};
  if (theme.rule === "bar")
    return (
      <div className="flex items-center gap-[0.8em] mb-[0.9em]">
        <span className="rs-h" style={{ color: accent, ...style }}>{title}</span>
        <span className="flex-1" style={{ height: 2, background: `${accent}33` }} />
      </div>
    );
  if (theme.rule === "line")
    return (
      <div className="mb-[0.9em]" style={{ borderBottom: `2px solid ${accent}`, paddingBottom: "0.35em" }}>
        <span className="rs-h" style={{ color: theme.ink }}>{title}</span>
      </div>
    );
  if (theme.rule === "hairline")
    return (
      <div className="mb-[0.9em]" style={{ borderBottom: "1px solid #d9d9d9", paddingBottom: "0.4em" }}>
        <span className="rs-h" style={{ color: "#333", fontWeight: 600 }}>{title}</span>
      </div>
    );
  if (theme.rule === "center")
    return (
      <div className="mb-[1em] text-center">
        <div style={{ width: "3em", height: 1, background: accent, margin: "0 auto 0.6em" }} />
        <span className="rs-h" style={{ color: accent }}>{title}</span>
      </div>
    );
  return <div className="rs-h mb-[0.9em]" style={{ color: accent }}>{title}</div>;
}

/* ------------ section body renderer ------------ */
function SectionBody({
  k,
  resume,
  theme,
  accent,
  dark,
}: {
  k: SectionKey;
  resume: Resume;
  theme: TemplateTheme;
  accent: string;
  dark?: boolean;
}) {
  const d = resume.data;
  const side = theme.sidebar;
  const txt = dark && side ? side.text : theme.ink;
  const dim = dark && side ? side.dim : theme.muted;
  const chipBg = dark ? "rgba(255,255,255,0.13)" : theme.chipBg;
  const chipFg = dark ? side!.text : theme.chipFg;

  switch (k) {
    case "summary":
      return (
        <p className="rs-desc" style={{ color: dark ? side!.dim : theme.ink, lineHeight: 1.55 }}>
          {ph(d.summary, "A short professional summary written in the third person — what you do, how long, and the value you bring.")}
        </p>
      );
    case "experience":
      return (
        <>
          {(d.experience.length
            ? d.experience
            : [{ id: "ph", role: "", company: "", location: "", start: "", end: "", current: false, bullets: [] }]
          ).map((e) => (
            <div key={e.id} className="rs-item">
              <div className="flex items-baseline justify-between gap-4">
                <div className="rs-it" style={{ color: txt }}>
                  {ph(e.role, "Job Title")}
                  <span style={{ color: accent, fontWeight: 600 }}>
                    {"  ·  "}{ph(e.company, "Company")}
                  </span>
                </div>
                <div className="rs-date" style={{ color: dim }}>
                  {e.start || e.end || e.current ? rangeLabel(e.start, e.end, e.current) : "Dates"}
                </div>
              </div>
              {(e.location || !d.experience.length) && (
                <div className="rs-sub" style={{ color: dim, fontStyle: "italic" }}>
                  {ph(e.location, "Location")}
                </div>
              )}
              <ul className={`rs-bullets ${theme.id === "ats" ? "plain" : ""}`}>
                {(e.bullets.length ? e.bullets : ["Describe an achievement with an action verb and a number — e.g. “Cut build times 40% by…”"]).map((b, i) => (
                  <li key={i} style={{ color: dark ? side!.text : theme.ink }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </>
      );
    case "education":
      return (
        <>
          {(d.education.length ? d.education : [{ id: "ph", degree: "", school: "", location: "", start: "", end: "", grade: "", details: "" }]).map((e) => (
            <div key={e.id} className="rs-item">
              <div className="flex items-baseline justify-between gap-4">
                <div className="rs-it" style={{ color: txt }}>{ph(e.degree, "Degree / Qualification")}</div>
                <div className="rs-date" style={{ color: dim }}>
                  {e.start || e.end ? rangeLabel(e.start, e.end) : "Years"}
                </div>
              </div>
              <div className="rs-sub" style={{ color: accent, fontWeight: 600 }}>
                {ph(e.school, "Institution")}
                {e.location && <span style={{ color: dim, fontWeight: 400 }}> — {e.location}</span>}
              </div>
              {(e.grade || e.details) && (
                <div className="rs-desc" style={{ color: dim, marginTop: "0.15em" }}>
                  {e.grade && <span style={{ fontWeight: 600, color: txt }}>{e.grade}</span>}
                  {e.grade && e.details && "  ·  "}
                  {e.details}
                </div>
              )}
            </div>
          ))}
        </>
      );
    case "skills":
      return (
        <div className="grid grid-cols-2 gap-x-8">
          {(d.skills.length ? d.skills : [{ id: "ph", name: "", level: 3 }]).map((s) => (
            <div key={s.id} className="mb-[0.55em]">
              <div className="flex items-center justify-between gap-2">
                <span style={{ fontSize: "0.95em", color: txt, fontWeight: 500 }}>{ph(s.name, "Skill")}</span>
                <LevelViz level={s.level} theme={theme} dark={dark} />
              </div>
            </div>
          ))}
        </div>
      );
    case "technical":
      return (
        <div className="space-y-[0.6em]">
          {(d.technical.length ? d.technical : [{ id: "ph", name: "", level: 3 }]).map((s) => (
            <div key={s.id}>
              <div className="flex items-center justify-between gap-2">
                <span style={{ fontSize: "0.95em", color: txt, fontWeight: 500 }}>{ph(s.name, "Technology")}</span>
                {theme.levelStyle === "text" && <LevelViz level={s.level} theme={theme} dark={dark} />}
              </div>
              {theme.levelStyle !== "text" && <LevelViz level={s.level} theme={theme} dark={dark} />}
            </div>
          ))}
        </div>
      );
    case "projects":
      return (
        <>
          {(d.projects.length ? d.projects : [{ id: "ph", name: "", link: "", tech: "", description: "" }]).map((p) => (
            <div key={p.id} className="rs-item">
              <div className="flex items-baseline justify-between gap-4">
                <span className="rs-it" style={{ color: accent }}>{ph(p.name, "Project Name")}</span>
                {p.link && <span className="rs-link" style={{ color: dim }}>{p.link}</span>}
              </div>
              {p.tech && (
                <div className="rs-sub" style={{ color: dim, fontWeight: 600, fontSize: "0.85em", letterSpacing: "0.03em" }}>
                  {p.tech}
                </div>
              )}
              {p.description && <div className="rs-desc mt-[0.2em]" style={{ color: txt }}>{p.description}</div>}
            </div>
          ))}
        </>
      );
    case "certifications":
      return (
        <>
          {(d.certifications.length ? d.certifications : [{ id: "ph", name: "", issuer: "", year: "" }]).map((c) => (
            <div key={c.id} className="rs-item flex items-baseline justify-between gap-4" style={{ marginBottom: "0.5em" }}>
              <div>
                <span style={{ fontSize: "0.97em", fontWeight: 600, color: txt }}>{ph(c.name, "Certification")}</span>
                {c.issuer && <span style={{ fontSize: "0.9em", color: dim }}> — {c.issuer}</span>}
              </div>
              <span className="rs-date" style={{ color: dim }}>{c.year}</span>
            </div>
          ))}
        </>
      );
    case "languages":
      return (
        <div className="space-y-[0.5em]">
          {(d.languages.length ? d.languages : [{ id: "ph", name: "", level: 3 }]).map((l) => (
            <div key={l.id} className="flex items-center justify-between gap-3">
              <span style={{ fontSize: "0.95em", color: txt, fontWeight: 500 }}>{ph(l.name, "Language")}</span>
              <LevelViz level={l.level} theme={theme} dark={dark} />
            </div>
          ))}
        </div>
      );
    case "achievements":
      return (
        <ul className={`rs-bullets ${theme.id === "ats" ? "plain" : ""}`}>
          {(d.achievements.length ? d.achievements.map((a) => a.text) : ["Awards, rankings, talks, publications — anything that sets you apart."]).map((t, i) => (
            <li key={i} style={{ color: txt }}>{t}</li>
          ))}
        </ul>
      );
    case "hobbies":
      return (
        <div>
          {(d.hobbies.length ? d.hobbies : [{ id: "ph", name: "" }]).map((h) => (
            <span key={h.id} className="rs-chip" style={{ background: chipBg, color: ph(h.name, "Hobby") ? chipFg : dim }}>
              {ph(h.name, "Hobby")}
            </span>
          ))}
        </div>
      );
    case "references":
      return (
        <>
          {(d.references.length ? d.references : [{ id: "ph", name: "", role: "", contact: "" }]).map((r) => (
            <div key={r.id} className="rs-item" style={{ marginBottom: "0.7em" }}>
              <div style={{ fontSize: "0.97em", fontWeight: 700, color: txt }}>{ph(r.name, "Reference Name")}</div>
              <div className="rs-sub" style={{ color: dim }}>{ph(r.role, "Role, Company")}</div>
              {r.contact && <div className="rs-link" style={{ color: accent }}>{r.contact}</div>}
            </div>
          ))}
        </>
      );
    case "links":
      return (
        <div className="space-y-[0.35em]">
          {(d.links.length ? d.links : [{ id: "ph", label: "", url: "" }]).map((l) => (
            <div key={l.id} className="flex items-baseline gap-[0.7em]">
              <span style={{ fontSize: "0.92em", fontWeight: 700, color: txt, minWidth: "5.5em" }}>
                {ph(l.label, "Label")}
              </span>
              <span className="rs-link" style={{ color: dark ? side!.dim : accent }}>{ph(l.url, "url.com")}</span>
            </div>
          ))}
        </div>
      );
    case "custom":
      return (
        <>
          {d.custom.length ? (
            d.custom.map((cs) => (
              <div key={cs.id} className="mb-[1em]">
                <div className="rs-h" style={{ fontSize: "0.98em", color: accent, marginBottom: "0.6em" }}>
                  {cs.title || "Custom Section"}
                </div>
                {cs.items.map((it) => (
                  <div key={it.id} className="rs-item">
                    <div className="flex items-baseline justify-between gap-4">
                      <span style={{ fontSize: "0.97em", fontWeight: 600, color: txt }}>{ph(it.heading, "Heading")}</span>
                      {it.date && <span className="rs-date" style={{ color: dim }}>{it.date}</span>}
                    </div>
                    {it.sub && <div className="rs-sub" style={{ color: dim }}>{it.sub}</div>}
                    {it.text && <div className="rs-desc" style={{ color: txt }}>{it.text}</div>}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p className="rs-desc" style={{ color: dim }}>Add a custom section — volunteering, publications, workshops…</p>
          )}
        </>
      );
    default:
      return null;
  }
}

export const hasContent = (k: SectionKey, r: Resume): boolean => {
  const d = r.data;
  switch (k) {
    case "summary": return d.summary.trim().length > 0;
    case "experience": return d.experience.length > 0;
    case "education": return d.education.length > 0;
    case "skills": return d.skills.length > 0;
    case "technical": return d.technical.length > 0;
    case "projects": return d.projects.length > 0;
    case "certifications": return d.certifications.length > 0;
    case "languages": return d.languages.length > 0;
    case "achievements": return d.achievements.length > 0;
    case "hobbies": return d.hobbies.length > 0;
    case "references": return d.references.length > 0;
    case "links": return d.links.length > 0;
    case "custom": return d.custom.length > 0;
  }
};

/* ================= THE SHEET ================= */
export function ResumeSheet({ resume, shadow }: { resume: Resume; shadow?: boolean }) {
  const theme = getTheme(resume.templateId);
  const accent = resume.accent ?? theme.accent;
  const d = resume.data;
  const p = d.personal;
  const side = theme.sidebar;

  const visible = resume.sectionOrder.filter((k) => hasContent(k, resume) || !resume.data.personal.fullName);
  const sideKeys = side ? visible.filter((k) => theme.sidebarKeys.includes(k)) : [];
  const mainKeys = visible.filter((k) => !sideKeys.includes(k));

  const contactItems = [p.email, p.phone, p.location, p.website, p.linkedin, p.github].filter(Boolean);

  const rootStyle: React.CSSProperties = {
    ["--rs-fs" as string]: `${10.5 * resume.fontScale}px`,
    ["--rs-head" as string]: theme.headFont,
    ["--rs-body" as string]: theme.bodyFont,
    ["--rs-accent" as string]: accent,
    ["--rs-accent-bright" as string]: theme.accentBright,
    color: theme.ink,
    boxShadow: shadow ? "0 24px 60px -18px rgba(22,36,28,0.35)" : undefined,
  };

  /* -------- header variants -------- */
  const headerLeft = (
    <header className="mb-[1.6em]">
      <div className="rs-name" style={{ color: theme.ink }}>{ph(p.fullName, "Your Name")}</div>
      <div className="rs-role mt-[0.15em]" style={{ color: accent, fontWeight: 600 }}>
        {ph(p.jobTitle, "Job Title")}
      </div>
      {contactItems.length > 0 && (
        <div className="rs-contact mt-[0.8em] flex flex-wrap gap-x-[1.1em] gap-y-[0.2em]" style={{ color: theme.muted }}>
          {contactItems.map((c, i) => (
            <span key={i} className="flex items-center gap-[0.45em]">
              <i style={{ width: "0.4em", height: "0.4em", borderRadius: "50%", background: accent, display: "inline-block" }} />
              {c}
            </span>
          ))}
        </div>
      )}
    </header>
  );

  const headerCentered = (
    <header className="mb-[1.8em] text-center">
      <div className="rs-name" style={{ color: theme.ink, letterSpacing: "0.04em" }}>
        {ph(p.fullName, "Your Name")}
      </div>
      <div className="rs-role mt-[0.2em]" style={{ color: accent, fontStyle: "italic" }}>
        {ph(p.jobTitle, "Job Title")}
      </div>
      <div style={{ width: "4em", height: 2, background: accent, margin: "0.8em auto" }} />
      {contactItems.length > 0 && (
        <div className="rs-contact" style={{ color: theme.muted }}>
          {contactItems.join("   ·   ")}
        </div>
      )}
    </header>
  );

  const headerBanner = (
    <header style={{ background: accent, padding: "2.4em 3.2em", margin: "-3.2em -2.9em 2em", color: "#fff" }}>
      <div className="flex items-center gap-[1.2em]">
        <div
          style={{
            width: "4.6em", height: "4.6em", borderRadius: "50%",
            background: "rgba(255,255,255,0.18)", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontFamily: theme.headFont, fontWeight: 700, fontSize: "1.7em",
            border: "2px solid rgba(255,255,255,0.5)",
          }}
        >
          {p.fullName ? initials(p.fullName) : "YN"}
        </div>
        <div>
          <div className="rs-name" style={{ color: "#fff" }}>{ph(p.fullName, "Your Name")}</div>
          <div className="rs-role" style={{ color: "rgba(255,255,255,0.85)" }}>{ph(p.jobTitle, "Job Title")}</div>
        </div>
      </div>
      {contactItems.length > 0 && (
        <div className="rs-contact mt-[1em] flex flex-wrap gap-x-[1.3em]" style={{ color: "rgba(255,255,255,0.8)" }}>
          {contactItems.map((c, i) => <span key={i}>{c}</span>)}
        </div>
      )}
    </header>
  );

  /* -------- sidebar head block (two-column themes) -------- */
  const sideHead = side && (
    <div style={{ padding: "2.6em 1.9em 1.8em", background: "rgba(0,0,0,0.14)" }}>
      <div
        style={{
          width: "4.4em", height: "4.4em", borderRadius: theme.id === "purple" ? "50%" : "0.6em",
          background: accent, color: "#fff", display: "flex", alignItems: "center",
          justifyContent: "center", fontFamily: theme.headFont, fontWeight: 700, fontSize: "1.6em",
          marginBottom: "0.9em",
        }}
      >
        {p.fullName ? initials(p.fullName) : "YN"}
      </div>
      <div className="rs-name rs-name-sm" style={{ color: side.text }}>{ph(p.fullName, "Your Name")}</div>
      <div className="rs-role mt-[0.15em]" style={{ color: theme.accentBright, fontSize: "1em" }}>
        {ph(p.jobTitle, "Job Title")}
      </div>
      <div className="mt-[1.1em] space-y-[0.45em]" style={{ fontSize: "0.88em", color: side.dim }}>
        {contactItems.length ? contactItems.map((c, i) => (
          <div key={i} className="flex gap-[0.55em]" style={{ wordBreak: "break-word" }}>
            <span style={{ color: theme.accentBright, fontWeight: 700 }}>›</span>
            {c}
          </div>
        )) : <div>Add contact details…</div>}
      </div>
    </div>
  );

  const sectionBlock = (k: SectionKey, dark?: boolean) => (
    <section className="rs-section" key={k}>
      <SectionHeading title={SECTION_LABELS[k]} theme={theme} accent={dark ? theme.accentBright : accent} dark={dark} />
      <SectionBody k={k} resume={resume} theme={theme} accent={dark ? theme.accentBright : accent} dark={dark} />
    </section>
  );

  const customInline = (dark?: boolean) =>
    null; // custom handled inside SectionBody

  /* -------- layouts -------- */
  if (side) {
    return (
      <div className={`rs ${shadow ? "" : ""}`} style={rootStyle}>
        <div className="flex min-h-[1123px]">
          <aside
            className="shrink-0"
            style={{
              width: "33.5%",
              background: side.bg,
              order: side.side === "right" ? 2 : 0,
              padding: "0 0 2.5em",
            }}
          >
            {sideHead}
            <div style={{ padding: "1.8em 1.9em 0" }}>
              {sideKeys.map((k) => sectionBlock(k, true))}
            </div>
          </aside>
          <main className="flex-1" style={{ padding: "3.2em 2.9em" }}>
            {theme.headerStyle === "banner" ? headerBanner : headerLeft}
            {mainKeys.map((k) => sectionBlock(k))}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="rs" style={{ ...rootStyle, padding: theme.headerStyle === "banner" ? "3.2em 3.6em" : "3.4em 3.9em" }}>
      {theme.id === "green" || theme.id === "fresher" ? (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "0.75em", background: accent }} />
      ) : null}
      {theme.headerStyle === "banner" ? headerBanner : theme.headerStyle === "centered" ? headerCentered : headerLeft}
      {mainKeys.map((k) => sectionBlock(k))}
      {customInline()}
    </div>
  );
}

/* tiny thumbnail wrapper used in template galleries */
export function MiniSheet({
  resume,
  width = 190,
}: {
  resume: Resume;
  width?: number;
}) {
  const scale = width / 794;
  return (
    <div style={{ width, height: 1123 * scale }} className="overflow-hidden rounded-[3px]">
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 794 }}>
        <ResumeSheet resume={resume} />
      </div>
    </div>
  );
}
