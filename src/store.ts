import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Plan, Resume, ResumeData, User } from "./types";
import { buildResume, emptyData, sampleData } from "./lib/sample";
import { FREE_TEMPLATE_IDS } from "./lib/templates";
import { hash, lastNDays, todayKey, uid } from "./lib/utils";

export const FREE_RESUME_LIMIT = 2;

interface Store {
  users: User[];
  resumes: Resume[];
  currentUserId: string | null;
  register: (name: string, email: string, pass: string) => { ok: boolean; error?: string };
  login: (email: string, pass: string) => { ok: boolean; error?: string };
  logout: () => void;
  resetPassword: (email: string, newPass: string) => { ok: boolean; error?: string };
  updateProfile: (patch: Partial<Pick<User, "name" | "email">>) => { ok: boolean; error?: string };
  changePassword: (cur: string, next: string) => { ok: boolean; error?: string };
  upgradePlan: (plan: Plan) => void;
  createResume: (
    title: string,
    templateId: string,
    useSample: boolean
  ) => { ok: boolean; resume?: Resume; error?: string };
  updateResume: (id: string, patch: Partial<Resume>) => void;
  updateResumeData: (id: string, dataPatch: Partial<ResumeData>) => void;
  deleteResume: (id: string) => void;
  duplicateResume: (id: string) => Resume | null;
  togglePublic: (id: string) => void;
  recordDownload: (id: string) => void;
  recordView: (id: string) => void;
  setSuspended: (userId: string, suspended: boolean) => void;
  deleteAccount: () => void;
}

function seedActivity(): Record<string, { d: number; v: number }> {
  const act: Record<string, { d: number; v: number }> = {};
  const days = lastNDays(14);
  const pattern = [2, 5, 3, 8, 6, 11, 4, 9, 13, 7, 16, 10, 19, 12];
  days.forEach((day, i) => {
    act[day] = { v: pattern[i], d: Math.max(1, Math.round(pattern[i] / 3)) };
  });
  return act;
}

function seed(): { users: User[]; resumes: Resume[] } {
  const now = Date.now();
  const admin: User = {
    id: "u-admin",
    name: "Asha Iyer",
    email: "admin@resumecraft.app",
    pass: hash("admin123"),
    plan: "premium",
    isAdmin: true,
    createdAt: now - 200 * 86400000,
  };
  const demo: User = {
    id: "u-demo",
    name: "Sathish VT",
    email: "sathish@example.com",
    pass: hash("demo1234"),
    plan: "pro",
    createdAt: now - 40 * 86400000,
  };
  const act = seedActivity();
  const dl = Object.values(act).reduce((n, a) => n + a.d, 0);
  const vw = Object.values(act).reduce((n, a) => n + a.v, 0);

  const r1 = buildResume(demo.id, "Software Developer Resume", "green", sampleData(), {
    slug: "sathish-vt",
    isPublic: true,
    downloads: dl,
    views: vw,
    activity: act,
    updatedAt: now - 2 * 3600000,
    createdAt: now - 30 * 86400000,
  });

  const phpData = sampleData();
  phpData.personal = { ...phpData.personal, jobTitle: "PHP / Laravel Developer" };
  const r2 = buildResume(demo.id, "PHP Developer Resume", "blue", phpData, {
    updatedAt: now - 6 * 86400000,
    createdAt: now - 20 * 86400000,
    downloads: 12,
    views: 34,
  });

  const fresher = emptyData();
  fresher.personal = {
    fullName: "Sathish VT",
    jobTitle: "Computer Science Graduate",
    email: "sathish.vt@example.com",
    phone: "+91 98765 43210",
    location: "Coimbatore, India",
    website: "",
    linkedin: "linkedin.com/in/sathish-vt",
    github: "github.com/sathishvt",
  };
  fresher.summary =
    "Recent computer science graduate (8.7 CGPA) with strong fundamentals in data structures, databases and web development. Built two full-stack academic projects with PHP and MySQL, and looking for an entry-level backend engineering role where I can ship, learn and grow fast.";
  fresher.education = sampleData().education;
  fresher.technical = [
    { id: "ft1", name: "PHP / MySQL", level: 4 },
    { id: "ft2", name: "JavaScript", level: 3 },
    { id: "ft3", name: "HTML / CSS", level: 4 },
    { id: "ft4", name: "Python", level: 3 },
  ];
  fresher.skills = [
    { id: "fs1", name: "Quick Learner", level: 5 },
    { id: "fs2", name: "Teamwork", level: 4 },
    { id: "fs3", name: "Debugging", level: 4 },
  ];
  fresher.projects = sampleData().projects.slice(0, 1);
  fresher.achievements = sampleData().achievements.slice(0, 1);
  fresher.languages = sampleData().languages;
  fresher.hobbies = sampleData().hobbies.slice(0, 3);
  const r3 = buildResume(demo.id, "Fresher Resume", "ats", fresher, {
    sectionOrder: [
      "summary",
      "education",
      "technical",
      "skills",
      "projects",
      "achievements",
      "languages",
      "hobbies",
      "experience",
      "certifications",
      "references",
      "links",
      "custom",
    ],
    updatedAt: now - 12 * 86400000,
    createdAt: now - 15 * 86400000,
    downloads: 5,
    views: 9,
  });

  return { users: [admin, demo], resumes: [r1, r2, r3] };
}

