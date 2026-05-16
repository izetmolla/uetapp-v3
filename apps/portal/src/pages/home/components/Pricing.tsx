import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Switch } from "@workspace/ui/components/switch";
import { cn } from "@workspace/ui/lib/utils";

const plans = [
  { name: "Starter", monthly: 0, yearly: 0, desc: "For tinkerers & solo builders.", features: ["1 project", "100 entity rows", "Community support", "FlowTrove subdomain"], cta: "Start Free" },
  { name: "Pro", monthly: 29, yearly: 23, desc: "For serious builders shipping real products.", features: ["Unlimited projects", "100k entity rows", "Custom domains", "AI assistant + MCP", "Priority support"], cta: "Start Pro Trial", featured: true },
  { name: "Business", monthly: 99, yearly: 79, desc: "For teams running mission-critical apps.", features: ["Everything in Pro", "Team workspaces", "SSO & RBAC", "Audit logs", "SLA & dedicated support"], cta: "Contact Sales" },
];

export function Pricing() {
  const [yearly, setYearly] = useState(false);
  return (
    <section id="pricing" className="py-24 sm:py-32 border-t border-hairline">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">Simple pricing. Powerful platform.</h2>
          <p className="mt-4 text-muted-foreground">Start free. Upgrade when you ship.</p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-hairline bg-surface-2 px-4 py-2">
            <span className={cn("text-sm", !yearly && "text-foreground", yearly && "text-muted-foreground")}>Monthly</span>
            <Switch checked={yearly} onCheckedChange={setYearly} />
            <span className={cn("text-sm flex items-center gap-2", yearly && "text-foreground", !yearly && "text-muted-foreground")}>
              Yearly <span className="text-[10px] text-cyan-accent">Save 20%</span>
            </span>
          </div>
        </div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {plans.map((p) => {
            const price = yearly ? p.yearly : p.monthly;
            return (
              <div key={p.name} className={cn("relative rounded-2xl p-7 glass-card flex flex-col", p.featured && "border-indigo-accent/50 shadow-brand-glow")}>
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-3 py-1 text-[10px] uppercase tracking-widest text-white shadow-brand-glow">Most Popular</span>
                )}
                <div className="text-sm text-muted-foreground">{p.name}</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-5xl font-semibold font-display">${price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                <ul className="mt-6 space-y-2.5 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 text-cyan-accent shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button className={cn("mt-7 w-full", p.featured ? "bg-gradient-brand text-white shadow-brand-glow hover:opacity-90" : "bg-surface-2 hover:bg-surface-3 border border-hairline text-foreground")}>
                  {p.cta}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
