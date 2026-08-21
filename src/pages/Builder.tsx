import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle, ArrowLeft, Check, CheckCircle2, ChevronRight, Download,
  Eye, FileDown, Globe, GripVertical, LayoutTemplate, Loader2, Lock,
  Minus, Plus, Printer, QrCode, Share2, ShieldCheck, Sparkles, XCircle, ZoomIn,
  type LucideIcon,
} from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import QRCode from "qrcode";
import { useCurrentUser, useStore } from "../store";
import type { Resume, SectionKey } from "../types";
import { ACCENT_SWATCHES, SECTION_LABELS, THEMES, getTheme } from "../lib/templates";
import { computeATS } from "../lib/ats";
import { exportResumePdf, printResume } from "../lib/pdf";
import { clamp, copyText, cx, slugify, timeAgo } from "../lib/utils";
import { ResumeSheet } from "../components/ResumeSheet";
import { ContentForms } from "../components/BuilderForms";
import { Button, Input, Modal, ScoreRing, TextArea, Toggle, UpgradeModal, toast } from "../components/ui";

/* ============ design tab: section order drag list ============ */
function OrderRow({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cx(
        "flex items-center gap-3 rounded-lg border bg-white px-3 py-2.5",
        isDragging ? "border-moss shadow-lg z-10" : "border-mist"
      )}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-ink/25 hover:text-ink/60 touch-none">
        <GripVertical size={16} />
      </button>
      <span className="text-sm font-semibold text-ink flex-1">{label}</span>
      <ChevronRight size={14} className="text-ink/25" />
    </div>
  );
}

