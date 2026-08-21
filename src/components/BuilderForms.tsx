import React, { useState } from "react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown, ArrowUp, Award, Briefcase, ChevronDown, Code2, FileText,
  GraduationCap, GripVertical, Heart, Languages as LangIcon, Lightbulb,
  Link2, Plus, PlusSquare, Trash2, Trophy, User, Users, X, type LucideIcon,
} from "lucide-react";
import type { Resume, SectionKey } from "../types";
import { SECTION_LABELS } from "../lib/templates";
import { uid, cx, wordCount } from "../lib/utils";
import { useStore } from "../store";
import { Button, Input, TextArea, Toggle, toast } from "./ui";

/* ================= sortable plumbing ================= */
function SortableRow({ id, onDelete, children }: { id: string; onDelete: () => void; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cx(
        "group relative rounded-lg border bg-white p-4 transition-shadow",
        isDragging ? "border-moss shadow-lg shadow-moss/15 z-10" : "border-mist"
      )}
    >
      <div className="flex gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab active:cursor-grabbing text-ink/25 hover:text-ink/60 transition-colors touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical size={17} />
        </button>
        <div className="flex-1 min-w-0">{children}</div>
        <button
          onClick={onDelete}
          className="self-start p-1.5 rounded-md text-ink/30 hover:text-rust hover:bg-rust/10 transition-colors"
          aria-label="Delete entry"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function SortableList({
  ids,
  onReorder,
  children,
}: {
  ids: string[];
  onReorder: (ids: string[]) => void;
  children: React.ReactNode;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const handle = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      onReorder(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))));
    }
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handle}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">{children}</div>
      </SortableContext>
    </DndContext>
  );
}

/* ================= small form atoms ================= */
function LevelSelect({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="rounded-lg border border-mist bg-white px-2 py-2 text-[13px] text-ink outline-none focus:border-moss"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <option key={n} value={n}>
          {["Familiar", "Basic", "Intermediate", "Advanced", "Expert"][n - 1]}
        </option>
      ))}
    </select>
  );
}

const G = ({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) => (
  <div className={cx("grid gap-3", cols === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>{children}</div>
);

/* ================= section editors ================= */
function PersonalForm({ resume }: { resume: Resume }) {
  const updateResumeData = useStore((s) => s.updateResumeData);
  const p = resume.data.personal;
  const set = (patch: Partial<typeof p>) =>
    updateResumeData(resume.id, { personal: { ...p, ...patch } });
  return (
    <G>
      <Input label="Full Name" value={p.fullName} placeholder="Sathish VT" onChange={(e) => set({ fullName: e.target.value })} />
      <Input label="Job Title" value={p.jobTitle} placeholder="Software Developer" onChange={(e) => set({ jobTitle: e.target.value })} />
      <Input label="Email" type="email" value={p.email} placeholder="you@mail.com" onChange={(e) => set({ email: e.target.value })} />
      <Input label="Phone" value={p.phone} placeholder="+91 …" onChange={(e) => set({ phone: e.target.value })} />
      <Input label="Location" value={p.location} placeholder="City, Country" onChange={(e) => set({ location: e.target.value })} />
      <Input label="Website" value={p.website} placeholder="yoursite.dev" onChange={(e) => set({ website: e.target.value })} />
      <Input label="LinkedIn" value={p.linkedin} placeholder="linkedin.com/in/you" onChange={(e) => set({ linkedin: e.target.value })} />
      <Input label="GitHub" value={p.github} placeholder="github.com/you" onChange={(e) => set({ github: e.target.value })} />
    </G>
  );
}

function SummaryForm({ resume }: { resume: Resume }) {
  const updateResumeData = useStore((s) => s.updateResumeData);
  const s = resume.data.summary;
  return (
    <div>
      <TextArea
        rows={5}
        placeholder="Software developer with 6+ years of experience…"
        value={s}
        onChange={(e) => updateResumeData(resume.id, { summary: e.target.value })}
      />
      <div className={cx("mt-1.5 text-xs font-mono", wordCount(s) > 90 ? "text-honey" : "text-ink/40")}>
        {wordCount(s)} words · aim for 30–60
      </div>
    </div>
  );
}

function ExperienceForm({ resume }: { resume: Resume }) {
  const updateResumeData = useStore((s) => s.updateResumeData);
  const items = resume.data.experience;
  const save = (arr: typeof items) => updateResumeData(resume.id, { experience: arr });
  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <SortableList ids={items.map((i) => i.id)} onReorder={(ids) => save(ids.map((id) => items.find((i) => i.id === id)!))}>
          {items.map((it) => (
            <SortableRow key={it.id} id={it.id} onDelete={() => save(items.filter((i) => i.id !== it.id))}>
              <G>
                <Input label="Role" value={it.role} placeholder="Senior Developer" onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, role: e.target.value } : i)))} />
                <Input label="Company" value={it.company} placeholder="Nimbus Labs" onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, company: e.target.value } : i)))} />
                <Input label="Location" value={it.location} placeholder="Bengaluru" onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, location: e.target.value } : i)))} />
                <G cols={1}>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Start" value={it.start} placeholder="Mar 2022" onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, start: e.target.value } : i)))} />
                    <Input label="End" value={it.end} disabled={it.current} placeholder="Feb 2024" onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, end: e.target.value } : i)))} />
                  </div>
                </G>
              </G>
              <div className="mt-2.5">
                <Toggle checked={it.current} label="I currently work here" onChange={(v) => save(items.map((i) => (i.id === it.id ? { ...i, current: v } : i)))} />
              </div>
              <div className="mt-3">
                <TextArea
                  label="Achievement bullets (one per line)"
                  rows={4}
                  placeholder={"Cut p95 query time from 4.2s to 380ms by re-indexing…\nLed a team of 5 engineers…"}
                  value={it.bullets.join("\n")}
                  onChange={(e) =>
                    save(items.map((i) => (i.id === it.id ? { ...i, bullets: e.target.value.split("\n") } : i)))
                  }
                />
              </div>
            </SortableRow>
          ))}
        </SortableList>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          save([...items, { id: uid(), role: "", company: "", location: "", start: "", end: "", current: false, bullets: [] }])
        }
      >
        <Plus size={14} /> Add experience
      </Button>
    </div>
  );
}

