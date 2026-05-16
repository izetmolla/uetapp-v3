import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Badge } from "@workspace/ui/components/badge";

const cases = [
  { id: "ecommerce", label: "E-Commerce", title: "Launch a storefront in a weekend", desc: "Build product catalogs, checkout flows, and order dashboards without writing a single line of code.", tags: ["Cart & Checkout", "Stripe Payments", "Inventory Sync"] },
  { id: "crm", label: "CRM", title: "A CRM that fits how you work", desc: "Design pipelines, automate follow-ups, and connect every customer touchpoint.", tags: ["Pipelines", "Email Sync", "Lead Scoring"] },
  { id: "erp", label: "ERP", title: "Operations, unified", desc: "Inventory, HR, finance — all on one schema with role-based access.", tags: ["Roles & Permissions", "Reports", "Approvals"] },
  { id: "uni", label: "University", title: "Run an institution end-to-end", desc: "Manage admissions, courses, attendance, and grading in one workspace.", tags: ["Admissions", "Grading", "Timetables"] },
  { id: "ai", label: "AI Tools", title: "Ship LLM apps fast", desc: "Bring your prompts, models, and data together to build production AI tools.", tags: ["LLM Routing", "Vector Search", "Eval Suite"] },
  { id: "auto", label: "Automations", title: "Automate the boring parts", desc: "Trigger workflows from any event — internal or external — and connect to anything.", tags: ["Cron Jobs", "Webhooks", "Notifications"] },
];

export function UseCases() {
  return (
    <section className="py-24 sm:py-32 border-t border-hairline">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">One Platform. Infinite Products.</h2>
          <p className="mt-4 text-muted-foreground">From storefronts to student systems — pick a path.</p>
        </div>
        <Tabs defaultValue="ecommerce" className="mt-12">
          <TabsList className="flex flex-wrap h-auto justify-center gap-1 bg-surface-1 border border-hairline p-1 rounded-full mx-auto w-fit max-w-full">
            {cases.map((c) => (
              <TabsTrigger key={c.id} value={c.id} className="rounded-full px-4 py-2 text-xs sm:text-sm data-[state=active]:bg-gradient-brand data-[state=active]:text-white">
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {cases.map((c) => (
            <TabsContent key={c.id} value={c.id} className="mt-10">
              <div className="glass-card rounded-2xl p-8 sm:p-12 max-w-3xl mx-auto text-center">
                <h3 className="text-2xl sm:text-3xl font-semibold">{c.title}</h3>
                <p className="mt-3 text-muted-foreground">{c.desc}</p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  {c.tags.map((t) => (
                    <Badge key={t} variant="outline" className="border-hairline-strong bg-surface-2 text-foreground">{t}</Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
