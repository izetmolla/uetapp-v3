import { Layout, Database, Workflow, Plug, Bot, Network } from "lucide-react";

const features = [
  { icon: Layout, title: "Drag & Drop UI Builder", desc: "Build stunning interfaces with Shadcn, Tailwind, and React components. No code, no limits.", color: "text-indigo-accent" },
  { icon: Database, title: "Entity Manager", desc: "Define your data schema, build relationships, and run queries with a visual interface.", color: "text-cyan-accent" },
  { icon: Workflow, title: "Workflow Engine", desc: "Replace backend code with visual workflows. Connect logic, conditions, and actions in minutes.", color: "text-indigo-accent" },
  { icon: Plug, title: "Endpoint Studio", desc: "Declare REST endpoints, bind them to your workflows, and go live instantly.", color: "text-cyan-accent" },
  { icon: Bot, title: "AI Assistant", desc: "Chat with AI to write content, design dashboards, engineer logic, or scaffold entire apps.", color: "text-indigo-accent" },
  { icon: Network, title: "MCP Server", desc: "Connect Claude, ChatGPT, Cursor, or Copilot to your workspace via MCP protocol.", color: "text-cyan-accent" },
];

export function Features() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">Everything You Need to Build</h2>
          <p className="mt-4 text-muted-foreground">Six modular tools, one production-grade workspace.</p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="group glass-card rounded-2xl p-6 transition hover:border-indigo-accent/40 hover:shadow-brand-glow">
              <div className={`inline-flex size-11 items-center justify-center rounded-xl bg-surface-2 border border-hairline ${f.color} group-hover:scale-110 transition`}>
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