function EducationForm({ resume }: { resume: Resume }) {
  const updateResumeData = useStore((s) => s.updateResumeData);
  const items = resume.data.education;
  const save = (arr: typeof items) => updateResumeData(resume.id, { education: arr });
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.id} className="rounded-lg border border-mist bg-white p-4">
          <div className="flex justify-end -mt-1 -mr-1 mb-1">
            <button onClick={() => save(items.filter((i) => i.id !== it.id))} className="p-1.5 rounded-md text-ink/30 hover:text-rust hover:bg-rust/10 transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
          <G>
            <Input label="Degree / Qualification" value={it.degree} placeholder="B.E. Computer Science" onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, degree: e.target.value } : i)))} />
            <Input label="Institution" value={it.school} placeholder="PSG College of Technology" onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, school: e.target.value } : i)))} />
            <Input label="Location" value={it.location} onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, location: e.target.value } : i)))} />
            <Input label="Grade / GPA" value={it.grade} placeholder="8.7 / 10" onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, grade: e.target.value } : i)))} />
            <Input label="Start year" value={it.start} onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, start: e.target.value } : i)))} />
            <Input label="End year" value={it.end} onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, end: e.target.value } : i)))} />
          </G>
          <div className="mt-3">
            <Input label="Details (optional)" value={it.details} placeholder="Coursework, thesis, societies…" onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, details: e.target.value } : i)))} />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => save([...items, { id: uid(), degree: "", school: "", location: "", start: "", end: "", grade: "", details: "" }])}>
        <Plus size={14} /> Add education
      </Button>
    </div>
  );
}

function SkillsForm({ resume, tech }: { resume: Resume; tech?: boolean }) {
  const updateResumeData = useStore((s) => s.updateResumeData);
  const items = tech ? resume.data.technical : resume.data.skills;
  const save = (arr: typeof items) => updateResumeData(resume.id, tech ? { technical: arr } : { skills: arr });
  return (
    <div className="space-y-2.5">
      {items.map((it) => (
        <div key={it.id} className="flex items-center gap-2.5 rounded-lg border border-mist bg-white px-3 py-2">
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink/30"
            placeholder={tech ? "PHP / Laravel" : "Leadership"}
            value={it.name}
            onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, name: e.target.value } : i)))}
          />
          <LevelSelect value={it.level} onChange={(n) => save(items.map((i) => (i.id === it.id ? { ...i, level: n } : i)))} />
          <button onClick={() => save(items.filter((i) => i.id !== it.id))} className="p-1.5 rounded-md text-ink/30 hover:text-rust hover:bg-rust/10 transition-colors">
            <X size={14} />
          </button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => save([...items, { id: uid(), name: "", level: 3 }])}>
        <Plus size={14} /> Add {tech ? "technical skill" : "skill"}
      </Button>
    </div>
  );
}

