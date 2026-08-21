import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, KeyRound, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useStore } from "../store";
import { Button, Input, Logo, toast } from "../components/ui";

type Mode = "login" | "register" | "forgot";

export default function Auth() {
  const [params, setParams] = useSearchParams();
  const mode = (params.get("mode") as Mode) || "login";
  const nav = useNavigate();
  const { login, register, resetPassword } = useStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState("");

  const setMode = (m: Mode) => {
    setError("");
    setStep(1);
    setParams(m === "login" ? {} : { mode: m });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "login") {
      const r = login(email, pass);
      if (!r.ok) return setError(r.error!);
      toast("Welcome back!");
      nav("/app");
    } else if (mode === "register") {
      if (name.trim().length < 2) return setError("Please enter your full name.");
      if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");
      if (pass.length < 6) return setError("Password must be at least 6 characters.");
      if (pass !== confirm) return setError("Passwords do not match.");
      const r = register(name, email, pass);
      if (!r.ok) return setError(r.error!);
      toast("Account created — welcome to ResumeCraft!");
      nav("/app");
    } else {
      if (step === 1) {
        if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email.");
        const c = String(Math.floor(100000 + Math.random() * 900000));
        setSentCode(c);
        setStep(2);
      } else {
        if (code !== sentCode) return setError("That code doesn't match. Check the demo inbox.");
        if (pass.length < 6) return setError("New password must be at least 6 characters.");
        if (pass !== confirm) return setError("Passwords do not match.");
        const r = resetPassword(email, pass);
        if (!r.ok) return setError(r.error!);
        toast("Password reset — sign in with your new password.");
        setMode("login");
      }
    }
  };

  const demoLogin = () => {
    const r = login("sathish@example.com", "demo1234");
    if (r.ok) {
      toast("Signed in as the demo user");
      nav("/app");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      {/* brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-pine bg-dots-dark text-paper p-12 relative overflow-hidden">
        <div
          className="absolute -right-24 -top-24 w-96 h-96 rounded-full border border-citron/15 spin-slow pointer-events-none"
          style={{ borderStyle: "dashed" }}
        />
        <Link to="/" className="w-fit"><Logo dark size="lg" /></Link>
        <div className="max-w-md">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-citron/80 mb-5">
            Member's entrance
          </p>
          <h1 className="font-display text-5xl font-extrabold leading-[1.05]">
            Your career,
            <br />
            <span className="text-citron italic">typeset</span> properly.
          </h1>
          <p className="mt-5 text-paper/65 text-[15px] leading-relaxed">
            Enter your details once. Swap templates without retyping. Score your resume
            against the ATS before a robot does.
          </p>
          <div className="mt-8 space-y-3">
            {[
              ["8 hand-set templates", "switch instantly, content stays put"],
              ["Live A4 preview", "what you see is the PDF you get"],
              ["ATS checker + JD matcher", "know your score before you apply"],
            ].map(([t, s]) => (
              <div key={t} className="flex items-start gap-3">
                <ShieldCheck size={17} className="text-leaf mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-[15px]">{t}</div>
                  <div className="text-paper/50 text-[13px]">{s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="font-mono text-[11px] text-paper/35 tracking-wider">
          REG. MARK ⌖ — EST. 2026 — PRINTED ON RECYCLED PIXELS
        </div>
      </div>

      {/* form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-paper bg-ruled">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8"><Logo /></div>

          <div className="flex gap-1 p-1 rounded-lg bg-ink/5 border border-ink/10 mb-7">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${
                  mode === m ? "bg-white shadow-sm text-ink" : "text-ink/50 hover:text-ink"
                }`}
              >
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <h2 className="font-display text-3xl font-extrabold text-ink">
            {mode === "login" && "Welcome back"}
            {mode === "register" && "Start crafting"}
            {mode === "forgot" && "Reset password"}
          </h2>
          <p className="text-sm text-ink/55 mt-1.5 mb-7">
            {mode === "login" && "Pick up where your last draft left off."}
            {mode === "register" && "Free forever — 2 resumes, 2 templates, real PDFs."}
            {mode === "forgot" && (step === 1 ? "We'll send a reset code to your inbox." : "Enter the code and choose a new password.")}
          </p>

          {mode === "forgot" && step === 2 && (
            <div className="mb-5 rounded-lg border border-honey/40 bg-honey/10 p-3.5 flex gap-3">
              <Mail size={16} className="text-honey shrink-0 mt-0.5" />
              <div className="text-[13px] text-ink/70">
                <span className="font-semibold text-ink">Demo inbox:</span> your reset code is{" "}
                <span className="font-mono font-bold text-ink text-[15px]">{sentCode}</span>
                <div className="text-ink/45 text-xs mt-0.5">(In production this arrives by email.)</div>
              </div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sathish VT" autoComplete="name" />
            )}
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mail.com" autoComplete="email" />
            {mode !== "forgot" || step === 2 ? (
              <Input
                label={mode === "forgot" ? "New password" : "Password"}
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            ) : null}
            {(mode === "register" || (mode === "forgot" && step === 2)) && (
              <Input label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
            )}
            {mode === "forgot" && step === 2 && (
              <Input label="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" />
            )}

            {error && (
              <div className="rounded-lg border border-rust/30 bg-rust/8 px-3.5 py-2.5 text-[13px] font-medium text-rust">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg">
              {mode === "login" && "Sign in"}
              {mode === "register" && "Create free account"}
              {mode === "forgot" && (step === 1 ? "Send reset code" : "Set new password")}
            </Button>
          </form>

          <div className="mt-4 text-center text-[13px] text-ink/55">
            {mode === "login" && (
              <button onClick={() => setMode("forgot")} className="hover:text-moss font-medium transition-colors">
                Forgot your password?
              </button>
            )}
            {mode === "forgot" && (
              <button onClick={() => setMode("login")} className="hover:text-moss font-medium inline-flex items-center gap-1 transition-colors">
                <ArrowLeft size={13} /> Back to sign in
              </button>
            )}
            {mode === "register" && (
              <span>
                Already have an account?{" "}
                <button onClick={() => setMode("login")} className="text-moss font-semibold hover:underline">Sign in</button>
              </span>
            )}
          </div>

          <div className="mt-8 rounded-xl border border-mist bg-white p-4">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-ink/45 mb-3">
              <KeyRound size={12} /> Demo keys
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="citron" size="sm" onClick={demoLogin}>
                <Sparkles size={13} /> Try demo account
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setMode("login"); setEmail("admin@resumecraft.app"); setPass("admin123"); }}>
                Admin · admin@resumecraft.app / admin123
              </Button>
            </div>
            <p className="text-xs text-ink/40 mt-2.5">
              Demo user ships with 3 resumes — one of them is public at <span className="font-mono">/r/sathish-vt</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
