import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, ListChecks, Users, MessageCircle, Zap, Flame, Trophy } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ASCEND — Build your future with friends" },
      { name: "description", content: "Plan your week, track your progress, keep each other accountable. ASCEND is the social growth OS for friends building their future together." },
      { property: "og:title", content: "ASCEND — Build your future with friends" },
      { property: "og:description", content: "Plan your week. Track your progress. Keep each other accountable." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: CalendarDays, title: "Weekly Planning", body: "Plan your week visually. Drag cards between days." },
  { icon: ListChecks, title: "Daily Tracking", body: "Check off goals as you go. Stay focused on today." },
  { icon: Users, title: "Squad Progress", body: "See what your friends are getting done in real time." },
  { icon: MessageCircle, title: "Guild Chat", body: "Stay connected. Messages disappear every 24 hours." },
  { icon: Zap, title: "XP System", body: "Make progress visible. Level up together." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.04] bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="text-sm font-bold tracking-[0.2em]">ASCEND</Link>
          <Link to="/auth" className="text-xs font-semibold px-4 py-1.5 rounded-full bg-emerald text-background hover:scale-[1.02] transition">
            Enter the Guild
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen grid place-items-center px-6 pt-20 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-emerald/[0.03] blur-[120px]" />
        </div>
        <div className="relative z-10 text-center max-w-3xl">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald/20 bg-emerald/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald">
            <Zap className="h-3 w-3" /> Growth Operating System
          </p>
          <h1 className="text-5xl sm:text-7xl lg:text-[6.5rem] font-extrabold leading-[0.95] tracking-tight text-balance">
            For friends building their{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald to-gold">future</span>{" "}
            together.
          </h1>
          <p className="mt-8 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto text-balance">
            Plan your week. Track your progress. Keep each other accountable.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/auth" className="group inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-bold text-background hover:scale-[1.02] transition shadow-[0_0_24px_oklch(0.65_0.2_160/25%)]">
              Enter the Guild <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
            </Link>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">See what's inside →</a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 border-t border-white/[0.04]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-[0.2em] text-emerald font-bold mb-3">What's inside</p>
            <h2 className="text-3xl sm:text-4xl font-bold">Everything you need to grow together.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass-card rounded-2xl p-6">
                <div className="h-10 w-10 rounded-xl bg-emerald/10 grid place-items-center mb-4">
                  <f.icon className="h-5 w-5 text-emerald" />
                </div>
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live preview mockup */}
      <section className="py-24 px-6 border-t border-white/[0.04]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-[11px] uppercase tracking-[0.2em] text-emerald font-bold mb-3">Live preview</p>
            <h2 className="text-3xl sm:text-4xl font-bold">Your command center.</h2>
          </div>
          <div className="glass-card rounded-3xl p-6 sm:p-10 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-emerald/20 grid place-items-center text-emerald font-bold">D</div>
              <div>
                <p className="font-semibold">Good evening, Devu</p>
                <p className="text-xs text-emerald flex items-center gap-1"><Trophy className="h-3 w-3" /> Level 12</p>
              </div>
              <div className="ml-auto flex items-center gap-1 text-xs text-gold"><Flame className="h-3.5 w-3.5" /> 12 day streak</div>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Weekly Progress · 80%</p>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-6">
              <div className="h-full w-[80%] bg-emerald" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {["Gym", "Research Paper", "Deep Work", "Portfolio"].map((t, i) => (
                <div key={t} className={`flex items-center gap-3 p-3 rounded-lg border ${i < 2 ? "bg-emerald/[0.04] border-emerald/15" : "bg-white/[0.02] border-white/[0.04]"}`}>
                  <div className={`h-4 w-4 rounded border ${i < 2 ? "bg-emerald border-emerald" : "border-white/20"}`} />
                  <span className={`text-sm ${i < 2 ? "line-through text-muted-foreground" : ""}`}>{t}</span>
                  <span className="ml-auto text-[10px] font-mono text-emerald">+10 XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/[0.04] text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 text-balance">
          Your friends are already <span className="text-emerald">ascending</span>.
        </h2>
        <p className="text-muted-foreground mb-10">Join them.</p>
        <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-emerald px-7 py-3.5 text-sm font-bold text-background hover:scale-[1.02] transition shadow-[0_0_24px_oklch(0.65_0.2_160/25%)]">
          Enter the Guild <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="py-10 px-6 border-t border-white/[0.04] text-center text-xs text-muted-foreground">
        ASCEND · Friends don't let friends quit.
      </footer>
    </div>
  );
}