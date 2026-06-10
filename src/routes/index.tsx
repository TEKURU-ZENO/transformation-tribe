import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Trophy,
  Zap,
  Flame,
  BookOpen,
  TrendingUp,
  Users,
  ChevronRight,
  Target,
  Award,
  Activity,
  Calendar,
  LayoutGrid,
  Crown,
  Diamond,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ASCEND — Social Growth Operating System" },
      { name: "description", content: "Friends don't let friends quit. The shared growth operating system for ambitious people." },
      { property: "og:title", content: "ASCEND — Social Growth Operating System" },
      { property: "og:description", content: "Friends don't let friends quit. Plan your week, track daily progress, gain XP, and grow together." },
    ],
  }),
  component: Index,
});

/* ─── Activity Feed Ticker ─── */
const ACTIVITY_ITEMS = [
  { icon: Flame, color: "text-emerald", text: "Devu earned 40 XP", detail: "Deep Work session", time: "2m ago" },
  { icon: Trophy, color: "text-gold", text: "Aryan reached Level 6", detail: "Creator rank unlocked", time: "14m ago" },
  { icon: Zap, color: "text-emerald", text: "Rahul completed Weekly Goal", detail: "Neural Net Dev", time: "1h ago" },
  { icon: BookOpen, color: "text-gold", text: "Devu read a research paper", detail: "+15 XP", time: "2h ago" },
  { icon: TrendingUp, color: "text-emerald", text: "Squad hit 80% weekly average", detail: "AI Grind Squad", time: "3h ago" },
  { icon: Award, color: "text-gold", text: "Rahul reached Level 8", detail: "Builder rank", time: "5h ago" },
];