function ProjectsForm({ resume }: { resume: Resume }) {
  const updateResumeData = useStore((s) => s.updateResumeData);
  const items = resume.data.projects;
  const save = (arr: typeof items) => updateResumeData(resume.id, { projects: arr });
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.id} className="rounded-lg border border-mist bg-white p-4">
          <div className="flex justify-end -mt-1 -mr-1 mb-1">
            <button onClick={() => save(items.filter((i) => i.id !== it.id))} className="p-1.5 rounded-md text-ink/30 hover:text-rust hover:bg-rust/10 transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
          <G>
            <Input label="Project name" value={it.name} onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, name: e.target.value } : i)))} />
            <Input label="Link" value={it.link} placeholder="github.com/…" onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, link: e.target.value } : i)))} />
          </G>
          <div className="mt-3 space-y-3">
            <Input label="Tech stack" value={it.tech} placeholder="Laravel · MySQL · Vue" onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, tech: e.target.value } : i)))} />
            <TextArea label="Description" rows={2} value={it.description} onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, description: e.target.value } : i)))} />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => save([...items, { id: uid(), name: "", link: "", tech: "", description: "" }])}>
        <Plus size={14} /> Add project
      </Button>
    </div>
  );
}

function CertsForm({ resume }: { resume: Resume }) {
  const updateResumeData = useStore((s) => s.updateResumeData);
  const items = resume.data.certifications;
  const save = (arr: typeof items) => updateResumeData(resume.id, { certifications: arr });
  return (
    <div className="space-y-2.5">
      {items.map((it) => (
        <div key={it.id} className="flex flex-wrap items-center gap-2.5 rounded-lg border border-mist bg-white px-3 py-2">
          <input className="flex-1 min-w-[140px] bg-transparent text-sm outline-none placeholder:text-ink/30" placeholder="Certification" value={it.name} onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, name: e.target.value } : i)))} />
          <input className="w-40 bg-transparent text-sm outline-none placeholder:text-ink/30" placeholder="Issuer" value={it.issuer} onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, issuer: e.target.value } : i)))} />
          <input className="w-20 bg-transparent text-sm outline-none placeholder:text-ink/30" placeholder="Year" value={it.year} onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, year: e.target.value } : i)))} />
          <button onClick={() => save(items.filter((i) => i.id !== it.id))} className="p-1.5 rounded-md text-ink/30 hover:text-rust hover:bg-rust/10 transition-colors">
            <X size={14} />
          </button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => save([...items, { id: uid(), name: "", issuer: "", year: "" }])}>
        <Plus size={14} /> Add certification
      </Button>
    </div>
  );
}

function LanguagesForm({ resume }: { resume: Resume }) {
  const updateResumeData = useStore((s) => s.updateResumeData);
  const items = resume.data.languages;
  const save = (arr: typeof items) => updateResumeData(resume.id, { languages: arr });
  return (
    <div className="space-y-2.5">
      {items.map((it) => (
        <div key={it.id} className="flex items-center gap-2.5 rounded-lg border border-mist bg-white px-3 py-2">
          <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink/30" placeholder="Language" value={it.name} onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, name: e.target.value } : i)))} />
          <LevelSelect value={it.level} onChange={(n) => save(items.map((i) => (i.id === it.id ? { ...i, level: n } : i)))} />
          <button onClick={() => save(items.filter((i) => i.id !== it.id))} className="p-1.5 rounded-md text-ink/30 hover:text-rust hover:bg-rust/10 transition-colors">
            <X size={14} />
          </button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => save([...items, { id: uid(), name: "", level: 3 }])}>
        <Plus size={14} /> Add language
      </Button>
    </div>
  );
}

function AchievementsForm({ resume }: { resume: Resume }) {
  const updateResumeData = useStore((s) => s.updateResumeData);
  const items = resume.data.achievements;
  const save = (arr: typeof items) => updateResumeData(resume.id, { achievements: arr });
  return (
    <div className="space-y-2.5">
      {items.map((it) => (
        <div key={it.id} className="flex items-start gap-2.5 rounded-lg border border-mist bg-white px-3 py-2">
          <textarea
            rows={2}
            className="flex-1 bg-transparent text-sm outline-none resize-none placeholder:text-ink/30"
            placeholder="Winner — Smart India Hackathon 2016…"
            value={it.text}
            onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, text: e.target.value } : i)))}
          />
          <button onClick={() => save(items.filter((i) => i.id !== it.id))} className="p-1.5 rounded-md text-ink/30 hover:text-rust hover:bg-rust/10 transition-colors">
            <X size={14} />
          </button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => save([...items, { id: uid(), text: "" }])}>
        <Plus size={14} /> Add achievement
      </Button>
    </div>
  );
}

