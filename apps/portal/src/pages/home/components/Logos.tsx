const logos = ["Google", "Microsoft", "Airtable", "GitHub", "Slack", "Stripe", "Zapier", "OpenAI"];

export function Logos() {
  return (
    <section className="border-y border-hairline bg-background/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground">
          Integrates with the tools you already use
        </p>
        <div className="mt-8 hidden md:flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((l) => (
            <span key={l} className="font-display text-xl text-muted-foreground/70 hover:text-foreground transition">
              {l}
            </span>
          ))}
        </div>
        <div className="mt-8 md:hidden overflow-hidden">
          <div className="flex gap-10 animate-marquee w-max">
            {[...logos, ...logos].map((l, i) => (
              <span key={i} className="font-display text-lg text-muted-foreground/70 whitespace-nowrap">{l}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
