import { Button } from "@workspace/ui/components/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden border-t border-hairline">
      <div className="absolute inset-0 bg-hero-glow opacity-80" />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight">
          Start Building Your <span className="text-gradient-brand">Product Today</span>
        </h2>
        <p className="mt-5 text-muted-foreground text-lg">No credit card. No code. Just build.</p>
        <div className="mt-8">
          <Button size="lg" className="bg-gradient-brand text-white shadow-brand-glow hover:opacity-90 px-8 h-12 text-base" onClick={() => window.location.href = "/workspace?option=quickstart"}>
            Get Started Free <ArrowRight className="ml-1 size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