function HobbiesForm({ resume }: { resume: Resume }) {
  const updateResumeData = useStore((s) => s.updateResumeData);
  const items = resume.data.hobbies;
  const [val, setVal] = useState("");
  const save = (arr: typeof items) => updateResumeData(resume.id, { hobbies: arr });
  const add = () => {
    if (!val.trim()) return;
    save([...items, { id: uid(), name: val.trim() }]);
    setVal("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((h) => (
          <span key={h.id} className="inline-flex items-center gap-1.5 rounded-full bg-moss/10 border border-moss/25 text-moss px-3 py-1 text-[13px] font-medium">
            {h.name}
            <button onClick={() => save(items.filter((i) => i.id !== h.id))} className="hover:text-rust">
              <X size={12} />
            </button>
          </span>
        ))}
        {items.length === 0 && <span className="text-sm text-ink/40">No hobbies yet — add a few below.</span>}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-mist bg-white px-3.5 py-2.5 text-sm outline-none focus:border-moss"
          placeholder="Trail running…"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        />
        <Button variant="outline" onClick={add}>Add</Button>
      </div>
    </div>
  );
}

function ReferencesForm({ resume }: { resume: Resume }) {
  const updateResumeData = useStore((s) => s.updateResumeData);
  const items = resume.data.references;
  const save = (arr: typeof items) => updateResumeData(resume.id, { references: arr });
  return (
    <div className="space-y-2.5">
      {items.map((it) => (
        <div key={it.id} className="rounded-lg border border-mist bg-white p-3.5">
          <div className="flex justify-end -mt-0.5 -mr-0.5 mb-1">
            <button onClick={() => save(items.filter((i) => i.id !== it.id))} className="p-1.5 rounded-md text-ink/30 hover:text-rust hover:bg-rust/10 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
          <G cols={1}>
            <Input label="Name" value={it.name} onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, name: e.target.value } : i)))} />
            <Input label="Role & company" value={it.role} placeholder="Engineering Manager, Nimbus Labs" onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, role: e.target.value } : i)))} />
            <Input label="Contact" value={it.contact} placeholder="email · phone" onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, contact: e.target.value } : i)))} />
          </G>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => save([...items, { id: uid(), name: "", role: "", contact: "" }])}>
        <Plus size={14} /> Add reference
      </Button>
    </div>
  );
}

function LinksForm({ resume }: { resume: Resume }) {
  const updateResumeData = useStore((s) => s.updateResumeData);
  const items = resume.data.links;
  const save = (arr: typeof items) => updateResumeData(resume.id, { links: arr });
  return (
    <div className="space-y-2.5">
      {items.map((it) => (
        <div key={it.id} className="flex items-center gap-2.5 rounded-lg border border-mist bg-white px-3 py-2">
          <input className="w-32 bg-transparent text-sm outline-none placeholder:text-ink/30" placeholder="Label" value={it.label} onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, label: e.target.value } : i)))} />
          <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink/30" placeholder="https://…" value={it.url} onChange={(e) => save(items.map((i) => (i.id === it.id ? { ...i, url: e.target.value } : i)))} />
          <button onClick={() => save(items.filter((i) => i.id !== it.id))} className="p-1.5 rounded-md text-ink/30 hover:text-rust hover:bg-rust/10 transition-colors">
            <X size={14} />
          </button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => save([...items, { id: uid(), label: "", url: "" }])}>
        <Plus size={14} /> Add link
      </Button>
    </div>
  );
}

