import { Star } from "lucide-react";

const items = [
  { initials: "MR", name: "Maya Rodriguez", role: "Founder, Loomix", quote: "We replaced three SaaS tools and a backend team with FlowTrove. Shipped our v1 in under a week." },
  { initials: "JK", name: "James Kojima", role: "CTO, Northwind ERP", quote: "The workflow engine is genuinely magical. We model logic visually and it just runs in production." },
  { initials: "AS", name: "Aisha Singh", role: "Lead Engineer, Studyly", quote: "Entity Manager + AI assistant changed how our team scaffolds features. It feels like cheating." },
];

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32 border-t border-hairline">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">Loved by builders</h2>
          <p className="mt-4 text-muted-foreground">From indie hackers to engineering teams.</p>
        </div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((t) => (
            <div key={t.name} className="glass-card rounded-2xl p-6 flex flex-col">
              <div className="flex items-center gap-1 text-cyan-accent">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}
              </div>
              <p className="mt-4 text-sm text-foreground/90 leading-relaxed flex-1">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="size-10 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-semibold shadow-brand-glow">{t.initials}</div>
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
