import React, { useEffect, useRef, useState } from "react";
import { Check, Info, X, XCircle, Crown, Sparkles } from "lucide-react";
import { cx } from "../lib/utils";
import { useCurrentUser, useStore } from "../store";

/* ---------------- toasts ---------------- */
type ToastKind = "ok" | "err" | "info";
interface ToastMsg { id: number; text: string; kind: ToastKind }
let toastListeners: ((t: ToastMsg) => void)[] = [];
let toastId = 0;

export function toast(text: string, kind: ToastKind = "ok") {
  toastListeners.forEach((l) => l({ id: ++toastId, text, kind }));
}

export function Toaster() {
  const [items, setItems] = useState<ToastMsg[]>([]);
  useEffect(() => {
    const fn = (t: ToastMsg) => {
      setItems((cur) => [...cur, t]);
      setTimeout(() => setItems((cur) => cur.filter((i) => i.id !== t.id)), 3600);
    };
    toastListeners.push(fn);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== fn);
    };
  }, []);
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end">
      {items.map((t) => (
        <div
          key={t.id}
          className={cx(
            "toast-in flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg shadow-pine/20 max-w-xs",
            t.kind === "ok" && "bg-pine text-paper border-pine2",
            t.kind === "err" && "bg-rust text-white border-rust",
            t.kind === "info" && "bg-white text-ink border-mist"
          )}
        >
          {t.kind === "ok" && <Check size={15} className="text-citron shrink-0" />}
          {t.kind === "err" && <XCircle size={15} className="shrink-0" />}
          {t.kind === "info" && <Info size={15} className="text-moss shrink-0" />}
          {t.text}
        </div>
      ))}
    </div>
  );
}

/* ---------------- buttons ---------------- */
export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "dark" | "citron" | "outline" | "ghost" | "danger" | "white";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 active:scale-[0.97] disabled:opacity-45 disabled:pointer-events-none whitespace-nowrap",
        size === "sm" && "text-[13px] px-3 py-1.5",
        size === "md" && "text-sm px-4 py-2.5",
        size === "lg" && "text-[15px] px-6 py-3",
        variant === "primary" && "bg-moss text-white hover:bg-leaf shadow-sm shadow-moss/30",
        variant === "dark" && "bg-pine text-paper hover:bg-pine2",
        variant === "citron" && "bg-citron text-pine hover:brightness-105 shadow-sm shadow-citron/40",
        variant === "outline" && "border border-ink/20 text-ink hover:border-ink/50 hover:bg-white",
        variant === "ghost" && "text-ink/70 hover:text-ink hover:bg-ink/5",
        variant === "danger" && "bg-rust/10 text-rust border border-rust/30 hover:bg-rust hover:text-white",
        variant === "white" && "bg-white text-pine hover:bg-paper border border-mist",
        className
      )}
      {...props}
    />
  );
}

