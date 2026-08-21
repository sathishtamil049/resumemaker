import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight, Copy, Crown, Download, Eye, FileText, Layers, LogOut,
  Pencil, Plus, Share2, Trash2, User as UserIcon, ShieldCheck, X,
} from "lucide-react";
import { FREE_RESUME_LIMIT, useCurrentUser, useMyResumes, useStore } from "../store";
import { THEMES, getTheme } from "../lib/templates";
import { buildResume, sampleData } from "../lib/sample";
import { computeATS } from "../lib/ats";
import { copyText, cx, lastNDays, timeAgo } from "../lib/utils";
import { Button, Logo, Modal, PlanChip, Reveal, ScoreRing, UpgradeModal, toast } from "../components/ui";
import { MiniSheet } from "../components/ResumeSheet";

export function AppHeader() {
  const me = useCurrentUser();
  const logout = useStore((s) => s.logout);
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-40 bg-pine text-paper border-b border-white/10">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
        <Link to="/app"><Logo dark /></Link>
        <nav className="flex items-center gap-1.5">
          {me?.isAdmin && (
            <Link to="/app/admin" className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-citron/90 hover:bg-white/10 transition-colors">
              <ShieldCheck size={14} /> Admin
            </Link>
          )}
          <Link to="/app/profile" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold text-paper/75 hover:text-paper hover:bg-white/10 transition-colors">
            <span className="w-6 h-6 rounded-full bg-citron text-pine font-display font-bold text-[11px] flex items-center justify-center">
              {(me?.name || "?").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
            </span>
            <span className="hidden sm:inline">{me?.name.split(" ")[0]}</span>
          </Link>
          <button
            onClick={() => { logout(); nav("/"); }}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-paper/60 hover:text-paper hover:bg-white/10 transition-colors"
          >
            <LogOut size={14} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

export default function Dashboard() {
  const me = useCurrentUser()!;
  const resumes = useMyResumes();
  const nav = useNavigate();
  const { deleteResume, duplicateResume, togglePublic, createResume } = useStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [tpl, setTpl] = useState("green");
  const [useSample, setUseSample] = useState(true);

  const totals = useMemo(() => {
    const dl = resumes.reduce((n, r) => n + r.downloads, 0);
    const vw = resumes.reduce((n, r) => n + r.views, 0);
    const tpls = new Set(resumes.map((r) => r.templateId)).size;
    const days = lastNDays(14);
    const series = days.map((d) => ({
      day: d,
      d: resumes.reduce((n, r) => n + (r.activity[d]?.d ?? 0), 0),
      v: resumes.reduce((n, r) => n + (r.activity[d]?.v ?? 0), 0),
    }));
    return { dl, vw, tpls, series };
  }, [resumes]);

  const maxV = Math.max(1, ...totals.series.map((s) => s.v));
  const atLimit = me.plan === "free" && resumes.length >= FREE_RESUME_LIMIT;

  const doCreate = () => {
    const r = createResume(title || "My Resume", tpl, useSample);
    if (!r.ok) {
      toast(r.error!, "err");
      if (r.error?.includes("Upgrade")) setUpgradeOpen(true);
      return;
    }
    setCreateOpen(false);
    setTitle("");
    toast("Resume created — start filling it in");
    nav(`/app/resume/${r.resume!.id}`);
  };

  return (
    <div className="min-h-screen bg-paper bg-ruled">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-5 py-8">
        {/* greeting */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/45">
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-ink mt-1.5">
              Welcome, {me.name.split(" ")[0]}<span className="text-moss">.</span>
            </h1>
            <div className="flex items-center gap-2.5 mt-2.5">
              <PlanChip plan={me.plan} />
              {me.plan === "free" && (
                <button onClick={() => setUpgradeOpen(true)} className="inline-flex items-center gap-1 text-[13px] font-semibold text-moss hover:underline">
                  <Crown size={13} /> Upgrade for unlimited resumes
                </button>
              )}
            </div>
          </div>
          <Button size="lg" onClick={() => (atLimit ? setUpgradeOpen(true) : setCreateOpen(true))}>
            <Plus size={17} /> Create New Resume
          </Button>
        </div>

        {/* stat band */}
        <Reveal className="mt-8">
          <div className="grid grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.6fr] gap-3">
            {[
              { label: "My Resumes", value: resumes.length, icon: FileText, sub: me.plan === "free" ? `of ${FREE_RESUME_LIMIT} on free` : "unlimited" },
              { label: "Downloads", value: totals.dl, icon: Download, sub: "all time" },
              { label: "Templates used", value: totals.tpls, icon: Layers, sub: `of ${THEMES.length} available` },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-mist bg-white p-5 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pine/8 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45">{s.label}</span>
                  <s.icon size={16} className="text-moss" />
                </div>
                <div className="font-display text-4xl font-extrabold text-ink mt-2">{s.value}</div>
                <div className="text-[12px] text-ink/40 mt-0.5">{s.sub}</div>
              </div>
            ))}
            {/* sparkline card */}
            <div className="rounded-xl border border-pine2 bg-pine p-5 text-paper col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/50">Views · last 14 days</span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-citron"><Eye size={12} /> {totals.vw}</span>
              </div>
              <div className="flex items-end gap-[5px] h-[74px] mt-3">
                {totals.series.map((s) => (
                  <div key={s.day} className="flex-1 flex flex-col justify-end gap-[2px] group relative">
                    <div className="rounded-[2px] bg-citron/90 group-hover:bg-citron transition-colors" style={{ height: `${(s.v / maxV) * 58 + 2}px` }} title={`${s.day}: ${s.v} views`}>
                    </div>
                    <div className="rounded-[2px] bg-leaf/80" style={{ height: `${Math.max(2, (s.d / maxV) * 22)}px` }} title={`${s.d} downloads`}></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-mono text-paper/40">
                <span>■ views</span><span className="text-leaf">■ downloads</span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* resume list */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-extrabold text-ink">My Resumes</h2>
            <span className="font-mono text-[11px] uppercase tracking-widest text-ink/40">{resumes.length} total</span>
          </div>

          {resumes.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-ink/15 bg-white/50 p-12 text-center">
              <FileText size={32} className="mx-auto text-ink/25 mb-3" />
              <p className="font-display text-xl font-bold text-ink">No resumes yet</p>
              <p className="text-sm text-ink/50 mt-1 mb-5">Your first one takes about four minutes.</p>
              <Button onClick={() => setCreateOpen(true)}><Plus size={15} /> Create your first resume</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((r, i) => {
                const theme = getTheme(r.templateId);
                const ats = computeATS(r.data).score;
                return (
                  <Reveal key={r.id} delay={i * 60}>
                    <div className="group rounded-xl border border-mist bg-white p-4 flex items-center gap-4 hover:border-moss/40 hover:shadow-lg hover:shadow-pine/8 transition-all duration-200">
                      <div className="w-[72px] shrink-0 hidden sm:block">
                        <MiniSheet resume={r} width={72} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button onClick={() => nav(`/app/resume/${r.id}`)} className="font-display font-bold text-[17px] text-ink hover:text-moss transition-colors truncate text-left">
                            {r.title}
                          </button>
                          {r.isPublic && (
                            <span className="text-[10px] font-mono uppercase tracking-wider bg-moss/10 text-moss border border-moss/25 rounded-full px-2 py-0.5">public</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[12px] text-ink/45 font-mono flex-wrap">
                          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: theme.accent }} />{theme.name}</span>
                          <span>Updated: {timeAgo(r.updatedAt)}</span>
                          <span className="inline-flex items-center gap-1"><Download size={11} />{r.downloads}</span>
                          <span className="inline-flex items-center gap-1"><Eye size={11} />{r.views}</span>
                        </div>
                      </div>
                      <div className="hidden md:block text-center shrink-0 w-16">
                        <ScoreRing score={ats} size={52} stroke={5} />
                        <div className="text-[9px] font-mono uppercase tracking-wider text-ink/40 mt-1">ATS</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="sm" variant="dark" onClick={() => nav(`/app/resume/${r.id}`)}>
                          <Pencil size={13} /> <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <button title="Duplicate" onClick={() => { duplicateResume(r.id); toast("Resume duplicated"); }} className="p-2 rounded-lg text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors"><Copy size={15} /></button>
                        <button
                          title={r.isPublic ? "Copy public link" : "Make public to share"}
                          onClick={async () => {
                            if (!r.isPublic) togglePublic(r.id);
                            const url = `${location.origin}${location.pathname}#/r/${r.slug}`;
                            await copyText(url);
                            toast(r.isPublic ? "Public link copied to clipboard" : "Made public + link copied");
                          }}
                          className="p-2 rounded-lg text-ink/40 hover:text-moss hover:bg-moss/10 transition-colors"
                        >
                          <Share2 size={15} />
                        </button>
                        <button title="Delete" onClick={() => setDeleteId(r.id)} className="p-2 rounded-lg text-ink/40 hover:text-rust hover:bg-rust/10 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>

        {/* templates strip */}
        <Reveal className="mt-10">
          <div className="rounded-xl bg-pine text-paper p-6 flex flex-wrap items-center gap-5 justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-dots-dark opacity-60 pointer-events-none" />
            <div>
              <h3 className="font-display text-2xl font-extrabold">Eight templates, one content.</h3>
              <p className="text-paper/60 text-sm mt-1">Switch templates any time — your details never need retyping.</p>
            </div>
            <Button variant="citron" onClick={() => (atLimit ? setUpgradeOpen(true) : setCreateOpen(true))}>
              <ArrowUpRight size={15} /> Browse templates
            </Button>
          </div>
        </Reveal>
      </main>

      {/* create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New resume" wide>
        <div className="space-y-5">
          <div>
            <label className="block text-[11px] font-mono font-medium uppercase tracking-[0.12em] text-ink/55 mb-1.5">Resume title</label>
            <input
              autoFocus
              className="w-full rounded-lg border border-mist bg-white px-3.5 py-2.5 text-sm outline-none focus:border-moss focus:ring-2 focus:ring-moss/15"
              placeholder="e.g. Software Developer Resume"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doCreate()}
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono font-medium uppercase tracking-[0.12em] text-ink/55 mb-2">Template</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {THEMES.map((t) => {
                const locked = me.plan === "free" && !t.free;
                return (
                  <button
                    key={t.id}
                    onClick={() => !locked && setTpl(t.id)}
                    className={cx(
                      "relative rounded-lg border p-2 text-left transition-all",
                      tpl === t.id ? "border-moss ring-2 ring-moss/20" : "border-mist hover:border-ink/25",
                      locked && "opacity-55"
                    )}
                  >
                    <MiniSheet resume={buildResume(me.id, "", t.id, sampleData())} width={110} />
                    <div className="mt-1.5 text-[11px] font-semibold text-ink truncate">{t.name}</div>
                    {locked && (
                      <span className="absolute top-1.5 right-1.5 bg-pine text-citron text-[9px] font-mono uppercase px-1.5 py-0.5 rounded">pro</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2">
            {[
              { v: true, l: "Fill with sample data", d: "Great for exploring" },
              { v: false, l: "Start blank", d: "Uses your name & email" },
            ].map((o) => (
              <button
                key={String(o.v)}
                onClick={() => setUseSample(o.v)}
                className={cx(
                  "flex-1 rounded-lg border p-3 text-left transition-all",
                  useSample === o.v ? "border-moss bg-moss/5" : "border-mist hover:border-ink/25"
                )}
              >
                <div className="text-[13px] font-bold text-ink">{o.l}</div>
                <div className="text-[11px] text-ink/45">{o.d}</div>
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={doCreate}><Plus size={15} /> Create resume</Button>
          </div>
        </div>
      </Modal>

      {/* delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete this resume?">
        <p className="text-sm text-ink/60">
          This permanently removes <span className="font-semibold text-ink">{resumes.find((r) => r.id === deleteId)?.title}</span> including its public link and stats.
        </p>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Keep it</Button>
          <Button variant="danger" onClick={() => { deleteResume(deleteId!); setDeleteId(null); toast("Resume deleted", "info"); }}>
            <Trash2 size={14} /> Delete forever
          </Button>
        </div>
      </Modal>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

      <footer className="max-w-6xl mx-auto px-5 py-8 text-[12px] font-mono text-ink/35 flex items-center justify-between">
        <span>ResumeCraft — enter once, apply everywhere.</span>
        <Link to="/" className="hover:text-moss inline-flex items-center gap-1">About the craft <ArrowUpRight size={11} /></Link>
      </footer>
    </div>
  );
}
