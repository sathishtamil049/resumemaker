import { Navigate } from "react-router-dom";
import { Ban, Download, Eye, FileText, ShieldCheck, Users } from "lucide-react";
import { useCurrentUser, useStore } from "../store";
import { THEMES, getTheme } from "../lib/templates";
import { PlanChip, Reveal, toast } from "../components/ui";
import { AppHeader } from "./Dashboard";
import { cx, timeAgo } from "../lib/utils";

export default function AdminPage() {
  const me = useCurrentUser()!;
  const { users, resumes, setSuspended } = useStore();
  if (!me.isAdmin) return <Navigate to="/app" replace />;

  const totals = {
    users: users.length,
    suspended: users.filter((u) => u.suspended).length,
    resumes: resumes.length,
    downloads: resumes.reduce((n, r) => n + r.downloads, 0),
    views: resumes.reduce((n, r) => n + r.views, 0),
    public: resumes.filter((r) => r.isPublic).length,
  };

  const tplCounts = THEMES.map((t) => ({
    t,
    n: resumes.filter((r) => r.templateId === t.id).length,
  })).sort((a, b) => b.n - a.n);
  const maxTpl = Math.max(1, ...tplCounts.map((x) => x.n));

  return (
    <div className="min-h-screen bg-paper bg-ruled">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-5 py-10">
        <div className="flex items-center gap-3">
          <ShieldCheck size={22} className="text-moss" />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/45">Control room</p>
            <h1 className="font-display text-4xl font-extrabold text-ink">Admin panel</h1>
          </div>
        </div>

        {/* stats */}
        <Reveal className="mt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { l: "Users", v: totals.users, i: Users },
              { l: "Suspended", v: totals.suspended, i: Ban },
              { l: "Resumes", v: totals.resumes, i: FileText },
              { l: "Downloads", v: totals.downloads, i: Download },
              { l: "Views", v: totals.views, i: Eye },
              { l: "Public links", v: totals.public, i: FileText },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-mist bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink/45">{s.l}</span>
                  <s.i size={14} className="text-moss" />
                </div>
                <div className="font-display text-3xl font-extrabold text-ink mt-1.5">{s.v}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 mt-8 items-start">
          {/* users table */}
          <Reveal>
            <div className="rounded-xl border border-mist bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-mist flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-ink">Users</h2>
                <span className="font-mono text-[11px] text-ink/40">{users.length} accounts</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left font-mono text-[10px] uppercase tracking-wider text-ink/40 border-b border-mist">
                      <th className="px-5 py-2.5">Name</th>
                      <th className="px-3 py-2.5">Plan</th>
                      <th className="px-3 py-2.5">Resumes</th>
                      <th className="px-3 py-2.5">Joined</th>
                      <th className="px-5 py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className={cx("border-b border-mist/60 last:border-0 hover:bg-paper/60 transition-colors", u.suspended && "opacity-55")}>
                        <td className="px-5 py-3">
                          <div className="font-semibold text-ink">{u.name} {u.isAdmin && <span className="text-[9px] font-mono uppercase bg-citron/60 text-pine rounded px-1 py-0.5 ml-1">admin</span>}</div>
                          <div className="text-[12px] text-ink/45">{u.email}</div>
                        </td>
                        <td className="px-3 py-3"><PlanChip plan={u.plan} /></td>
                        <td className="px-3 py-3 font-mono text-[13px] text-ink/60">{resumes.filter((r) => r.ownerId === u.id).length}</td>
                        <td className="px-3 py-3 text-[12px] text-ink/45">{timeAgo(u.createdAt)}</td>
                        <td className="px-5 py-3 text-right">
                          {u.isAdmin ? (
                            <span className="text-[11px] font-mono text-ink/30">protected</span>
                          ) : (
                            <button
                              onClick={() => {
                                setSuspended(u.id, !u.suspended);
                                toast(u.suspended ? `${u.name} reinstated` : `${u.name} suspended`, "info");
                              }}
                              className={cx(
                                "text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors",
                                u.suspended
                                  ? "bg-moss/10 text-moss border-moss/30 hover:bg-moss hover:text-white"
                                  : "bg-rust/8 text-rust border-rust/25 hover:bg-rust hover:text-white"
                              )}
                            >
                              {u.suspended ? "reinstate" : "suspend"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>

          <div className="space-y-6">
            {/* template popularity */}
            <Reveal delay={80}>
              <div className="rounded-xl border border-mist bg-white p-5">
                <h2 className="font-display text-lg font-bold text-ink mb-4">Template popularity</h2>
                <div className="space-y-2.5">
                  {tplCounts.map(({ t, n }) => (
                    <div key={t.id}>
                      <div className="flex justify-between text-[12px] mb-1">
                        <span className="font-semibold text-ink">{t.name} {t.free && <span className="text-[9px] font-mono uppercase text-moss">free</span>}</span>
                        <span className="font-mono text-ink/45">{n}</span>
                      </div>
                      <div className="h-2 rounded-full bg-ink/6 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(n / maxTpl) * 100}%`, background: getTheme(t.id).accent === "#333333" ? "#8a8a8a" : getTheme(t.id).accent }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* recent resumes */}
            <Reveal delay={140}>
              <div className="rounded-xl border border-mist bg-white p-5">
                <h2 className="font-display text-lg font-bold text-ink mb-3">Recent resumes</h2>
                <div className="space-y-2.5">
                  {resumes.slice(0, 6).map((r) => {
                    const owner = users.find((u) => u.id === r.ownerId);
                    return (
                      <div key={r.id} className="flex items-center gap-3 rounded-lg border border-mist/70 px-3 py-2.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: getTheme(r.templateId).accent }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-bold text-ink truncate">{r.title}</div>
                          <div className="text-[11px] text-ink/45 font-mono">{owner?.name ?? "deleted user"} · {timeAgo(r.updatedAt)}</div>
                        </div>
                        {r.isPublic && <span className="text-[9px] font-mono uppercase text-moss bg-moss/10 rounded-full px-2 py-0.5 border border-moss/25">public</span>}
                        <span className="text-[11px] font-mono text-ink/40 inline-flex items-center gap-1"><Download size={10} />{r.downloads}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </main>
    </div>
  );
}