const seeded = seed();

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      users: seeded.users,
      resumes: seeded.resumes,
      currentUserId: null,

      register: (name, email, pass) => {
        const emailL = email.trim().toLowerCase();
        if (get().users.some((u) => u.email === emailL))
          return { ok: false, error: "An account with this email already exists." };
        const user: User = {
          id: uid(),
          name: name.trim(),
          email: emailL,
          pass: hash(pass),
          plan: "free",
          createdAt: Date.now(),
        };
        set((s) => ({ users: [...s.users, user], currentUserId: user.id }));
        return { ok: true };
      },

      login: (email, pass) => {
        const user = get().users.find((u) => u.email === email.trim().toLowerCase());
        if (!user || user.pass !== hash(pass))
          return { ok: false, error: "Invalid email or password." };
        if (user.suspended)
          return { ok: false, error: "This account has been suspended. Contact support." };
        set({ currentUserId: user.id });
        return { ok: true };
      },

      logout: () => set({ currentUserId: null }),

      resetPassword: (email, newPass) => {
        const emailL = email.trim().toLowerCase();
        const user = get().users.find((u) => u.email === emailL);
        if (!user) return { ok: false, error: "No account found for that email." };
        set((s) => ({
          users: s.users.map((u) => (u.id === user.id ? { ...u, pass: hash(newPass) } : u)),
        }));
        return { ok: true };
      },

      updateProfile: (patch) => {
        const me = get().users.find((u) => u.id === get().currentUserId);
        if (!me) return { ok: false, error: "Not signed in." };
        if (
          patch.email &&
          get().users.some((u) => u.email === patch.email!.trim().toLowerCase() && u.id !== me.id)
        )
          return { ok: false, error: "That email is already in use." };
        set((s) => ({
          users: s.users.map((u) =>
            u.id === me.id
              ? {
                  ...u,
                  name: patch.name ?? u.name,
                  email: patch.email ? patch.email.trim().toLowerCase() : u.email,
                }
              : u
          ),
        }));
        return { ok: true };
      },

      changePassword: (cur, next) => {
        const me = get().users.find((u) => u.id === get().currentUserId);
        if (!me) return { ok: false, error: "Not signed in." };
        if (me.pass !== hash(cur)) return { ok: false, error: "Current password is incorrect." };
        set((s) => ({
          users: s.users.map((u) => (u.id === me.id ? { ...u, pass: hash(next) } : u)),
        }));
        return { ok: true };
      },

      upgradePlan: (plan) => {
        set((s) => ({
          users: s.users.map((u) => (u.id === s.currentUserId ? { ...u, plan } : u)),
        }));
      },

      createResume: (title, templateId, useSample) => {
        const meId = get().currentUserId;
        const me = get().users.find((u) => u.id === meId);
        if (!me) return { ok: false, error: "Not signed in." };
        const mine = get().resumes.filter((r) => r.ownerId === meId);
        if (me.plan === "free" && mine.length >= FREE_RESUME_LIMIT)
          return {
            ok: false,
            error: `Free plan allows ${FREE_RESUME_LIMIT} resumes. Upgrade to Pro for unlimited.`,
          };
        if (me.plan === "free" && !FREE_TEMPLATE_IDS.includes(templateId))
          return { ok: false, error: "That template requires the Pro plan." };
        const resume = buildResume(me.id, title.trim() || "Untitled Resume", templateId,
          useSample ? sampleData() : emptyData());
        if (!useSample) {
          resume.data.personal.fullName = me.name;
          resume.data.personal.email = me.email;
        }
        set((s) => ({ resumes: [resume, ...s.resumes] }));
        return { ok: true, resume };
      },

      updateResume: (id, patch) =>
        set((s) => ({
          resumes: s.resumes.map((r) =>
            r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r
          ),
        })),

      updateResumeData: (id, dataPatch) =>
        set((s) => ({
          resumes: s.resumes.map((r) =>
            r.id === id
              ? { ...r, data: { ...r.data, ...dataPatch }, updatedAt: Date.now() }
              : r
          ),
        })),

      deleteResume: (id) =>
        set((s) => ({ resumes: s.resumes.filter((r) => r.id !== id) })),

      duplicateResume: (id) => {
        const src = get().resumes.find((r) => r.id === id);
        if (!src) return null;
        const copy: Resume = {
          ...JSON.parse(JSON.stringify(src)),
          id: uid(),
          title: `${src.title} (copy)`,
          slug: `${src.slug}-copy-${uid().slice(0, 3)}`,
          isPublic: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          downloads: 0,
          views: 0,
          activity: {},
        };
        set((s) => ({ resumes: [copy, ...s.resumes] }));
        return copy;
      },

      togglePublic: (id) =>
        set((s) => ({
          resumes: s.resumes.map((r) =>
            r.id === id ? { ...r, isPublic: !r.isPublic, updatedAt: Date.now() } : r
          ),
        })),

      recordDownload: (id) =>
        set((s) => ({
          resumes: s.resumes.map((r) => {
            if (r.id !== id) return r;
            const k = todayKey();
            const cur = r.activity[k] ?? { d: 0, v: 0 };
            return {
              ...r,
              downloads: r.downloads + 1,
              activity: { ...r.activity, [k]: { ...cur, d: cur.d + 1 } },
            };
          }),
        })),

      recordView: (id) =>
        set((s) => ({
          resumes: s.resumes.map((r) => {
            if (r.id !== id) return r;
            const k = todayKey();
            const cur = r.activity[k] ?? { d: 0, v: 0 };
            return { ...r, views: r.views + 1, activity: { ...r.activity, [k]: { ...cur, v: cur.v + 1 } } };
          }),
        })),

      setSuspended: (userId, suspended) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === userId ? { ...u, suspended } : u)),
        })),

      deleteAccount: () => {
        const meId = get().currentUserId;
        set((s) => ({
          users: s.users.filter((u) => u.id !== meId),
          resumes: s.resumes.filter((r) => r.ownerId !== meId),
          currentUserId: null,
        }));
      },
    }),
    {
      name: "resumecraft-v1",
      partialize: (s) => ({
        users: s.users,
        resumes: s.resumes,
        currentUserId: s.currentUserId,
      }),
    }
  )
);

export const useCurrentUser = () => {
  const users = useStore((s) => s.users);
  const id = useStore((s) => s.currentUserId);
  return useMemo(() => users.find((u) => u.id === id) ?? null, [users, id]);
};

export const useMyResumes = () => {
  const resumes = useStore((s) => s.resumes);
  const id = useStore((s) => s.currentUserId);
  return useMemo(() => resumes.filter((r) => r.ownerId === id), [resumes, id]);
};