function SectionOrderEditor({ resume }: { resume: Resume }) {
  const updateResume = useStore((s) => s.updateResume);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const ids = resume.sectionOrder as string[];
      updateResume(resume.id, {
        sectionOrder: arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))) as SectionKey[],
      });
    }
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={resume.sectionOrder as string[]} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {resume.sectionOrder.map((k) => (
            <OrderRow key={k} id={k} label={SECTION_LABELS[k]} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

/* ============ ATS tab ============ */
function AtsPanel({ resume }: { resume: Resume }) {
  const [jd, setJd] = useState("");
  const report = useMemo(() => computeATS(resume.data, jd || undefined), [resume.data, jd]);
  const updateResumeData = useStore((s) => s.updateResumeData);

  const addKeyword = (kw: string) => {
    updateResumeData(resume.id, {
      technical: [...resume.data.technical, { id: `sk-${Date.now()}`, name: kw, level: 3 }],
    });
    toast(`“${kw}” added to technical skills`);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-mist bg-white p-5 flex items-center gap-6">
        <ScoreRing score={report.score} size={128} label={`grade ${report.grade}`} />
        <div className="flex-1">
          <div className="font-display text-xl font-extrabold text-ink">ATS Compatibility</div>
          <p className="text-[13px] text-ink/55 mt-1 leading-relaxed">
            {report.score >= 80
              ? "Strong — parsers will read this cleanly and recruiters will skim it happily."
              : report.score >= 60
              ? "Decent foundation. Work through the warnings below to push past 80%."
              : "Needs work — fix the red items first, they cost the most points."}
          </p>
          <div className="flex gap-4 mt-3 text-[12px] font-mono text-ink/50">
            <span>{report.wordCount} words</span>
            <span>≈ {Math.max(1, Math.ceil(report.wordCount / 450))} page{report.wordCount > 450 ? "s" : ""}</span>
            <span>{report.checks.filter((c) => c.status === "pass").length}/{report.checks.length} checks green</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-mist bg-white p-5">
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/45 mb-3">Checklist</div>
        <div className="space-y-2.5">
          {report.checks.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              {c.status === "pass" && <CheckCircle2 size={17} className="text-moss shrink-0 mt-0.5" />}
              {c.status === "warn" && <AlertTriangle size={17} className="text-honey shrink-0 mt-0.5" />}
              {c.status === "fail" && <XCircle size={17} className="text-rust shrink-0 mt-0.5" />}
              <div>
                <div className={cx("text-sm font-semibold", c.status === "pass" ? "text-ink" : "text-ink/80")}>{c.label}</div>
                <div className="text-[12.5px] text-ink/50 leading-snug">{c.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-pine2 bg-pine text-paper p-5">
        <div className="flex items-center gap-2 font-display font-bold text-lg">
          <Sparkles size={16} className="text-citron" /> Job-description matcher
        </div>
        <p className="text-[13px] text-paper/60 mt-1 mb-3">
          Paste the job post — we extract its keywords and score your resume against them.
        </p>
        <textarea
          rows={6}
          placeholder="Paste the job description here…"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          className="w-full rounded-lg bg-white/10 border border-white/15 px-3.5 py-3 text-sm text-paper placeholder:text-paper/35 outline-none focus:border-citron/60 resize-y"
        />
        {report.keywords && (
          <div className="mt-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-[11px] uppercase tracking-widest text-paper/50">Keyword coverage</span>
              <span className={cx("font-display font-extrabold text-2xl", report.keywords.coverage >= 70 ? "text-citron" : report.keywords.coverage >= 40 ? "text-honey" : "text-[#f0a08c]")}>
                {report.keywords.coverage}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/12 mt-2 overflow-hidden">
              <div className="h-full rounded-full bg-citron transition-all duration-500" style={{ width: `${report.keywords.coverage}%` }} />
            </div>
            {report.keywords.matched.length > 0 && (
              <div className="mt-4">
                <div className="text-[11px] font-mono uppercase tracking-widest text-leaf mb-1.5">Matched ({report.keywords.matched.length})</div>
                <div className="flex flex-wrap gap-1.5">
                  {report.keywords.matched.map((k) => (
                    <span key={k} className="text-[12px] font-medium bg-leaf/15 border border-leaf/40 text-leaf rounded-full px-2.5 py-0.5 inline-flex items-center gap-1">
                      <Check size={11} /> {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {report.keywords.missing.length > 0 && (
              <div className="mt-3">
                <div className="text-[11px] font-mono uppercase tracking-widest text-honey mb-1.5">Missing — tap to add to skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {report.keywords.missing.map((k) => (
                    <button key={k} onClick={() => addKeyword(k)} className="text-[12px] font-medium bg-honey/10 border border-honey/40 text-honey rounded-full px-2.5 py-0.5 hover:bg-honey hover:text-pine transition-colors inline-flex items-center gap-1">
                      <Plus size={11} /> {k}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ design tab ============ */
function DesignPanel({ resume, onLocked }: { resume: Resume; onLocked: () => void }) {
  const me = useCurrentUser()!;
  const updateResume = useStore((s) => s.updateResume);
  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/45 mb-3">Template — content stays, look swaps</div>
        <div className="grid grid-cols-2 gap-2.5">
          {THEMES.map((t) => {
            const locked = me.plan === "free" && !t.free;
            const active = resume.templateId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  if (locked) return onLocked();
                  updateResume(resume.id, { templateId: t.id, accent: null });
                  toast(`Template switched to ${t.name}`);
                }}
                className={cx(
                  "relative rounded-lg border p-2 text-left transition-all group",
                  active ? "border-moss ring-2 ring-moss/25" : "border-mist hover:border-ink/30",
                  locked && "opacity-60"
                )}
              >
                <div className="h-[104px] rounded-md overflow-hidden relative" style={{ background: t.sidebar ? t.sidebar.bg : "#fff", border: "1px solid rgba(0,0,0,0.06)" }}>
                  <div className="absolute inset-2 rounded-[3px] flex gap-1.5" style={{ background: "#fff" }}>
                    {t.sidebar && <div className="w-1/3 rounded-l-[3px]" style={{ background: t.sidebar.bg }} />}
                    <div className="flex-1 p-2">
                      <div className="h-2.5 rounded-sm w-3/4" style={{ background: t.accent }} />
                      <div className="h-1.5 rounded-sm w-1/2 mt-1.5 bg-ink/15" />
                      <div className="h-1 rounded-sm w-full mt-2 bg-ink/8" />
                      <div className="h-1 rounded-sm w-5/6 mt-1 bg-ink/8" />
                      <div className="h-1 rounded-sm w-2/3 mt-1 bg-ink/8" />
                      <div className="h-1.5 rounded-sm w-2/5 mt-2.5" style={{ background: `${t.accent}55` }} />
                      <div className="h-1 rounded-sm w-full mt-1.5 bg-ink/8" />
                      <div className="h-1 rounded-sm w-4/6 mt-1 bg-ink/8" />
                    </div>
                  </div>
                  {locked && (
                    <div className="absolute inset-0 bg-paper/40 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="inline-flex items-center gap-1 bg-pine text-citron text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full">
                        <Lock size={10} /> Pro
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[12px] font-bold text-ink">{t.name}</span>
                  {active && <Check size={13} className="text-moss" />}
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-[12px] text-ink/45 mt-2">{getTheme(resume.templateId).blurb}</p>
      </div>

      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/45 mb-2.5">Accent colour</div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => updateResume(resume.id, { accent: null })}
            className={cx("w-8 h-8 rounded-full border-2 flex items-center justify-center text-[9px] font-mono", !resume.accent ? "border-ink" : "border-transparent text-ink/40")}
            style={{ background: "conic-gradient(#1E7A4A,#1D4E89,#6D28D9,#B45309,#1E7A4A)" }}
            title="Template default"
          >
            <span className="bg-white rounded-full w-5 h-5 flex items-center justify-center">auto</span>
          </button>
          {ACCENT_SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => updateResume(resume.id, { accent: c })}
              className={cx("w-8 h-8 rounded-full border-2 transition-transform hover:scale-110", resume.accent === c ? "border-ink scale-110" : "border-white shadow")}
              style={{ background: c }}
              aria-label={`Accent ${c}`}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/45 mb-2.5">
          Type size — {Math.round(resume.fontScale * 100)}%
        </div>
        <input
          type="range"
          min={90}
          max={115}
          value={Math.round(resume.fontScale * 100)}
          onChange={(e) => updateResume(resume.id, { fontScale: Number(e.target.value) / 100 })}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] font-mono text-ink/35"><span>compact</span><span>spacious</span></div>
      </div>

      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/45 mb-2.5">Section order — drag to rearrange</div>
        <SectionOrderEditor resume={resume} />
        <p className="text-[12px] text-ink/40 mt-2">Empty sections are hidden automatically. Two-column templates route skills & languages to the sidebar.</p>
      </div>
    </div>
  );
}

/* ============ main page ============ */
type Tab = "content" | "design" | "ats";

export default function Builder() {
  const { id } = useParams();
  const nav = useNavigate();
  const me = useCurrentUser()!;
  const resume = useStore((s) => s.resumes.find((r) => r.id === id));
  const updateResume = useStore((s) => s.updateResume);
  const togglePublic = useStore((s) => s.togglePublic);
  const recordDownload = useStore((s) => s.recordDownload);

  const [tab, setTab] = useState<Tab>("content");
  const [fit, setFit] = useState(0.58);
  const [wrapW, setWrapW] = useState(560);
  const [sheetH, setSheetH] = useState(1123);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const [shareOpen, setShareOpen] = useState(false);
  const [dlOpen, setDlOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [qr, setQr] = useState("");
  const [exporting, setExporting] = useState(false);
  const [filename, setFilename] = useState("");
  const [optHeader, setOptHeader] = useState(false);
  const [optFooter, setOptFooter] = useState(true);

  const report = useMemo(() => (resume ? computeATS(resume.data) : null), [resume]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWrapW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSheetH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [resume?.id]);

  useEffect(() => {
    if (resume) setFilename(slugify(resume.title));
  }, [resume?.id]);

  const shareUrl = resume ? `${location.origin}${location.pathname}#/r/${resume.slug}` : "";
  useEffect(() => {
    if (shareOpen && resume?.isPublic) {
      QRCode.toDataURL(shareUrl, { width: 520, margin: 2, color: { dark: "#16241c", light: "#ffffff" } })
        .then(setQr)
        .catch(() => setQr(""));
    }
  }, [shareOpen, resume?.isPublic, shareUrl]);

  if (!resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-center">
          <p className="font-display text-2xl font-bold text-ink">Resume not found</p>
          <Link to="/app"><Button className="mt-4"><ArrowLeft size={14} /> Back to dashboard</Button></Link>
        </div>
      </div>
    );
  }

  const scale = clamp((wrapW / 794) * fit, 0.3, 1.2);
  const pages = Math.max(1, Math.ceil(sheetH / 1123));

  const doExport = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      await exportResumePdf(exportRef.current, {
        filename: filename || resume.slug,
        header: optHeader,
        footer: optFooter,
        metaLeft: `${resume.data.personal.fullName || resume.title} · ${resume.data.personal.email || resume.data.personal.phone || ""}`.trim(),
        metaRight: `${resume.data.personal.fullName || resume.title} — ${resume.data.personal.jobTitle || ""}`.trim(),
        watermark: me.plan === "free" ? "Made with ResumeCraft · resumecraft.app" : undefined,
      });
      recordDownload(resume.id);
      toast("PDF downloaded — check your files");
      setDlOpen(false);
    } catch {
      toast("Export failed — please try again", "err");
    }
    setExporting(false);
  };

  const tabs: { k: Tab; l: string; icon: LucideIcon }[] = [
    { k: "content", l: "Content", icon: LayoutTemplate },
    { k: "design", l: "Design", icon: Sparkles },
    { k: "ats", l: `ATS · ${report?.score ?? 0}%`, icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-paper">
      {/* top bar */}
      <header className="sticky top-0 z-40 bg-pine text-paper border-b border-white/10">
        <div className="px-4 py-2.5 flex items-center gap-3">
          <Link to="/app" className="p-2 rounded-lg hover:bg-white/10 text-paper/70 hover:text-paper transition-colors" title="Back to dashboard">
            <ArrowLeft size={17} />
          </Link>
          <input
            value={resume.title}
            onChange={(e) => updateResume(resume.id, { title: e.target.value })}
            className="bg-transparent font-display font-bold text-[15px] sm:text-[17px] outline-none border-b border-transparent focus:border-citron/60 min-w-0 flex-1 max-w-md"
            aria-label="Resume title"
          />
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono text-paper/45">
            <span className="w-1.5 h-1.5 rounded-full bg-leaf pulse-dot" />
            auto-saved {timeAgo(resume.updatedAt)}
          </span>
          <div className="flex items-center gap-1.5 ml-auto">
            <Button variant="ghost" size="sm" className="!text-paper/75 hover:!bg-white/10 hover:!text-paper" onClick={() => window.print()}>
              <Printer size={14} /> <span className="hidden sm:inline">Print</span>
            </Button>
            <Button variant="ghost" size="sm" className="!text-paper/75 hover:!bg-white/10 hover:!text-paper" onClick={() => setShareOpen(true)}>
              <Share2 size={14} /> <span className="hidden sm:inline">Share</span>
            </Button>
            <Button variant="citron" size="sm" onClick={() => setDlOpen(true)}>
              <FileDown size={14} /> <span className="hidden sm:inline">Download PDF</span>
            </Button>
          </div>
        </div>
        {/* tabs */}
        <div className="px-4 flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={cx(
                "flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold rounded-t-lg transition-colors border-b-2",
                tab === t.k ? "bg-paper text-ink border-moss" : "text-paper/55 hover:text-paper border-transparent"
              )}
            >
              <t.icon size={14} className={t.k === "ats" ? (report!.score >= 80 ? "text-leaf" : "text-honey") : undefined} />
              {t.l}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[480px_1fr] gap-0 items-start">
        {/* left: forms */}
        <div className="p-4 lg:p-6 lg:max-h-[calc(100vh-98px)] lg:overflow-y-auto lg:sticky lg:top-[98px]">
          {tab === "content" && <ContentForms resume={resume} />}
          {tab === "design" && <DesignPanel resume={resume} onLocked={() => setUpgradeOpen(true)} />}
          {tab === "ats" && <AtsPanel resume={resume} />}
        </div>

        {/* right: live preview */}
        <div className="lg:sticky lg:top-[98px] lg:h-[calc(100vh-98px)] border-t lg:border-t-0 lg:border-l border-mist bg-ink/[0.04] flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-mist bg-paper/80 backdrop-blur">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-ink/45">
              <Eye size={13} className="text-moss" /> Live preview
              <span className="normal-case tracking-normal">· A4 · {pages} page{pages > 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setFit((f) => clamp(f - 0.1, 0.3, 1.2))} className="p-1.5 rounded-md hover:bg-ink/8 text-ink/50 transition-colors" aria-label="Zoom out"><Minus size={14} /></button>
              <span className="text-[11px] font-mono text-ink/50 w-10 text-center">{Math.round(scale * 100)}%</span>
              <button onClick={() => setFit((f) => clamp(f + 0.1, 0.3, 1.2))} className="p-1.5 rounded-md hover:bg-ink/8 text-ink/50 transition-colors" aria-label="Zoom in"><ZoomIn size={14} /></button>
              <button onClick={() => setFit(0.58)} className="ml-1 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md border border-mist text-ink/50 hover:text-ink hover:border-ink/30 transition-colors">fit</button>
            </div>
          </div>
          <div ref={wrapRef} className="flex-1 overflow-auto p-5 bg-dots">
            <div className="mx-auto sheet-in" key={resume.templateId} style={{ width: 794 * scale, height: sheetH * scale }}>
              <div ref={sheetRef} style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 794 }}>
                <ResumeSheet resume={resume} shadow />
              </div>
            </div>
            <p className="text-center text-[11px] font-mono text-ink/35 mt-4 pb-2">
              {getTheme(resume.templateId).name} · every keystroke re-renders this page
            </p>
          </div>
        </div>
      </div>

      {/* hidden full-size node for PDF export */}
      <div className="fixed left-[-9999px] top-0" ref={exportRef} aria-hidden>
        <ResumeSheet resume={resume} />
      </div>
      {createPortal(
        <div id="print-root"><ResumeSheet resume={resume} /></div>,
        document.body
      )}

      {/* share modal */}
      <Modal open={shareOpen} onClose={() => setShareOpen(false)} title="Share this resume" wide>
        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-lg border border-mist bg-white px-4 py-3">
            <div>
              <div className="text-sm font-bold text-ink">Public visibility</div>
              <div className="text-[12px] text-ink/50">Anyone with the link can view this resume.</div>
            </div>
            <Toggle checked={resume.isPublic} onChange={() => { togglePublic(resume.id); toast(resume.isPublic ? "Resume is now private" : "Resume is now public", "info"); }} />
          </div>

          {resume.isPublic ? (
            <div className="grid sm:grid-cols-[1fr_auto] gap-5">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/45 mb-2">Public URL</div>
                <div className="flex gap-2">
                  <input readOnly value={shareUrl} className="flex-1 rounded-lg border border-mist bg-white px-3 py-2.5 text-[13px] font-mono text-ink/70 outline-none" />
                  <Button variant="dark" onClick={() => { copyText(shareUrl); toast("Link copied"); }}>Copy</Button>
                </div>
                <p className="text-[12px] text-ink/45 mt-2.5 flex items-center gap-1.5">
                  <Globe size={12} /> {resume.views} people have viewed this page
                </p>
                <div className="mt-4 rounded-lg bg-pine text-paper p-4">
                  <div className="text-[13px] font-semibold flex items-center gap-2"><QrCode size={15} className="text-citron" /> Put it on your next application</div>
                  <p className="text-[12px] text-paper/60 mt-1">Drop the QR in a cover letter or email signature — scan, resume opens.</p>
                </div>
              </div>
              <div className="text-center">
                {qr ? (
                  <div className="inline-block bg-white border border-mist rounded-xl p-3">
                    <img src={qr} alt="QR code linking to public resume" width={164} height={164} />
                    <div className="text-[11px] font-mono text-ink/45 mt-1.5">Scan to view resume</div>
                  </div>
                ) : (
                  <div className="w-[188px] h-[210px] flex items-center justify-center border border-dashed border-mist rounded-xl"><Loader2 className="spin-slow text-ink/30" size={22} /></div>
                )}
                <a
                  href={qr}
                  download={`${resume.slug}-qr.png`}
                  className={cx("mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold", qr ? "text-moss hover:underline" : "text-ink/30 pointer-events-none")}
                >
                  <Download size={12} /> Download QR (PNG)
                </a>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink/55">
              Turn on public visibility to get a shareable URL like{" "}
              <span className="font-mono text-[12px] bg-white border border-mist rounded px-1.5 py-0.5">/r/{resume.slug}</span>{" "}
              and a QR code.
            </p>
          )}
        </div>
      </Modal>

      {/* download modal */}
      <Modal open={dlOpen} onClose={() => setDlOpen(false)} title="Download as PDF">
        <div className="space-y-4">
          <Input label="File name" value={filename} onChange={(e) => setFilename(e.target.value)} hint={`${filename || resume.slug}.pdf`} />
          <div className="rounded-lg border border-mist bg-white divide-y divide-mist">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-bold text-ink">Page header</div>
                <div className="text-[12px] text-ink/50">Name + title, top-right of every page</div>
              </div>
              <Toggle checked={optHeader} onChange={setOptHeader} />
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-bold text-ink">Page footer</div>
                <div className="text-[12px] text-ink/50">Contact + “Page X / Y” on every page</div>
              </div>
              <Toggle checked={optFooter} onChange={setOptFooter} />
            </div>
          </div>
          <div className="text-[12px] text-ink/50 space-y-1 font-mono">
            <div>· A4 portrait · {pages} page{pages > 1 ? "s" : ""} · entries never split across pages</div>
            {me.plan === "free" && <div className="text-honey">· Free plan adds a small “Made with ResumeCraft” line</div>}
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { window.print(); }}><Printer size={14} /> Print instead</Button>
            <Button onClick={doExport} disabled={exporting}>
              {exporting ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
              {exporting ? "Rendering…" : "Download PDF"}
            </Button>
          </div>
        </div>
      </Modal>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
