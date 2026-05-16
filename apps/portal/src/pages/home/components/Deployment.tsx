import { Cloud, Package, Code2, Check, X, ArrowRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

type Accent = "indigo" | "emerald" | "amber";

const accentMap: Record<Accent, { ring: string; text: string; chip: string; glow: string; check: string; topBorder: string }> = {
  indigo: {
    ring: "border-indigo-400/30",
    text: "text-indigo-300",
    chip: "bg-indigo-500/10 text-indigo-300 border-indigo-400/30",
    glow: "shadow-[0_-20px_60px_-20px_oklch(0.62_0.21_275/0.7)]",
    check: "text-indigo-300 bg-indigo-500/15",
    topBorder: "before:bg-gradient-to-r before:from-transparent before:via-indigo-400 before:to-transparent",
  },
  emerald: {
    ring: "border-emerald-400/30",
    text: "text-emerald-300",
    chip: "bg-emerald-500/10 text-emerald-300 border-emerald-400/30",
    glow: "shadow-[0_-20px_60px_-20px_oklch(0.75_0.18_160/0.6)]",
    check: "text-emerald-300 bg-emerald-500/15",
    topBorder: "before:bg-gradient-to-r before:from-transparent before:via-emerald-400 before:to-transparent",
  },
  amber: {
    ring: "border-amber-400/30",
    text: "text-amber-300",
    chip: "bg-amber-500/10 text-amber-300 border-amber-400/30",
    glow: "shadow-[0_-20px_60px_-20px_oklch(0.82_0.17_75/0.6)]",
    check: "text-amber-300 bg-amber-500/15",
    topBorder: "before:bg-gradient-to-r before:from-transparent before:via-amber-400 before:to-transparent",
  },
};

const cards: {
  accent: Accent;
  Icon: typeof Cloud;
  chip: string;
  title: string;
  desc: string;
  bullets: string[];
  bestFor: string;
}[] = [
  {
    accent: "indigo",
    Icon: Cloud,
    chip: "Easiest • Zero Setup",
    title: "Host on FlowTrove Cloud",
    desc: "Deploy your workspace instantly on our shared infrastructure. We handle uptime, scaling, and maintenance — you focus on building.",
    bullets: [
      "Instant deployment with one click",
      "Shared multi-tenant infrastructure",
      "Automatic updates & managed security",
      "Custom subdomain on *.flowtrove.com or bring your own domain",
      "Built-in email sending & integrations",
    ],
    bestFor: "Startups, MVPs, Internal tools",
  },
  {
    accent: "emerald",
    Icon: Package,
    chip: "Most Powerful • Dedicated",
    title: "Deploy as a Binary",
    desc: "Export your entire workspace as a compiled binary and run it on your own servers or as a dedicated hosted instance on FlowTrove's infrastructure.",
    bullets: [
      "Compiled binary — no dependencies exposed",
      "Run on your own VPS, cloud VM, or bare metal",
      "Or request a dedicated hosted instance on FlowTrove",
      "Full isolation from other tenants",
      "Portable, versioned, and reproducible deployments",
    ],
    bestFor: "Enterprises, regulated industries, high-traffic apps",
  },
  {
    accent: "amber",
    Icon: Code2,
    chip: "Maximum Freedom • Own Everything",
    title: "Export Full Source Code",
    desc: "Download 100% of your workspace as production-ready source code in your preferred language or framework. Modify it, extend it, and host it anywhere.",
    bullets: [
      "Export to React, Go, C++, Python, Node.js, and more",
      "Clean, production-grade code — not generated spaghetti",
      "Host on Vercel, AWS, Railway, your own server — anywhere",
      "Full IP ownership — it's your code, forever",
      "Use as a starting point and extend with any developer",
    ],
    bestFor: "Dev teams, agencies, custom infrastructure",
  },
];

const languages: { name: string; color: string }[] = [
  { name: "React", color: "bg-cyan-400" },
  { name: "Next.js", color: "bg-foreground" },
  { name: "Go", color: "bg-sky-400" },
  { name: "C++", color: "bg-blue-500" },
  { name: "Python", color: "bg-yellow-400" },
  { name: "Node.js", color: "bg-green-400" },
  { name: "Rust", color: "bg-orange-500" },
  { name: "TypeScript", color: "bg-blue-400" },
  { name: "Vue", color: "bg-emerald-400" },
  { name: "Laravel", color: "bg-red-400" },
  { name: "Django", color: "bg-emerald-600" },
];

const tableRows: { feature: string; cloud: string | boolean; binary: string | boolean; source: string | boolean }[] = [
  { feature: "Setup time", cloud: "Instant", binary: "Minutes", source: "Hours (dev work)" },
  { feature: "Hosting", cloud: "Managed by us", binary: "Your infra or ours", source: "Fully yours" },
  { feature: "Scalability", cloud: "Auto-scaled", binary: "Manual / dedicated", source: "Fully custom" },
  { feature: "Code access", cloud: false, binary: false, source: "Full source" },
  { feature: "Custom modifications", cloud: false, binary: "Limited via binary", source: "Unlimited" },
  { feature: "Vendor lock-in", cloud: "Low", binary: "None", source: "None" },
  { feature: "Best for", cloud: "Speed to launch", binary: "Power + control", source: "Full ownership" },
];

function Cell({ value, highlight }: { value: string | boolean; highlight?: boolean }) {
  return (
    <span className={cn("inline-flex items-center text-sm", highlight && "bg-amber-500/[0.04]")}>
      {typeof value === "boolean" ? (
        value ? (
          <Check className="size-4 text-emerald-400" />
        ) : (
          <X className="size-4 text-muted-foreground/50" />
        )
      ) : value === "Full source" || value === "Unlimited" ? (
        <span className="inline-flex items-center gap-1.5 text-foreground">
          <Check className="size-4 text-emerald-400" /> {value}
        </span>
      ) : (
        <span className="text-foreground/90">{value}</span>
      )}
    </span>
  );
}

export function Deployment() {
  return (
    <section className="relative py-24 sm:py-32 border-t border-hairline overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow opacity-30 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-hairline bg-surface-2 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Export & Deployment
          </span>
          <h2 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
            Ship It <span className="text-gradient-brand">Your Way.</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
            FlowTrove doesn't lock you in. Host on our cloud, deploy as a binary, or export your full source code in
            the language you love. You own everything you build.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {cards.map((c, i) => {
            const a = accentMap[c.accent];
            return (
              <div
                key={c.title}
                className={cn(
                  "group relative glass-card rounded-2xl p-6 sm:p-7 animate-fade-up transition-transform duration-300 hover:-translate-y-1",
                  "before:content-[''] before:absolute before:inset-x-6 before:-top-px before:h-px",
                  a.topBorder,
                  a.glow,
                )}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className={cn("inline-flex items-center justify-center size-11 rounded-xl border", a.ring, "bg-surface-1")}>
                    <c.Icon className={cn("size-5", a.text)} />
                  </div>
                  <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium", a.chip)}>
                    {c.chip}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                <ul className="mt-5 space-y-2.5">
                  {c.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-foreground/90">
                      <span className={cn("mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full", a.check)}>
                        <Check className="size-2.5" />
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-5 border-t border-hairline text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">Best for:</span> {c.bestFor}
                </div>
              </div>
            );
          })}
        </div>

        {/* Language showcase */}
        <div className="mt-20">
          <p className="text-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Export-ready in your language of choice
          </p>
          <div className="mt-6 hidden md:flex flex-wrap items-center justify-center gap-3">
            {languages.map((l) => (
              <span
                key={l.name}
                className="group inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1 px-4 py-2 text-sm text-foreground/90 transition-all hover:-translate-y-0.5 hover:border-hairline-strong hover:bg-surface-2 hover:shadow-brand-glow"
              >
                <span className={cn("size-1.5 rounded-full", l.color)} />
                {l.name}
              </span>
            ))}
          </div>
          <div className="mt-6 md:hidden overflow-hidden">
            <div className="flex gap-3 animate-marquee w-max">
              {[...languages, ...languages].map((l, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1 px-4 py-2 text-sm text-foreground/90 whitespace-nowrap"
                >
                  <span className={cn("size-1.5 rounded-full", l.color)} />
                  {l.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison table */}
        <div className="mt-20">
          <h3 className="text-center text-2xl sm:text-3xl font-semibold tracking-tight">
            Not sure which option fits you?
          </h3>
          <div className="mt-8 glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-separate border-spacing-0">
                <thead>
                  <tr className="bg-surface-1">
                    <th className="sticky left-0 z-10 bg-card px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Feature
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-indigo-300">
                      FlowTrove Cloud
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-indigo-300">
                      Binary / Dedicated
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-indigo-300 bg-amber-500/[0.06]">
                      Source Code Export
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((r, i) => (
                    <tr
                      key={r.feature}
                      className={cn("animate-fade-up", i % 2 === 1 && "bg-surface-1")}
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <td className="sticky left-0 z-10 bg-card px-4 py-3.5 text-sm font-medium text-foreground/90 border-t border-hairline">
                        {r.feature}
                      </td>
                      <td className="border-t border-hairline px-4 py-3.5 align-middle"><Cell value={r.cloud} /></td>
                      <td className="border-t border-hairline px-4 py-3.5 align-middle"><Cell value={r.binary} /></td>
                      <td className="border-t border-hairline bg-amber-500/[0.04] px-4 py-3.5 align-middle">
                        <Cell value={r.source} highlight />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-12 glass-card rounded-2xl px-6 py-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm sm:text-base text-foreground/90 text-center sm:text-left">
            Every plan includes the option to export.{" "}
            <span className="text-muted-foreground">Start free, scale freely.</span>
          </p>
          <Button variant="outline" className="border-indigo-400/40 text-indigo-200 hover:bg-indigo-500/10">
            Explore Deployment Options <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
