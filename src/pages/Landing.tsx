import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, ArrowUpRight, Check, Download, FileCheck2, Layers, Lock,
  QrCode, ScanLine, ShieldCheck, Sparkles, Type,
} from "lucide-react";
import QRCode from "qrcode";
import { useCurrentUser, useStore } from "../store";
import { buildResume, sampleData, SAMPLE_JD } from "../lib/sample";
import { THEMES } from "../lib/templates";
import { computeATS } from "../lib/ats";
import { cx } from "../lib/utils";
import { Button, Logo, Reveal, ScoreRing, UpgradeModal, PLAN_INFO } from "../components/ui";
import { MiniSheet, ResumeSheet } from "../components/ResumeSheet";

function useTyped(text: string, speed = 34) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const iv = setInterval(() => setN((v) => (v >= text.length ? v : v + 1)), speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return text.slice(0, n);
}

const FLOW = [
  { n: "01", t: "Enter it once", d: "Thirteen sections — from work history to hobbies — in one guided form. Auto-saved on every keystroke, so nothing is ever lost.", icon: Type },
  { n: "02", t: "Pick a template", d: "Eight hand-set designs, from ATS-safe to boardroom serif. Swap any time — your content never needs retyping.", icon: Layers },
  { n: "03", t: "Preview live on A4", d: "A true two-column studio: form on the left, the actual printed page on the right, re-rendered as you type.", icon: FileCheck2 },
  { n: "04", t: "Beat the ATS", d: "A scoring engine checks contact info, bullets, verbs, numbers and keywords — then matches you against the job post itself.", icon: ShieldCheck },
  { n: "05", t: "Download & share", d: "Pixel-perfect paginated PDF with headers and footers, a print path, a public URL, and a QR code for paper applications.", icon: Download },
];

