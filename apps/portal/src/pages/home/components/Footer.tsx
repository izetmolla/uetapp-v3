import { FaGithub as Github, FaLinkedin as Linkedin, FaTwitter as Twitter } from "react-icons/fa";

function FlowLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
      <circle cx="6" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="26" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="26" cy="24" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M9 16 L23 8 M9 16 L23 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const cols = [
  { title: "Product", links: ["UI Builder", "Entity Manager", "Workflow Engine", "Endpoint Studio", "AI Assistant", "MCP Server"] },
  { title: "Company", links: ["About", "Customers", "Careers", "Blog", "Changelog", "Contact"] },
  { title: "Legal", links: ["Terms", "Privacy", "Security", "DPA", "Acceptable Use", "Cookies"] },
];

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <FlowLogo className="size-7 text-foreground" />
              <span className="font-display font-semibold">FlowTrove</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">The all-in-one workspace to design, automate, and ship web products without code.</p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.title}</div>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}><a href="#" className="text-sm text-foreground/80 hover:text-foreground transition">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2025 FlowTrove. All rights reserved.</p>
          <div className="flex items-center gap-3 text-muted-foreground">
            <a href="#" aria-label="Twitter" className="hover:text-foreground transition"><Twitter className="size-4" /></a>
            <a href="#" aria-label="GitHub" className="hover:text-foreground transition"><Github className="size-4" /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-foreground transition"><Linkedin className="size-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