/* ---------------- form fields ---------------- */
export function Input({
  label,
  error,
  hint,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
}) {
  return (
    <label className="block text-left">
      {label && (
        <span className="block text-[11px] font-mono font-medium uppercase tracking-[0.12em] text-ink/55 mb-1.5">
          {label}
        </span>
      )}
      <input
        className={cx(
          "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none transition-all duration-150",
          error
            ? "border-rust ring-2 ring-rust/15"
            : "border-mist focus:border-moss focus:ring-2 focus:ring-moss/15",
          className
        )}
        {...props}
      />
      {error && <span className="block mt-1 text-xs text-rust font-medium">{error}</span>}
      {hint && !error && <span className="block mt-1 text-xs text-ink/45">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block text-left">
      {label && (
        <span className="block text-[11px] font-mono font-medium uppercase tracking-[0.12em] text-ink/55 mb-1.5">
          {label}
        </span>
      )}
      <textarea
        className={cx(
          "w-full rounded-lg border border-mist bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none transition-all duration-150 focus:border-moss focus:ring-2 focus:ring-moss/15 resize-y",
          className
        )}
        {...props}
      />
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  dark,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 group"
    >
      <span
        className={cx(
          "relative w-10 h-[22px] rounded-full transition-colors duration-200",
          checked ? "bg-moss" : dark ? "bg-white/20" : "bg-ink/15"
        )}
      >
        <span
          className={cx(
            "absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-all duration-200",
            checked ? "left-[21px]" : "left-[3px]"
          )}
        />
      </span>
      {label && (
        <span className={cx("text-sm font-medium", dark ? "text-paper/85" : "text-ink/75")}>
          {label}
        </span>
      )}
    </button>
  );
}

/* ---------------- modal ---------------- */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-pine/55 backdrop-blur-[3px]" onClick={onClose} />
      <div
        className={cx(
          "toast-in relative bg-paper border border-mist rounded-xl shadow-2xl shadow-pine/30 w-full max-h-[88vh] overflow-y-auto",
          wide ? "max-w-2xl" : "max-w-md"
        )}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-1">
          <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-ink/50 hover:text-ink hover:bg-ink/5 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- score ring ---------------- */
export function ScoreRing({
  score,
  size = 120,
  stroke = 10,
  color,
  label,
  light,
}: {
  score: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  light?: boolean;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const col = color ?? (score >= 80 ? "#157F4C" : score >= 60 ? "#DEA63B" : "#C4553B");
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className={light ? "text-white/12" : "text-ink/10"} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={col}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * Math.min(100, score)) / 100}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cx("font-display font-extrabold", light ? "text-paper" : "text-ink")}
          style={{ fontSize: size / 4 }}
        >
          {score}%
        </span>
        {label && (
          <span className={cx("text-[10px] font-mono uppercase tracking-widest", light ? "text-paper/50" : "text-ink/50")}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------------- reveal on scroll ---------------- */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.classList.add("rv-in");
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cx("rv", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ---------------- logo ---------------- */
export function Logo({ dark, size = "md" }: { dark?: boolean; size?: "sm" | "md" | "lg" }) {
  const box = size === "lg" ? 40 : size === "sm" ? 26 : 32;
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <svg width={box} height={box} viewBox="0 0 32 32">
        <rect width="32" height="32" rx="7" fill={dark ? "#D8E96A" : "#16241C"} />
        <path
          d="M9 24V8h6.2c3.2 0 5.3 1.7 5.3 4.6 0 2.2-1.2 3.7-3.2 4.2L21.5 24h-3.4l-3.7-6.6H12V24H9zm3-9.2h3c1.7 0 2.6-.9 2.6-2.2s-.9-2.2-2.6-2.2h-3v4.4z"
          fill={dark ? "#16241C" : "#D8E96A"}
        />
        <circle cx="24" cy="10" r="2.4" fill={dark ? "#157F4C" : "#2E9E63"} />
      </svg>
      <span
        className={cx(
          "font-display font-bold tracking-tight leading-none",
          size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg",
          dark ? "text-paper" : "text-ink"
        )}
      >
        Resume<span className={dark ? "text-citron" : "text-moss"}>Craft</span>
      </span>
    </span>
  );
}

/* ---------------- plan chip ---------------- */
export function PlanChip({ plan }: { plan: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider",
        plan === "free" && "bg-ink/8 text-ink/60 border border-ink/15",
        plan === "pro" && "bg-moss/12 text-moss border border-moss/25",
        plan === "premium" && "bg-honey/15 text-[#9a7118] border border-honey/40"
      )}
    >
      {plan === "premium" && <Crown size={11} />}
      {plan}
    </span>
  );
}

/* ---------------- upgrade modal ---------------- */
export const PLAN_INFO: Record<string, { price: string; perks: string[] }> = {
  free: {
    price: "₹0",
    perks: ["2 resumes", "2 starter templates", "PDF download (with badge)", "Live preview"],
  },
  pro: {
    price: "₹199/mo",
    perks: [
      "Unlimited resumes",
      "All 8 templates",
      "ATS checker + JD matcher",
      "Public resume URL + QR code",
      "No watermark",
    ],
  },
  premium: {
    price: "₹399/mo",
    perks: [
      "Everything in Pro",
      "AI-assisted bullet rewriting",
      "Job-description auto-match",
      "Cover-letter generator",
      "Priority support",
    ],
  },
};

export function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const me = useCurrentUser();
  const upgradePlan = useStore((s) => s.upgradePlan);
  return (
    <Modal open={open} onClose={onClose} title="Unlock the full craft" wide>
      <p className="text-sm text-ink/60 -mt-1 mb-5">
        Demo checkout — your plan upgrades instantly, no card required.
      </p>
      <div className="grid sm:grid-cols-3 gap-3">
        {(["free", "pro", "premium"] as const).map((p) => {
          const info = PLAN_INFO[p];
          const active = me?.plan === p;
          return (
            <div
              key={p}
              className={cx(
                "rounded-xl border p-4 flex flex-col bg-white transition-all",
                p === "pro" ? "border-moss ring-2 ring-moss/15" : "border-mist",
                active && "opacity-70"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-bold capitalize text-ink">{p}</span>
                {p === "pro" && (
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-moss text-white rounded-full px-2 py-0.5">
                    popular
                  </span>
                )}
              </div>
              <div className="font-display text-2xl font-extrabold text-ink mt-1">{info.price}</div>
              <ul className="mt-3 space-y-1.5 text-[13px] text-ink/70 flex-1">
                {info.perks.map((perk) => (
                  <li key={perk} className="flex gap-1.5 items-start">
                    <Check size={13} className="text-moss mt-0.5 shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                className="mt-4 w-full"
                variant={p === "free" ? "outline" : p === "pro" ? "primary" : "dark"}
                disabled={active}
                onClick={() => {
                  upgradePlan(p);
                  toast(`Plan switched to ${p.toUpperCase()}`);
                  onClose();
                }}
              >
                {active ? "Current plan" : `Switch to ${p}`}
              </Button>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-ink/45 flex items-center gap-1.5">
        <Sparkles size={12} className="text-honey" />
        Premium AI features ship as UI stubs in this prototype — everything else is fully functional.
      </p>
    </Modal>
  );
}
