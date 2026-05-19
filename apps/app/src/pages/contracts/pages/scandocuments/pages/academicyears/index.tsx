import { GraduationCap, Folder, Users, Building2, CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { academicYears } from "../../data/mockData";
import { PageHeader, PageShell } from "../../components/page-shell";
import { GridSkeleton, MaybeSkeleton, useSimulatedLoad } from "../../components/skeleton-page";
import { Link } from "react-router";



const AcademicYearsPage = () => {
    const loading = useSimulatedLoad();
    return (
        <PageShell>
            <PageHeader title="Scanned Documents" subtitle="Browse documents by academic year" />
            <MaybeSkeleton loading={loading} skeleton={<GridSkeleton />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {academicYears.map((y) => (
                        <Link
                            key={y.id}
                            to={`${y.id}`}
                            className="glass-card glow-hover rounded-2xl p-6 group relative overflow-hidden"
                            style={{
                                background: `radial-gradient(120% 80% at 50% -20%, ${y.accent}22, transparent 60%), var(--card)`,
                            }}
                        >
                            <div className="flex flex-col items-center text-center mb-5">
                                <div
                                    className="w-14 h-14 grid place-items-center rounded-2xl mb-3 ring-1"
                                    style={{ backgroundColor: `${y.accent}22`, color: y.accent, borderColor: `${y.accent}55` }}
                                >
                                    <GraduationCap className="w-7 h-7" />
                                </div>
                                <h3 className="font-display text-2xl font-semibold">{y.label}</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <Stat icon={<Folder className="w-3.5 h-3.5" />} label="Folders" value={y.folders} />
                                <Stat icon={<Users className="w-3.5 h-3.5" />} label="Students" value={y.students.toLocaleString()} />
                                <Stat icon={<Building2 className="w-3.5 h-3.5" />} label="Faculties" value={y.faculties} />
                                <div className="bg-secondary/40 rounded-lg p-2.5">
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Completion
                                    </div>
                                    <Progress value={y.completion} className="h-1.5" />
                                    <div className="text-xs mt-1 font-medium">{y.completion}%</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <Badge
                                    variant="outline"
                                    className={
                                        y.status === "Active"
                                            ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                                            : "border-border text-muted-foreground"
                                    }
                                >
                                    {y.status}
                                </Badge>
                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                            </div>
                        </Link>
                    ))}
                </div>
            </MaybeSkeleton>
        </PageShell>
    );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
        <div className="bg-secondary/40 rounded-lg p-2.5">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                {icon}
                {label}
            </div>
            <div className="text-base font-semibold">{value}</div>
        </div>
    );
}


export default AcademicYearsPage;