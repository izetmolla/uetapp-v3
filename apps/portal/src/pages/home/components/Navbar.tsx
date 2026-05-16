import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router";
import { Menu, X, ChevronDown, Layout, Database, Workflow, Plug, Bot, Network, ShoppingCart, Users, Building2, GraduationCap, Sparkles, Zap, Mail, Globe, Briefcase } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { ThemeToggle } from "./ThemeToggle";
import useAuthorizationStore from "@workspace/flowtrove/store/authorization";
import SignedInComponent from "./singed-in-component";

type SubItem = { label: string; desc: string; icon: React.ElementType };
const product: SubItem[] = [
  { label: "UI Builder", desc: "Drag & drop interfaces", icon: Layout },
  { label: "Entity Manager", desc: "Visual data schema", icon: Database },
  { label: "Workflow Engine", desc: "Logic without code", icon: Workflow },
  { label: "Endpoint Studio", desc: "Instant REST APIs", icon: Plug },
  { label: "AI Assistant", desc: "Build with /ai", icon: Bot },
  { label: "MCP Integrations", desc: "Connect any AI", icon: Network },
];
const solutions: SubItem[] = [
  { label: "E-Commerce", desc: "Storefronts & checkout", icon: ShoppingCart },
  { label: "CRM", desc: "Pipelines & contacts", icon: Users },
  { label: "ERP", desc: "Operations at scale", icon: Building2 },
  { label: "University", desc: "Student management", icon: GraduationCap },
  { label: "AI Tools", desc: "LLM-powered apps", icon: Sparkles },
  { label: "Automations", desc: "Trigger anything", icon: Zap },
];
const integrations: SubItem[] = [
  { label: "Google Workspace", desc: "Docs, Sheets, Drive", icon: Globe },
  { label: "Microsoft 365", desc: "Teams & Outlook", icon: Briefcase },
  { label: "Airtable", desc: "Sync your bases", icon: Database },
  { label: "Custom Domains", desc: "*.flowtrove.com", icon: Globe },
  { label: "Email Sending", desc: "Transactional mail", icon: Mail },
  { label: "Third-Party APIs", desc: "Connect anything", icon: Plug },
];

const navGroups = [
  { label: "Product", items: product },
  { label: "Solutions", items: solutions },
  { label: "Integrations", items: integrations },
];

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

function MegaPanel({ items, title }: { items: SubItem[]; title: string }) {
  return (
    <div className="absolute left-1/2 top-full -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
      <div className="rounded-xl border border-hairline border-t-2 border-t-indigo-accent bg-popover p-6 w-[560px] shadow-2xl shadow-black/20 dark:shadow-black/60">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">{title}</div>
        <div className="grid grid-cols-2 gap-2">
          {items.map((it) => (
            <a key={it.label} href="#" className="flex items-start gap-3 rounded-xl p-3 hover:bg-surface-2 transition">
              <div className="size-9 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0 shadow-brand-glow">
                <it.icon className="size-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{it.label}</div>
                <div className="text-xs text-muted-foreground">{it.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>("Product");
  const navigate = useNavigate();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 left-0 z-[101] h-screen w-[80vw] max-w-[320px] bg-popover border-r border-indigo-accent/30 flex flex-col lg:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-accent/5 via-transparent to-cyan-accent/5" />
            <div className="relative flex items-center justify-between px-5 h-16 border-b border-hairline">
              <div className="flex items-center gap-2">
                <FlowLogo className="size-7 text-foreground" />
                <span className="font-display font-semibold tracking-tight">FlowTrove</span>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button onClick={onClose} aria-label="Close menu" className="rounded-md p-1.5 hover:bg-surface-2">
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {navGroups.map((g) => {
                const isOpen = expanded === g.label;
                return (
                  <div key={g.label}>
                    <button
                      onClick={() => setExpanded(isOpen ? null : g.label)}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-surface-2 text-sm font-medium"
                    >
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">{g.label}</span>
                      <ChevronDown className={`size-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-4 pl-3 border-l border-indigo-accent/40 py-1 space-y-0.5">
                            {g.items.map((it) => (
                              <a key={it.label} href="#" onClick={onClose} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-surface-2">
                                <it.icon className="size-4 text-cyan-accent" />
                                <span className="text-sm text-foreground">{it.label}</span>
                              </a>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              <a href="#pricing" onClick={onClose} className="block px-3 py-3 rounded-lg hover:bg-surface-2 text-xs uppercase tracking-widest text-muted-foreground font-medium">Pricing</a>
              <a href="#" onClick={onClose} className="block px-3 py-3 rounded-lg hover:bg-surface-2 text-xs uppercase tracking-widest text-muted-foreground font-medium">Docs</a>
            </div>

            <div className="relative border-t border-hairline p-4 pb-6 space-y-2 bg-popover">
              <Button variant="ghost" className="w-full border border-hairline text-foreground hover:bg-surface-2" onClick={() => navigate("/sign-in")}>Sign In</Button>
              <Button className="w-full bg-gradient-brand text-white shadow-brand-glow hover:opacity-90" onClick={() => navigate("/register?option=quickstart")}>Start Building Free</Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function Navbar() {
  const isSignedIn = useAuthorizationStore(c => c.isSignedIn)
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-hairline backdrop-blur-md bg-background/85 transition-shadow ${scrolled ? "shadow-lg shadow-black/10 dark:shadow-black/50" : ""
        }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <FlowLogo className="size-7 text-foreground" />
          <span className="font-display text-lg font-semibold tracking-tight">FlowTrove</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navGroups.map((g) => (
            <div key={g.label} className="group relative">
              <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition flex items-center gap-1">
                {g.label} <ChevronDown className="size-3.5 opacity-60 group-hover:rotate-180 transition" />
              </button>
              <MegaPanel items={g.items} title={g.label} />
            </div>
          ))}
          <a href="#pricing" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition">Pricing</a>
          <a href="#" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition">Docs</a>
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <ThemeToggle />
          {isSignedIn ? (
            <SignedInComponent />
          ) : (
            <>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/sign-in")}>Sign In</Button>
              <Button className="bg-gradient-brand text-white shadow-brand-glow hover:opacity-90" onClick={() => navigate("/register")}>Start Free</Button>
            </>
          )}
        </div>

        <button className="lg:hidden text-foreground rounded-md p-1.5 hover:bg-surface-2" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="size-6" />
        </button>
      </div>

      <MobileDrawer open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
