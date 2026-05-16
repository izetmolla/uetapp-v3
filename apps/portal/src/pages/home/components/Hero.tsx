import { Button } from "@workspace/ui/components/button";
import {
  ArrowRight,
  Play,
  LayoutDashboard,
  Database,
  Workflow,
  Layout,
  Plug,
  Bot,
  Settings,
  Search,
  Bell,
  TrendingUp,
} from "lucide-react";

function Sidebar() {
  const items = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Database, label: "Entities" },
    { icon: Workflow, label: "Workflows" },
    { icon: Layout, label: "UI Builder" },
    { icon: Plug, label: "Endpoints" },
    { icon: Bot, label: "AI Chat" },
    { icon: Settings, label: "Settings" },
  ];
  return (
    <div className="hidden sm:flex flex-col w-[180px] shrink-0 border-r border-white/5 bg-white/[0.02] p-3">
      <div className="flex items-center gap-2 px-2 py-1 mb-4">
        <div className="size-6 rounded-md bg-gradient-brand shadow-brand-glow" />
        <span className="text-xs font-semibold text-foreground">FlowTrove</span>
      </div>
      <div className="space-y-0.5 flex-1">
        {items.map((it) => (
          <div
            key={it.label}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] relative ${it.active
                ? "bg-indigo-accent/10 text-foreground before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-full before:bg-indigo-accent"
                : "text-muted-foreground hover:bg-white/5"
              }`}
          >
            <it.icon className={`size-3.5 ${it.active ? "text-indigo-accent" : ""}`} />
            <span>{it.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-white/5">
        <div className="size-6 rounded-full bg-gradient-to-br from-cyan-accent to-indigo-accent" />
        <span className="text-[10px] text-muted-foreground">John D.</span>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border-b border-white/5 gap-2">
      <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-md px-2 sm:px-3 py-1 text-[10px] min-w-0">
        <span className="text-white/50 hidden sm:inline">app.flowtrove.com</span>
        <span className="text-white/30 mx-1 hidden sm:inline">/</span>
        <span className="text-white/60 hidden sm:inline">projects</span>
        <span className="text-white/30 mx-1 hidden sm:inline">/</span>
        <span className="text-white font-semibold truncate">acme-store</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button className="size-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center">
          <Search className="size-3 text-muted-foreground" />
        </button>
        <button className="relative size-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center">
          <Bell className="size-3 text-muted-foreground" />
          <span className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-red-500" />
        </button>
        <div className="size-6 rounded-full bg-gradient-to-br from-indigo-accent to-cyan-accent" />
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, trendColor = "text-emerald-400" }: { label: string; value: string; trend?: string; trendColor?: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-end justify-between">
        <div className="text-base font-semibold text-foreground">{value}</div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 ${trendColor}`}>
            <TrendingUp className="size-2.5" />
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function MiniChart() {
  const bars = [40, 65, 50, 80, 55, 90, 70, 95, 60, 85, 75, 100];
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-medium text-foreground">Revenue</div>
        <div className="text-[9px] text-muted-foreground">Last 12 weeks</div>
      </div>
      <div className="flex items-end gap-1 h-20">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-indigo-accent to-cyan-accent opacity-80"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function MiniTable() {
  const rows = [
    { n: "Atlas Tee", s: "active", c: "bg-emerald-500/15 text-emerald-300", d: "May 02" },
    { n: "Nova Hoodie", s: "draft", c: "bg-amber-500/15 text-amber-300", d: "May 01" },
    { n: "Orbit Cap", s: "active", c: "bg-emerald-500/15 text-emerald-300", d: "Apr 29" },
  ];
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-medium text-foreground">Recent products</div>
        <div className="text-[9px] text-cyan-accent">View all</div>
      </div>
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.n} className="flex items-center justify-between rounded-md bg-white/[0.02] border border-white/5 px-2 py-1.5">
            <span className="text-[10px] text-foreground">{r.n}</span>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${r.c}`}>{r.s}</span>
              <span className="text-[9px] text-muted-foreground">{r.d}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardMockup() {
  // Mockup represents the in-app FlowTrove product UI which is dark-themed.
  // We force the `dark` class here so it looks correct in both site themes.
  return (
    <div className="dark relative">
      <div className="absolute -inset-10 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(99,102,241,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_70%,rgba(6,182,212,0.2),transparent_60%)]" />
      </div>
      <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0A0A0F] shadow-2xl shadow-black/60">
        {/* Browser chrome */}
        <div className="bg-[#1A1A2E] h-8 flex items-center px-3 gap-1.5 border-b border-white/5">
          <span className="size-2.5 rounded-full bg-[#FF5F57]" />
          <span className="size-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="size-2.5 rounded-full bg-[#28C840]" />
          <div className="flex-1 flex justify-center">
            <div className="rounded-md bg-white/10 text-white/40 text-[10px] px-3 py-0.5 font-mono">
              app.flowtrove.com/projects/acme-store
            </div>
          </div>
        </div>
        {/* App body */}
        <div className="flex h-[360px] sm:h-[480px]">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar />
            <div className="flex-1 p-2.5 sm:p-4 space-y-2.5 sm:space-y-3 overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <StatCard label="Total Users" value="2,841" trend="+12%" />
                <StatCard label="Revenue" value="$48.2k" trend="+8%" />
                <StatCard label="Active Sessions" value="194" />
                <StatCard label="Workflows" value="37" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <MiniChart />
                <div className="hidden sm:block"><MiniTable /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-accent/40 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-16 sm:pt-28 sm:pb-32">
        <div className="text-center max-w-4xl mx-auto animate-fade-up">
          <a href="#" className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1 px-4 py-1.5 text-xs text-foreground backdrop-blur-md shadow-cyan-glow">
            <span className="size-1.5 rounded-full bg-cyan-accent animate-glow-pulse" />
            Now with MCP Server Support
            <ArrowRight className="size-3" />
          </a>
          <h1 className="mt-6 sm:mt-8 text-[2.5rem] leading-[1.05] sm:text-6xl lg:text-7xl font-semibold tracking-tight">
            <span className="text-foreground">Build Your Entire</span>
            <br />
            <span className="text-gradient-brand">Business. No Code.</span>
          </h1>
          <p className="mt-5 sm:mt-6 text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            FlowTrove is the all-in-one workspace to design interfaces, manage data, automate workflows, and ship production-ready web apps — powered by AI.
          </p>
          <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Button size="lg" className="bg-gradient-brand text-white shadow-brand-glow hover:opacity-90 px-6 w-full sm:w-auto" onClick={() => window.location.href = "/workspace?option=quickstart"}>
              Start Building Free <ArrowRight className="ml-1 size-4" />
            </Button>
            <Button size="lg" variant="ghost" className="text-foreground hover:bg-surface-2 border border-hairline w-full sm:w-auto">
              <Play className="mr-1.5 size-4" /> Watch Demo
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Trusted by 2,000+ builders worldwide • No credit card required
          </p>
        </div>

        <div className="mt-12 sm:mt-20 max-w-6xl mx-auto animate-fade-up" style={{ animationDelay: "150ms" }}>
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
