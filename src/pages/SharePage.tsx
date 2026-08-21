import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useParams } from "react-router-dom";
import { Download, Eye, FileWarning, Printer } from "lucide-react";
import { useStore } from "../store";
import { ResumeSheet } from "../components/ResumeSheet";
import { Button, Logo } from "../components/ui";
import { getTheme } from "../lib/templates";
import { exportResumePdf } from "../lib/pdf";
import { toast } from "../components/ui";

export default function SharePage() {
  const { slug } = useParams();
  const resumes = useStore((s) => s.resumes);
  const recordView = useStore((s) => s.recordView);
  const resume = resumes.find((r) => r.slug === slug && r.isPublic);
  const [wrapW, setWrapW] = useState(820);
  const [sheetH, setSheetH] = useState(1123);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (resume) {
      const key = `rc-viewed-${resume.id}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        recordView(resume.id);
      }
    }
  }, [resume, recordView]);

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
  }, [slug]);

  const scale = Math.min(1, wrapW / 794);

  const download = async () => {
    if (!resume || !exportRef.current) return;
    setExporting(true);
    try {
      await exportResumePdf(exportRef.current, {
        filename: resume.slug,
        header: false,
        footer: true,
        metaLeft: `${resume.data.personal.fullName} — ${resume.data.personal.email}`,
        metaRight: resume.data.personal.fullName,
      });
      toast("PDF downloaded");
    } catch {
      toast("Export failed — try again", "err");
    }
    setExporting(false);
  };

  if (!resume) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-mist bg-white/70">
          <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between">
            <Link to="/"><Logo /></Link>
            <Link to="/auth"><Button variant="dark" size="sm">Build your own</Button></Link>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-6 bg-paper bg-dots">
          <div className="max-w-md w-full bg-white border border-mist rounded-xl p-8 text-center shadow-sm">
            <FileWarning size={34} className="mx-auto text-honey mb-4" />
            <h1 className="font-display text-2xl font-extrabold text-ink">This resume is private</h1>
            <p className="text-sm text-ink/55 mt-2 leading-relaxed">
              The link <span className="font-mono text-[12px] bg-paper border border-mist rounded px-1.5 py-0.5">/r/{slug}</span>{" "}
              doesn't exist or the owner turned off public visibility.
            </p>
            <Link to="/auth" className="inline-block mt-6">
              <Button>Create a public resume of your own</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const theme = getTheme(resume.templateId);

  return (
    <div className="min-h-screen bg-ink/95">
      <header className="sticky top-0 z-20 bg-pine text-paper border-b border-white/10">
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Link to="/"><Logo dark size="sm" /></Link>
            <span className="hidden sm:inline text-paper/40 text-sm">·</span>
            <span className="hidden sm:inline text-[13px] text-paper/60 font-mono">
              public resume — {resume.data.personal.fullName || resume.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1.5 text-[12px] font-mono text-paper/50 mr-2">
              <Eye size={13} /> {resume.views} views
            </span>
            <Button variant="ghost" size="sm" className="!text-paper/80 hover:!bg-white/10 hover:!text-paper" onClick={() => window.print()}>
              <Printer size={14} /> Print
            </Button>
            <Button variant="citron" size="sm" onClick={download} disabled={exporting}>
              <Download size={14} /> {exporting ? "Rendering…" : "Download PDF"}
            </Button>
          </div>
        </div>
      </header>

      <main ref={wrapRef} className="max-w-5xl mx-auto px-4 py-8">
        <div className="mx-auto" style={{ width: 794 * scale, height: sheetH * scale }}>
          <div ref={sheetRef} style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 794 }}>
            <ResumeSheet resume={resume} shadow />
          </div>
        </div>
        <p className="text-center text-paper/35 text-[12px] font-mono mt-5">
          Set in the “{theme.name}” template · Rendered live by ResumeCraft
        </p>
      </main>

      <div className="fixed left-[-9999px] top-0" ref={exportRef} aria-hidden>
        <ResumeSheet resume={resume} />
      </div>

      {createPortal(
        <div id="print-root"><ResumeSheet resume={resume} /></div>,
        document.body
      )}

      <div className="fixed bottom-5 right-5 z-30">
        <Link to="/auth">
          <Button variant="citron" size="sm">Made with ResumeCraft — build yours</Button>
        </Link>
      </div>
    </div>
  );
}