export default function Landing() {
  const nav = useNavigate();
  const me = useCurrentUser();
  const login = useStore((s) => s.login);
  const createResume = useStore((s) => s.createResume);

  const [tplIdx, setTplIdx] = useState(0);
  const [jd, setJd] = useState(SAMPLE_JD);
  const [qr, setQr] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const typed = useTyped("ENTER ONCE · PREVIEW LIVE · BEAT THE ATS · DOWNLOAD");

  const heroResume = useMemo(
    () => buildResume("u-demo", "Demo", THEMES[tplIdx].id, sampleData()),
    [tplIdx]
  );
  useEffect(() => {
    const iv = setInterval(() => setTplIdx((i) => (i + 1) % THEMES.length), 3400);
    return () => clearInterval(iv);
  }, []);

  const sample = useMemo(() => sampleData(), []);
  const ats = useMemo(() => computeATS(sample, jd), [sample, jd]);

  useEffect(() => {
    QRCode.toDataURL("https://resumecraft.app/r/sathish-vt", {
      width: 400, margin: 2, color: { dark: "#16241c", light: "#ffffff" },
    }).then(setQr).catch(() => setQr(""));
  }, []);

  const useTemplate = (tplId: string, free: boolean) => {
    if (!me) return nav("/auth?mode=register");
    if (me.plan === "free" && !free) return setUpgradeOpen(true);
    const t = THEMES.find((x) => x.id === tplId)!;
    const r = createResume(`${t.name} Resume`, tplId, true);
    if (r.ok) nav(`/app/resume/${r.resume!.id}`);
  };

  return (
    <div className="min-h-screen bg-paper text-ink overflow-x-clip">
      {/* nav */}
      <header className="sticky top-0 z-50 bg-paper/85 backdrop-blur border-b border-mist">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <Link to="/"><Logo /></Link>
          <nav className="hidden md:flex items-center gap-6 text-[13.5px] font-semibold text-ink/65">
            <a href="#templates" className="hover:text-ink transition-colors">Templates</a>
            <a href="#ats" className="hover:text-ink transition-colors">ATS checker</a>
            <a href="#share" className="hover:text-ink transition-colors">Sharing</a>
            <a href="#pricing" className="hover:text-ink transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            {me ? (
              <Button variant="dark" size="sm" onClick={() => nav("/app")}>Open dashboard <ArrowUpRight size={13} /></Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => nav("/auth")}>Sign in</Button>
                <Button size="sm" onClick={() => nav("/auth?mode=register")}>Start free</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* opening — the press room */}
      <section className="relative bg-dots">
        <div className="max-w-6xl mx-auto px-5 pt-14 pb-20 grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] text-moss font-medium type-caret">{typed}</p>
            <h1 className="font-display text-[13.5vw] sm:text-7xl lg:text-[5.2rem] font-extrabold leading-[0.98] tracking-tight mt-5">
              Your career,
              <br />
              <span className="italic text-moss">typeset</span> like
              <br />
              a front page.
            </h1>
            <p className="mt-6 text-[17px] text-ink/65 leading-relaxed max-w-lg">
              ResumeCraft is a resume press shop: enter your details <strong className="text-ink font-semibold">once</strong>,
              flip between eight templates, watch the A4 page set itself live, score it against
              the ATS — then ship it as a PDF, a link, or a QR code.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={() => nav(me ? "/app" : "/auth?mode=register")}>
                Build my resume <ArrowRight size={16} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  if (me) return nav("/app");
                  const r = login("sathish@example.com", "demo1234");
                  if (r.ok) nav("/app");
                }}
              >
                <Sparkles size={15} className="text-honey" /> Try the live demo
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6 font-mono text-[11.5px] text-ink/45 flex-wrap">
              <span><strong className="text-ink text-[13px]">8</strong> templates</span>
              <span className="w-1 h-1 rounded-full bg-ink/25" />
              <span><strong className="text-ink text-[13px]">A4</strong> print-perfect PDFs</span>
              <span className="w-1 h-1 rounded-full bg-ink/25" />
              <span><strong className="text-ink text-[13px]">92%</strong> avg. ATS score</span>
            </div>
          </div>

          {/* the stack of proofs */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute inset-0 -m-8 bg-dots-dark rounded-3xl opacity-70 pointer-events-none" style={{ background: "radial-gradient(ellipse at 70% 30%, rgba(21,127,76,0.12), transparent 60%)" }} />
            <div className="relative">
              <div className="absolute -left-7 top-6 w-[330px] h-[466px] bg-white border border-mist rounded-sm shadow-xl shadow-pine/10 rotate-[-6deg]" />
              <div className="absolute -left-3 top-3 w-[330px] h-[466px] bg-white border border-mist rounded-sm shadow-xl shadow-pine/10 rotate-[-2.5deg]" />
              <div className="relative w-[330px] h-[466px] overflow-hidden rounded-sm shadow-2xl shadow-pine/25 ring-1 ring-mist">
                <div key={tplIdx} className="sheet-in" style={{ width: 330, height: 466, overflow: "hidden" }}>
                  <div style={{ transform: `scale(${330 / 794})`, transformOrigin: "top left", width: 794 }}>
                    <ResumeSheet resume={heroResume} />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-pine text-paper text-[11px] font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full shadow-lg">
                now setting: <span className="text-citron font-semibold">{THEMES[tplIdx].name}</span>
              </div>
              <div className="absolute -left-14 top-16 bob bg-white border border-mist rounded-lg shadow-lg shadow-pine/15 px-3.5 py-2.5" style={{ ["--tilt" as string]: "-4deg" }}>
                <div className="flex items-center gap-2">
                  <ScoreRing score={ats.score} size={44} stroke={5} />
                  <div className="text-[11px] font-mono uppercase tracking-wider text-ink/50 leading-tight">ATS<br />ready</div>
                </div>
              </div>
              <div className="absolute -right-6 -top-5 bob bg-citron text-pine rounded-lg shadow-lg shadow-citron/40 px-3.5 py-2 text-[12px] font-bold flex items-center gap-1.5" style={{ ["--tilt" as string]: "3deg", animationDelay: "1.2s" }}>
                <QrCode size={14} /> PDF · Link · QR
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* marquee */}
      <div className="bg-pine text-paper py-3.5 overflow-hidden border-y border-pine2">
        <div className="marquee-track flex w-max items-center gap-8 font-mono text-[12px] uppercase tracking-[0.2em] text-paper/70">
          {[0, 1].map((rep) => (
            <div key={rep} className="flex items-center gap-8">
              {THEMES.map((t) => (
                <span key={t.id} className="flex items-center gap-8">
                  <span className="hover:text-citron transition-colors cursor-default">{t.name}</span>
                  <span className="text-citron">✳</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* the flow */}
      <section className="max-w-6xl mx-auto px-5 py-24">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-moss font-medium">The workflow</p>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold mt-2 max-w-2xl leading-[1.05]">
            From blank page to <span className="italic text-moss">hired</span>, in five moves.
          </h2>
        </Reveal>
        <div className="mt-12 border-t border-ink/10">
          {FLOW.map((f, i) => (
            <Reveal key={f.n} delay={i * 50}>
              <div className="group grid sm:grid-cols-[110px_1fr_1.4fr] gap-4 sm:gap-8 items-baseline border-b border-ink/10 py-7 hover:bg-white/70 hover:pl-4 transition-all duration-300">
                <span className="font-mono text-[13px] text-ink/35 group-hover:text-moss transition-colors">{f.n}</span>
                <div className="flex items-center gap-3">
                  <f.icon size={19} className="text-moss shrink-0" />
                  <h3 className="font-display text-2xl font-bold">{f.t}</h3>
                </div>
                <p className="text-[15px] text-ink/60 leading-relaxed">{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* templates */}
      <section id="templates" className="bg-pine text-paper py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots-dark opacity-40 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-5 relative">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-citron font-medium">The type case</p>
                <h2 className="font-display text-4xl sm:text-5xl font-extrabold mt-2 leading-[1.05]">Eight templates.<br />Zero retyping.</h2>
              </div>
              <p className="text-paper/55 max-w-sm text-[15px] leading-relaxed">
                Every template is set by hand — real typographic hierarchy, not a CSS costume. Click one to start a resume with it.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {THEMES.map((t, i) => {
              const locked = me?.plan === "free" && !t.free;
              const r = buildResume("u-demo", "", t.id, sampleData());
              return (
                <Reveal key={t.id} delay={(i % 4) * 70}>
                  <button
                    onClick={() => useTemplate(t.id, t.free)}
                    className="group w-full text-left bg-white/5 hover:bg-white/10 border border-white/12 hover:border-citron/50 rounded-xl p-4 transition-all duration-300 hover:-translate-y-1.5"
                  >
                    <div className="relative overflow-hidden rounded-md">
                      <MiniSheet resume={r} width={208} />
                      <div className="absolute inset-0 bg-pine/0 group-hover:bg-pine/25 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 bg-citron text-pine text-[12px] font-bold px-4 py-2 rounded-full shadow-lg inline-flex items-center gap-1.5">
                          {locked ? <><Lock size={12} /> Pro</> : <>Use template <ArrowRight size={12} /></>}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-display font-bold text-[15px]">{t.name}</span>
                      {!t.free && <span className="text-[9px] font-mono uppercase tracking-wider text-citron/80 border border-citron/40 rounded-full px-2 py-0.5">pro</span>}
                    </div>
                    <div className="text-[12px] text-paper/45 mt-0.5">{t.tags.join(" · ")}</div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ATS demo */}
      <section id="ats" className="max-w-6xl mx-auto px-5 py-24">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-12 items-start">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-moss font-medium">The gatekeeper test</p>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold mt-2 leading-[1.05]">
              Score it before<br />the <span className="italic text-moss">robot</span> does.
            </h2>
            <p className="mt-5 text-[15.5px] text-ink/60 leading-relaxed max-w-md">
              75% of resumes are rejected by applicant-tracking systems before a human reads them.
              ResumeCraft grades yours across 12 checks — contact info, bullet quality, action verbs,
              numbers, dates — then matches your keywords against the actual job post.
            </p>
            <ul className="mt-7 space-y-3.5">
              {[
                "12-point compatibility audit with plain-English fixes",
                "Paste any job description — see matched & missing keywords",
                "One tap adds a missing keyword to your skills section",
                "Score updates live as you edit, right in the builder",
              ].map((li) => (
                <li key={li} className="flex items-start gap-3 text-[14.5px] text-ink/70">
                  <Check size={16} className="text-moss mt-0.5 shrink-0" /> {li}
                </li>
              ))}
            </ul>
            <Button className="mt-8" size="lg" onClick={() => nav(me ? "/app" : "/auth?mode=register")}>
              Check my resume <ArrowRight size={15} />
            </Button>
          </Reveal>

          <Reveal delay={100}>
            <div className="rounded-2xl border border-pine2 bg-pine text-paper p-6 shadow-2xl shadow-pine/25">
              <div className="flex items-center gap-5">
                <ScoreRing score={ats.score} size={110} stroke={9} color="#D8E96A" label="live" light />
                <div>
                  <div className="font-display text-xl font-extrabold">ATS Compatibility</div>
                  <div className="text-[13px] text-paper/55 mt-1">Sample resume vs. the job post below — edit it and watch the score move.</div>
                </div>
              </div>
              <div className="mt-5 grid sm:grid-cols-2 gap-2">
                {ats.checks.slice(0, 6).map((c) => (
                  <div key={c.id} className="flex items-center gap-2 rounded-lg bg-white/6 border border-white/10 px-3 py-2 text-[12.5px]">
                    {c.status === "pass" ? <Check size={13} className="text-citron shrink-0" /> : <span className="text-honey shrink-0">⚠</span>}
                    <span className="text-paper/85">{c.label}</span>
                  </div>
                ))}
              </div>
              <textarea
                rows={5}
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                className="mt-4 w-full rounded-lg bg-white/8 border border-white/12 px-3.5 py-3 text-[13px] text-paper/90 outline-none focus:border-citron/60 resize-y font-mono"
                aria-label="Job description for ATS demo"
              />
              {ats.keywords && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-paper/45">Keyword match</span>
                    <span className="font-display font-extrabold text-citron text-lg">{ats.keywords.coverage}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-citron rounded-full transition-all duration-500" style={{ width: `${ats.keywords.coverage}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {ats.keywords.missing.slice(0, 6).map((k) => (
                      <span key={k} className="text-[11.5px] font-mono bg-honey/15 border border-honey/40 text-honey rounded-full px-2.5 py-0.5">+ {k}</span>
                    ))}
                    {ats.keywords.matched.slice(0, 8).map((k) => (
                      <span key={k} className="text-[11.5px] font-mono bg-leaf/12 border border-leaf/35 text-leaf rounded-full px-2.5 py-0.5">✓ {k}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* share band */}
      <section id="share" className="max-w-6xl mx-auto px-5 pb-24">
        <Reveal>
          <div className="rounded-2xl border border-mist bg-white overflow-hidden grid md:grid-cols-[1.2fr_1fr]">
            <div className="p-8 sm:p-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-moss font-medium">The hand-off</p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold mt-2 leading-[1.05]">One link. One QR.<br />Every application channel.</h2>
              <p className="mt-4 text-[15px] text-ink/60 leading-relaxed max-w-md">
                Publish a resume to a clean public page with view tracking, or keep it private with one toggle.
                The QR drops straight into cover letters and email signatures — scan, and it opens.
              </p>
              <div className="mt-6 rounded-lg border border-mist bg-paper px-4 py-3 flex items-center gap-3 max-w-md">
                <ScanLine size={16} className="text-moss shrink-0" />
                <span className="font-mono text-[13px] text-ink/65 truncate">resumecraft.app/r/<strong className="text-ink">sathish-vt</strong></span>
                <Link to="/r/sathish-vt" className="ml-auto shrink-0 text-[12px] font-bold text-moss hover:underline inline-flex items-center gap-1">
                  open live <ArrowUpRight size={11} />
                </Link>
              </div>
              <Button variant="outline" className="mt-5" onClick={() => nav(me ? "/app" : "/auth?mode=register")}>
                Get my public link <ArrowRight size={14} />
              </Button>
            </div>
            <div className="bg-dots flex items-center justify-center p-10 border-t md:border-t-0 md:border-l border-mist">
              <div className="text-center">
                {qr && <img src={qr} alt="QR code demo" className="w-44 h-44 mx-auto rounded-xl border border-mist bg-white p-2 shadow-lg shadow-pine/10" />}
                <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/45">Scan to view resume</div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* pricing */}
      <section id="pricing" className="bg-paper border-t border-mist py-24 bg-ruled">
        <div className="max-w-5xl mx-auto px-5">
          <Reveal className="text-center max-w-xl mx-auto">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-moss font-medium">The subscription</p>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold mt-2">Pay for the craft,<br />not the lock-in.</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5 mt-12 items-stretch">
            {(["free", "pro", "premium"] as const).map((p, i) => {
              const info = PLAN_INFO[p];
              return (
                <Reveal key={p} delay={i * 80}>
                  <div className={cx(
                    "h-full rounded-2xl border p-7 flex flex-col transition-all duration-300 hover:-translate-y-1",
                    p === "pro" ? "bg-pine text-paper border-pine2 shadow-2xl shadow-pine/30 relative" : "bg-white border-mist hover:shadow-xl hover:shadow-pine/10"
                  )}>
                    {p === "pro" && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-citron text-pine text-[10px] font-mono font-bold uppercase tracking-[0.14em] px-3 py-1 rounded-full">Most popular</span>
                    )}
                    <div className="font-display text-xl font-bold capitalize">{p}</div>
                    <div className={cx("font-display text-5xl font-extrabold mt-3", p === "pro" ? "text-citron" : "text-ink")}>{info.price}</div>
                    <ul className={cx("mt-6 space-y-2.5 text-[14px] flex-1", p === "pro" ? "text-paper/75" : "text-ink/65")}>
                      {info.perks.map((perk) => (
                        <li key={perk} className="flex gap-2.5 items-start">
                          <Check size={14} className={p === "pro" ? "text-citron mt-0.5 shrink-0" : "text-moss mt-0.5 shrink-0"} /> {perk}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-7 w-full"
                      variant={p === "free" ? "outline" : p === "pro" ? "citron" : "dark"}
                      onClick={() => nav(me ? "/app/profile" : "/auth?mode=register")}
                    >
                      {p === "free" ? "Start free" : `Go ${p}`}
                    </Button>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <p className="text-center text-[12px] font-mono text-ink/40 mt-8">
            This prototype upgrades plans instantly from your profile — no card, no tricks.
          </p>
        </div>
      </section>

      {/* footer */}
      <footer className="bg-pine text-paper">
        <div className="max-w-6xl mx-auto px-5 py-12 flex flex-wrap items-center justify-between gap-6">
          <div>
            <Logo dark />
            <p className="text-paper/45 text-[13px] mt-3 max-w-xs leading-relaxed">
              A resume press shop. Enter once, apply everywhere — set in {THEMES.length} house styles.
            </p>
          </div>
          <div className="flex gap-14 text-[13.5px]">
            <div className="space-y-2.5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/35 mb-3">Product</div>
              <a href="#templates" className="block text-paper/70 hover:text-citron transition-colors">Templates</a>
              <a href="#ats" className="block text-paper/70 hover:text-citron transition-colors">ATS checker</a>
              <a href="#pricing" className="block text-paper/70 hover:text-citron transition-colors">Pricing</a>
            </div>
            <div className="space-y-2.5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/35 mb-3">Account</div>
              <Link to="/auth" className="block text-paper/70 hover:text-citron transition-colors">Sign in</Link>
              <Link to="/auth?mode=register" className="block text-paper/70 hover:text-citron transition-colors">Register</Link>
              <Link to="/r/sathish-vt" className="block text-paper/70 hover:text-citron transition-colors">Public demo</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/8">
          <div className="max-w-6xl mx-auto px-5 py-4 flex flex-wrap justify-between gap-2 text-[11px] font-mono text-paper/30">
            <span>© 2026 ResumeCraft · Reg. mark ⌖ · Printed on recycled pixels</span>
            <span>React prototype — data lives in your browser</span>
          </div>
        </div>
      </footer>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