function CustomForm({ resume }: { resume: Resume }) {
  const updateResumeData = useStore((s) => s.updateResumeData);
  const sections = resume.data.custom;
  const save = (arr: typeof sections) => updateResumeData(resume.id, { custom: arr });
  return (
    <div className="space-y-4">
      {sections.map((cs) => (
        <div key={cs.id} className="rounded-lg border border-mist bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <input
              className="flex-1 font-display font-bold text-ink bg-transparent outline-none border-b border-mist focus:border-moss pb-1"
              placeholder="Section title — e.g. Volunteering"
              value={cs.title}
              onChange={(e) => save(sections.map((c) => (c.id === cs.id ? { ...c, title: e.target.value } : c)))}
            />
            <button onClick={() => save(sections.filter((c) => c.id !== cs.id))} className="p-1.5 rounded-md text-ink/30 hover:text-rust hover:bg-rust/10 transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
          <div className="space-y-3">
            {cs.items.map((it) => (
              <div key={it.id} className="rounded-md bg-paper border border-mist p-3">
                <div className="flex justify-end mb-1">
                  <button
                    onClick={() => save(sections.map((c) => (c.id === cs.id ? { ...c, items: c.items.filter((i) => i.id !== it.id) } : c)))}
                    className="p-1 rounded text-ink/30 hover:text-rust"
                  >
                    <X size={13} />
                  </button>
                </div>
                <G>
                  <Input label="Heading" value={it.heading} onChange={(e) => save(sections.map((c) => (c.id === cs.id ? { ...c, items: c.items.map((i) => (i.id === it.id ? { ...i, heading: e.target.value } : i)) } : c)))} />
                  <Input label="Sub" value={it.sub} onChange={(e) => save(sections.map((c) => (c.id === cs.id ? { ...c, items: c.items.map((i) => (i.id === it.id ? { ...i, sub: e.target.value } : i)) } : c)))} />
                  <Input label="Date" value={it.date} onChange={(e) => save(sections.map((c) => (c.id === cs.id ? { ...c, items: c.items.map((i) => (i.id === it.id ? { ...i, date: e.target.value } : i)) } : c)))} />
                </G>
                <div className="mt-2.5">
                  <TextArea label="Text" rows={2} value={it.text} onChange={(e) => save(sections.map((c) => (c.id === cs.id ? { ...c, items: c.items.map((i) => (i.id === it.id ? { ...i, text: e.target.value } : i)) } : c)))} />
                </div>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => save(sections.map((c) => (c.id === cs.id ? { ...c, items: [...c.items, { id: uid(), heading: "", sub: "", date: "", text: "" }] } : c)))}
            >
              <Plus size={13} /> Add entry
            </Button>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => save([...sections, { id: uid(), title: "", items: [{ id: uid(), heading: "", sub: "", date: "", text: "" }] }])}>
        <PlusSquare size={14} /> Add custom section
      </Button>
    </div>
  );
}

/* ================= accordion shell ================= */
const SECTION_ICONS: Record<SectionKey, LucideIcon> = {
  summary: FileText,
  experience: Briefcase,
  education: GraduationCap,
  skills: Lightbulb,
  technical: Code2,
  projects: PlusSquare,
  certifications: Award,
  languages: LangIcon,
  achievements: Trophy,
  hobbies: Heart,
  references: Users,
  links: Link2,
  custom: PlusSquare,
};

function countLabel(k: SectionKey, r: Resume): string {
  const d = r.data;
  switch (k) {
    case "summary": return d.summary.trim() ? "✓" : "empty";
    case "experience": return d.experience.length ? `${d.experience.length} role${d.experience.length > 1 ? "s" : ""}` : "empty";
    case "education": return d.education.length ? `${d.education.length} entr${d.education.length > 1 ? "ies" : "y"}` : "empty";
    case "skills": return d.skills.length ? `${d.skills.length} skills` : "empty";
    case "technical": return d.technical.length ? `${d.technical.length} skills` : "empty";
    case "projects": return d.projects.length ? `${d.projects.length} projects` : "empty";
    case "certifications": return d.certifications.length ? `${d.certifications.length}` : "empty";
    case "languages": return d.languages.length ? `${d.languages.length}` : "empty";
    case "achievements": return d.achievements.length ? `${d.achievements.length}` : "empty";
    case "hobbies": return d.hobbies.length ? `${d.hobbies.length}` : "empty";
    case "references": return d.references.length ? `${d.references.length}` : "empty";
    case "links": return d.links.length ? `${d.links.length}` : "empty";
    case "custom": return d.custom.length ? `${d.custom.length} section${d.custom.length > 1 ? "s" : ""}` : "empty";
  }
}

export function ContentForms({ resume }: { resume: Resume }) {
  const updateResume = useStore((s) => s.updateResume);
  const [open, setOpen] = useState<SectionKey>("personal" as SectionKey);
  const order = resume.sectionOrder;

  const move = (k: SectionKey, dir: -1 | 1) => {
    const i = order.indexOf(k);
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    updateResume(resume.id, { sectionOrder: next });
  };

  const body = (k: SectionKey) => {
    switch (k) {
      case "summary": return <SummaryForm resume={resume} />;
      case "experience": return <ExperienceForm resume={resume} />;
      case "education": return <EducationForm resume={resume} />;
      case "skills": return <SkillsForm resume={resume} />;
      case "technical": return <SkillsForm resume={resume} tech />;
      case "projects": return <ProjectsForm resume={resume} />;
      case "certifications": return <CertsForm resume={resume} />;
      case "languages": return <LanguagesForm resume={resume} />;
      case "achievements": return <AchievementsForm resume={resume} />;
      case "hobbies": return <HobbiesForm resume={resume} />;
      case "references": return <ReferencesForm resume={resume} />;
      case "links": return <LinksForm resume={resume} />;
      case "custom": return <CustomForm resume={resume} />;
    }
  };

  const PersonalIcon = User;

  return (
    <div className="space-y-3">
      {/* personal is pinned first */}
      <div className="rounded-xl border border-mist bg-paper overflow-hidden">
        <button
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/60 transition-colors"
          onClick={() => setOpen(open === ("personal" as SectionKey) ? ("" as SectionKey) : ("personal" as SectionKey))}
        >
          <PersonalIcon size={17} className="text-moss shrink-0" />
          <span className="font-display font-bold text-[15px] text-ink flex-1">Personal Information</span>
          <span className={cx("text-[11px] font-mono", resume.data.personal.fullName ? "text-moss" : "text-ink/35")}>
            {resume.data.personal.fullName ? "✓" : "empty"}
          </span>
          <ChevronDown size={16} className={cx("text-ink/40 transition-transform duration-200", open === ("personal" as SectionKey) && "rotate-180")} />
        </button>
        {open === ("personal" as SectionKey) && (
          <div className="px-4 pb-4 pt-1 border-t border-mist/70">
            <PersonalForm resume={resume} />
          </div>
        )}
      </div>

      <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-ink/40 pt-1 px-1">
        Sections · use ↑ ↓ to reorder on the page
      </p>

      {order.map((k, idx) => {
        const Icon = SECTION_ICONS[k];
        const isOpen = open === k;
        const label = countLabel(k, resume);
        return (
          <div key={k} className={cx("rounded-xl border bg-paper overflow-hidden transition-colors", isOpen ? "border-moss/40" : "border-mist")}>
            <div className="flex items-center gap-1 pl-4 pr-2 py-3">
              <button className="flex items-center gap-3 flex-1 min-w-0 text-left" onClick={() => setOpen(isOpen ? ("" as SectionKey) : k)}>
                <Icon size={17} className="text-moss shrink-0" />
                <span className="font-display font-bold text-[15px] text-ink truncate">{SECTION_LABELS[k]}</span>
                <span className={cx("text-[11px] font-mono shrink-0", label === "✓" || label !== "empty" ? "text-moss" : "text-ink/35")}>{label}</span>
                <ChevronDown size={16} className={cx("text-ink/40 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
              </button>
              <button onClick={() => move(k, -1)} disabled={idx === 0} className="p-1.5 rounded-md text-ink/35 hover:text-ink hover:bg-ink/5 disabled:opacity-25 transition-colors" aria-label="Move up">
                <ArrowUp size={14} />
              </button>
              <button onClick={() => move(k, 1)} disabled={idx === order.length - 1} className="p-1.5 rounded-md text-ink/35 hover:text-ink hover:bg-ink/5 disabled:opacity-25 transition-colors" aria-label="Move down">
                <ArrowDown size={14} />
              </button>
            </div>
            {isOpen && (
              <div className="px-4 pb-4 pt-1 border-t border-mist/70">
                {body(k)}
              </div>
            )}
          </div>
        );
      })}

      <button
        className="w-full text-center text-xs text-ink/40 hover:text-moss py-2 transition-colors"
        onClick={() => toast("Tip: switch to the Design tab to drag-and-drop full section order.", "info")}
      >
        Drag-and-drop ordering lives in the Design tab →
      </button>
    </div>
  );
}
