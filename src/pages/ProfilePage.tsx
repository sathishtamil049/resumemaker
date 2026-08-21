import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, KeyRound, Trash2, UserRound } from "lucide-react";
import { useCurrentUser, useMyResumes, useStore } from "../store";
import { Button, Input, Modal, PlanChip, PLAN_INFO, UpgradeModal, toast } from "../components/ui";
import { AppHeader } from "./Dashboard";
import { timeAgo } from "../lib/utils";

export default function ProfilePage() {
  const me = useCurrentUser()!;
  const resumes = useMyResumes();
  const nav = useNavigate();
  const { updateProfile, changePassword, deleteAccount, logout } = useStore();
  const [name, setName] = useState(me.name);
  const [email, setEmail] = useState(me.email);
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [nukeOpen, setNukeOpen] = useState(false);

  const publicCount = resumes.filter((r) => r.isPublic).length;

  return (
    <div className="min-h-screen bg-paper bg-ruled">
      <AppHeader />
      <main className="max-w-3xl mx-auto px-5 py-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/45">Account</p>
        <h1 className="font-display text-4xl font-extrabold text-ink mt-1 mb-8">Your profile</h1>

        <div className="space-y-5">
          {/* profile */}
          <section className="rounded-xl border border-mist bg-white p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <UserRound size={17} className="text-moss" />
              <h2 className="font-display text-xl font-bold text-ink">Profile</h2>
              <span className="ml-auto"><PlanChip plan={me.plan} /></span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
              <span className="text-[12px] font-mono text-ink/40">
                Member since {new Date(me.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })} · {resumes.length} resumes · {publicCount} public
              </span>
              <Button
                onClick={() => {
                  if (name.trim().length < 2) return toast("Name is too short", "err");
                  const r = updateProfile({ name, email });
                  if (!r.ok) return toast(r.error!, "err");
                  toast("Profile updated");
                }}
              >
                Save changes
              </Button>
            </div>
          </section>

          {/* plan */}
          <section className="rounded-xl border border-mist bg-white p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <Crown size={17} className="text-honey" />
              <h2 className="font-display text-xl font-bold text-ink">Subscription</h2>
            </div>
            <div className="rounded-lg bg-paper border border-mist p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="font-display font-extrabold text-2xl text-ink capitalize">{me.plan} <span className="text-ink/40 text-lg font-bold">· {PLAN_INFO[me.plan].price}</span></div>
                <div className="text-[13px] text-ink/50 mt-0.5">{PLAN_INFO[me.plan].perks.slice(0, 3).join(" · ")}</div>
              </div>
              <Button variant={me.plan === "free" ? "primary" : "dark"} onClick={() => setUpgradeOpen(true)}>
                <Crown size={15} /> {me.plan === "free" ? "Upgrade to Pro" : "Change plan"}
              </Button>
            </div>
          </section>

          {/* password */}
          <section className="rounded-xl border border-mist bg-white p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <KeyRound size={17} className="text-moss" />
              <h2 className="font-display text-xl font-bold text-ink">Change password</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Input label="Current" type="password" value={cur} onChange={(e) => setCur(e.target.value)} />
              <Input label="New" type="password" value={next} onChange={(e) => setNext(e.target.value)} />
              <Input label="Confirm new" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <div className="flex justify-end mt-4">
              <Button
                variant="dark"
                onClick={() => {
                  if (next.length < 6) return toast("New password needs 6+ characters", "err");
                  if (next !== confirm) return toast("New passwords don't match", "err");
                  const r = changePassword(cur, next);
                  if (!r.ok) return toast(r.error!, "err");
                  setCur(""); setNext(""); setConfirm("");
                  toast("Password changed");
                }}
              >
                Update password
              </Button>
            </div>
          </section>

          {/* danger */}
          <section className="rounded-xl border border-rust/25 bg-rust/[0.04] p-6">
            <div className="flex items-center gap-2.5 mb-2">
              <Trash2 size={17} className="text-rust" />
              <h2 className="font-display text-xl font-bold text-rust">Danger zone</h2>
            </div>
            <p className="text-[13px] text-ink/55 mb-4">Deleting your account removes {resumes.length} resume{resumes.length !== 1 ? "s" : ""}, public links and all stats. No undo.</p>
            <Button variant="danger" onClick={() => setNukeOpen(true)}><Trash2 size={14} /> Delete account</Button>
          </section>

          <button onClick={() => { logout(); nav("/"); }} className="text-[13px] font-mono text-ink/40 hover:text-rust transition-colors">
            or just sign out →
          </button>
        </div>
      </main>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      <Modal open={nukeOpen} onClose={() => setNukeOpen(false)} title="Delete your account?">
        <p className="text-sm text-ink/60">
          This wipes <span className="font-bold text-ink">{me.email}</span> and every resume you own — including{" "}
          <span className="font-mono text-[12px]">{publicCount} public link{publicCount !== 1 ? "s" : ""}</span> people may have saved.
        </p>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" onClick={() => setNukeOpen(false)}>Keep my account</Button>
          <Button variant="danger" onClick={() => { deleteAccount(); nav("/"); }}>
            <Trash2 size={14} /> Yes, delete everything
          </Button>
        </div>
      </Modal>
    </div>
  );
}