function ActivityFeed() {
  const [visible, setVisible] = useState(3);
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((v) => (v >= ACTIVITY_ITEMS.length ? 3 : v + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {ACTIVITY_ITEMS.slice(0, visible).map((item, i) => (
        <div
          key={i}
          className="flex items-start gap-3 opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-500"
          style={{ animationDelay: `${i * 100}ms`, animationFillMode: "forwards" }}
        >
          <div className="mt-0.5 shrink-0">
            <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-foreground font-medium truncate">
              {item.text}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">{item.detail}</p>
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0 ml-auto">{item.time}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Floating Hero Cards ─── */
function FloatingCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`absolute rounded-xl p-4 shadow-2xl ${className}`}
      style={{
        background: "oklch(0.205 0.018 264 / 60%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid oklch(1 0 0 / 8%)",
        animation: "float 6s ease-in-out infinite",
        animationDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Main Page ─── */
function Index() {
  const [xpProgress, setXpProgress] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setXpProgress(72), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-emerald/30 selection:text-emerald">
      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/[0.04] bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-sm font-bold tracking-[0.15em] text-foreground uppercase">
              ASCEND
            </Link>
            <div className="hidden gap-6 sm:flex">
              <a href="#demo" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                Demo
              </a>
              <a href="#features" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                Features
              </a>
              <a href="#growth" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                Growth Map
              </a>
            </div>
          </div>
          <button className="h-8 rounded-full border border-white/10 bg-surface px-5 text-xs font-semibold text-foreground transition-all hover:bg-surface-raised active:scale-[0.97]">
            Start Ascending
          </button>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section ref={heroRef} className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute top-[30%] left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald/[0.025] blur-[120px]" />
          <div className="absolute bottom-[20%] right-[20%] h-[400px] w-[600px] rounded-full bg-gold/[0.015] blur-[100px]" />
        </div>

        {/* Floating Background Cards */}
        <div className="pointer-events-none absolute inset-0 z-[1]">
          <FloatingCard className="top-[18%] left-[8%] w-52 rotate-[-6deg] opacity-50 sm:opacity-100" delay={0}>
            <div className="mb-2 h-1.5 w-full rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald transition-all duration-1000"
                style={{ width: "65%", boxShadow: "0 0 12px oklch(0.65 0.2 160 / 40%)" }}
              />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Deep Work Session</p>
            <p className="mt-1 text-xs text-foreground font-medium">+45 XP earned</p>
          </FloatingCard>

          <FloatingCard className="bottom-[28%] right-[10%] w-56 rotate-[4deg] opacity-40 sm:opacity-100" delay={2}>
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full border border-gold/30 bg-gold/10">
                <Trophy className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">Level Up</p>
                <p className="text-[10px] text-muted-foreground">Reached Level 14</p>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard className="top-[32%] right-[18%] w-44 rotate-[3deg] opacity-30 sm:opacity-80" delay={1}>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-3.5 w-3.5 text-emerald" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Streak</span>
            </div>
            <p className="text-2xl font-bold text-foreground">12 Days</p>
            <p className="text-[10px] text-muted-foreground">Deep Work</p>
          </FloatingCard>

          <FloatingCard className="bottom-[20%] left-[12%] w-48 rotate-[-3deg] opacity-30 sm:opacity-80" delay={3}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Squad</span>
              <Users className="h-3 w-3 text-gold" />
            </div>
            <div className="flex -space-x-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-5 w-5 rounded-full border border-background bg-surface" />
              ))}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">AI Grind — 84% avg</p>
          </FloatingCard>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald/20 bg-emerald/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald">
            <Zap className="h-3 w-3" />
            The Growth Operating System
          </p>

          <h1 className="mx-auto max-w-[18ch] text-5xl font-extrabold leading-[0.95] tracking-tight text-foreground sm:text-7xl lg:text-[7rem] text-balance">
            Friends don&apos;t let friends quit.
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg text-balance">
            Track your growth. Build momentum. Compete with friends. Level up every day.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="group inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-bold text-background transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_24px_oklch(0.65_0.2_160/20%)]">
              Start Ascending
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-surface-raised active:scale-[0.98]">
              See How It Works
            </button>
          </div>

          {/* Social proof */}
          <div className="mt-16 flex items-center justify-center gap-4">
            <div className="flex -space-x-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="grid h-8 w-8 place-items-center rounded-full border-2 border-background text-[9px] font-bold text-foreground"
                  style={{ backgroundColor: `oklch(${0.3 + i * 0.05} 0.04 264)` }}
                >
                  {["D", "A", "R", "S"][i]}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">12,000+</span> ambitious people ascending
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="h-10 w-5 rounded-full border border-white/20 p-1">
            <div className="h-2 w-2 rounded-full bg-foreground/50 animate-bounce mx-auto mt-1" />
          </div>
        </div>
      </section>

      {/* ─── Interactive Demo Dashboard ─── */}
      <section id="demo" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald">Live Preview</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Your Command Center</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Everything you need to track transformation — not just tasks.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.04] bg-surface p-4 sm:p-8 shadow-2xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left: Profile & Focus */}
              <div className="lg:col-span-4">
                <div className="flex items-center gap-4 mb-8">
                  <img
                    src="/images/devu-avatar.jpg"
                    alt="Devu"
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald/30"
                    width={512}
                    height={512}
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Devu</h3>
                    <p className="text-xs font-medium text-emerald">Level 12 Builder</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Today&apos;s Focus
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: "Systems Research", status: "+15 XP", active: false },
                      { label: "V4 Implementation", status: "ACTIVE", active: true },
                      { label: "Fitness Baseline", status: "DONE", active: false, done: true },
                    ].map((task) => (
                      <div
                        key={task.label}
                        className={`flex items-center justify-between rounded-lg p-3 border transition-all ${
                          task.active
                            ? "border-emerald/20 bg-emerald/5"
                            : task.done
                            ? "border-white/[0.03] bg-white/[0.02] opacity-60"
                            : "border-white/[0.03] bg-white/[0.02]"
                        }`}
                      >
                        <span className={`text-sm ${task.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {task.label}
                        </span>
                        <span
                          className={`text-[10px] font-mono ${
                            task.active ? "text-emerald" : task.done ? "text-muted-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <div className="mb-2 flex justify-between text-[10px] font-mono uppercase tracking-tighter">
                    <span className="text-muted-foreground">XP Progress</span>
                    <span className="text-foreground">145 XP until Level 13</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald transition-all duration-1000 ease-out"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Middle: Pinterest Goals */}
              <div className="lg:col-span-5">
                <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Active Objectives
                </p>
                <div className="columns-2 gap-4 space-y-4">
                  <div className="break-inside-avoid rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                    <p className="mb-2 text-xs font-semibold text-foreground">Deep Work</p>
                    <p className="mb-3 text-[10px] text-muted-foreground">4/5 Days this week</p>
                    <div className="flex gap-1">
                      {[1, 1, 1, 1, 0].map((filled, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${filled ? "bg-emerald" : "bg-white/10"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="break-inside-avoid rounded-xl border border-emerald/15 bg-emerald/5 p-4">
                    <img
                      src="/images/research-card.jpg"
                      alt="Research Portfolio"
                      className="mb-3 w-full rounded-lg object-cover"
                      width={800}
                      height={512}
                      loading="lazy"
                    />
                    <p className="mb-1 text-xs font-semibold text-foreground">Research Portfolio</p>
                    <p className="text-[10px] text-emerald">65% Done</p>
                  </div>

                  <div className="break-inside-avoid rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                    <p className="mb-2 text-xs font-semibold text-foreground">Fitness</p>
                    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full w-3/4 rounded-full bg-gold" />
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground">3/5 sessions</p>
                  </div>

                  <div className="break-inside-avoid rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                    <p className="mb-1 text-xs font-semibold text-foreground">Leetcode Daily</p>
                    <p className="text-[10px] text-muted-foreground">12 Day Streak</p>
                    <div className="mt-3 flex gap-1">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-1.5 w-1.5 rounded-full bg-emerald" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Squad & Activity */}
              <div className="space-y-8 lg:col-span-3">
                {/* Squad */}
                <div>
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Squad: AI Grind
                  </p>
                  <div className="space-y-3">
                    {[
                      { name: "Devu", level: "Level 12", pct: "84%", color: "text-emerald" },
                      { name: "Aryan", level: "Level 6", pct: "77%", color: "text-gold" },
                      { name: "Rahul", level: "Level 8", pct: "69%", color: "text-emerald" },
                    ].map((member) => (
                      <div key={member.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-surface-raised text-[10px] font-bold text-foreground">
                            {member.name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{member.name}</p>
                            <p className="text-[10px] text-muted-foreground">{member.level}</p>
                          </div>
                        </div>
                        <span className={`font-mono text-xs ${member.color}`}>{member.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Feed */}
                <div>
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Live Activity
                  </p>
                  <ActivityFeed />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Problem / Comparison ─── */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="max-w-[48ch]">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald">The Difference</p>
              <h2 className="mb-6 text-3xl font-bold leading-tight tracking-tight text-foreground text-balance sm:text-4xl">
                Traditional apps track your output. We track your transformation.
              </h2>
              <p className="mb-12 text-sm leading-relaxed text-muted-foreground text-balance">
                Streaks for the sake of streaks lead to burnout. ASCEND reframes your effort as a climb toward a specific identity.
              </p>

              <div className="overflow-hidden rounded-xl border border-white/[0.04]">
                <div className="grid grid-cols-2 divide-x divide-white/[0.04]">
                  <div className="bg-background p-6">
                    <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Traditional
                    </span>
                    <ul className="space-y-4">
                      {["Habits", "Daily Tasks", "Solo Play", "Guilt for missing"].map((item) => (
                        <li key={item} className="text-sm text-muted-foreground line-through opacity-50">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-surface p-6">
                    <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-emerald">
                      ASCEND
                    </span>
                    <ul className="space-y-4">
                      {["Identity", "Long-term Growth", "Squad Accountability", "Adaptive Planning"].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <ChevronRight className="h-3 w-3 text-emerald shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="/images/summit.jpg"
                alt="Reaching the summit"
                className="w-full rounded-2xl object-cover shadow-2xl"
                width={1024}
                height={1280}
                loading="lazy"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-lg font-bold text-foreground">Become who you want to be.</p>
                <p className="text-xs text-muted-foreground">One level at a time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Feature Grid ─── */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald">Features</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Everything you need to ascend</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Calendar,
                title: "Weekly Planner",
                desc: "Drag-and-drop your week. No guilt — just reschedule when plans change.",
              },
              {
                icon: LayoutGrid,
                title: "Pinterest Board",
                desc: "Visual goal cards at different heights. See your progress at a glance.",
              },
              {
                icon: Users,
                title: "Squad View",
                desc: "See your friends' weeks. Cheer them on. Keep each other accountable.",
              },
              {
                icon: Activity,
                title: "Activity Feed",
                desc: "Live updates like Discord + GitHub. Never miss a squad milestone.",
              },
              {
                icon: TrendingUp,
                title: "Growth Map",
                desc: "Novice → Builder → Creator → Strategist → Architect → Legend.",
              },
              {
                icon: Target,
                title: "XP System",
                desc: "Earn XP for daily goals and weekly milestones. Watch the bar fill.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-white/[0.04] bg-white/[0.02] p-6 transition-all hover:border-emerald/15 hover:bg-emerald/[0.02]"
              >
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg border border-emerald/15 bg-emerald/5">
                  <feature.icon className="h-5 w-5 text-emerald" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">{feature.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Growth Map Ladder ─── */}
      <section id="growth" className="relative py-24 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald/[0.03] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-20 text-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald">The Path</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Your Growth Map</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Every level has a name. Every rank means something.
            </p>
          </div>

          <div className="relative mx-auto max-w-lg">
            {/* Vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-emerald/20 to-transparent" />

            <div className="space-y-20">
              {[
                { rank: "Legend", desc: "Mastery of the identity.", icon: Crown, align: "right", active: false },
                { rank: "Architect", desc: "Defining the future.", icon: Diamond, align: "left", active: false },
                { rank: "Strategist", desc: "Planning with precision.", icon: Target, align: "right", active: false },
                { rank: "Creator", desc: "Building what matters.", icon: Zap, align: "left", active: false },
                { rank: "Builder", desc: "Execution and habituation.", icon: TrendingUp, align: "right", active: true },
                { rank: "Novice", desc: "First steps taken.", icon: Award, align: "left", active: false },
              ].map((tier, i) => (
                <div key={tier.rank} className="relative flex items-center justify-center">
                  {/* Dot */}
                  <div
                    className={`absolute left-1/2 z-10 -translate-x-1/2 grid place-items-center rounded-full border-2 ${
                      tier.active
                        ? "h-5 w-5 border-emerald bg-emerald shadow-[0_0_20px_oklch(0.65_0.2_160/40%)]"
                        : "h-4 w-4 border-white/15 bg-surface"
                    }`}
                  >
                    {tier.active && <div className="h-1.5 w-1.5 rounded-full bg-background" />}
                  </div>

                  {/* Content */}
                  <div
                    className={`w-40 ${
                      tier.align === "right" ? "translate-x-28 text-left" : "-translate-x-28 text-right"
                    }`}
                  >
                    <div className={`flex items-center gap-2 mb-1 ${tier.align === "left" ? "justify-end" : ""}`}>
                      <tier.icon className={`h-3.5 w-3.5 ${tier.active ? "text-emerald" : "text-muted-foreground"}`} />
                      <h4
                        className={`text-base font-semibold leading-none ${
                          tier.active ? "text-emerald" : "text-foreground"
                        }`}
                      >
                        {tier.rank}
                      </h4>
                    </div>
                    <p className={`text-xs ${tier.active ? "text-emerald/70" : "text-muted-foreground"}`}>
                      {tier.desc}
                    </p>
                    {tier.active && (
                      <span className="mt-1.5 inline-block rounded-full bg-emerald/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald">
                        Current
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer CTA ─── */}
      <footer className="border-t border-white/[0.04] py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            The summit is waiting.
          </h2>
          <p className="mx-auto mb-10 max-w-md text-sm text-muted-foreground">
            Join thousands of ambitious people who refuse to quit on themselves — or each other.
          </p>
          <button className="group inline-flex items-center gap-2 rounded-full border border-emerald/30 bg-emerald/5 px-8 py-3.5 text-sm font-bold text-emerald transition-all hover:bg-emerald hover:text-background active:scale-[0.98]">
            Join the Collective
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>

          <div className="mt-20 flex flex-col items-center justify-center gap-8 border-t border-white/[0.04] pt-12 sm:flex-row">
            <span className="text-xs font-bold tracking-[0.15em] text-foreground uppercase">ASCEND</span>
            <div className="flex gap-8">
              <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Systems</a>
              <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Principles</a>
              <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Privacy</a>
            </div>
            <span className="text-xs text-muted-foreground">Built for the ambitious.</span>
          </div>
        </div>
      </footer>

      {/* ─── Keyframe styles ─── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(var(--rot, 0deg)); }
          50% { transform: translateY(-12px) rotate(var(--rot, 0deg)); }
        }
      `}</style>
    </div>
  );
}
