import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Progress } from "@workspace/ui/components/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@workspace/ui/components/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import {
    Pencil,
    Save,
    X,
    Camera,
    GraduationCap,
    Calendar,
    ClipboardList,
    MapPin,
    BookOpen,
    FileText,
    Clock,
    Award,
    Wallet,
    type LucideIcon,
    CloudSync,
    Loader2,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getStudentDetail, syncStudent } from "./api";
import { useParams } from "react-router";
import ContentLoader from "@workspace/flowtrove/components/content-loader";
import { queryClient, withError } from "@workspace/flowtrove/lib/network";
import { cn, generateAvatarFallback } from "@workspace/ui/lib/utils";
import { toast } from "@workspace/ui/components/sonner";


const studentMockData = {
    role: "Contract Staff",
    avatar: "https://i.pravatar.cc/150?img=12",
    status: "Active",
    identity: {
        fullName: "Erjon Malëshova",
        studentId: "UNI-2024-04871",
        dateOfBirth: "14 March 2001",
        gender: "Male",
        nationality: "Albanian",
        email: "erjon.maleshova@uni.edu.al",
        phone: "-",
        enrollmentStatus: "Enrolled",
    },
    quickStats: {
        faculty: "Faculty of Engineering",
        academicYear: "2024–2025",
        program: "BSc Computer Science",
    },
    programs: [

    ],
};

type Identity = typeof studentMockData.identity;
type Program = (typeof studentMockData.programs)[number];

const profileTabs: { value: string; label: string; icon: LucideIcon }[] = [
    { value: "information", label: "Information", icon: ClipboardList },
    { value: "addresses", label: "Addresses", icon: MapPin },
    { value: "academic", label: "Academic", icon: BookOpen },
    { value: "documents", label: "Documents", icon: FileText },
    { value: "timetable", label: "Timetable", icon: Clock },
    { value: "grades", label: "Grades", icon: Award },
    { value: "finance", label: "Finance", icon: Wallet },
];

function Field({
    label,
    value,
    editing,
    onChange,
    options,
}: {
    label: string;
    value: string;
    editing: boolean;
    onChange?: (v: string) => void;
    options?: string[];
}) {
    return (
        <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
            {editing ? (
                options ? (
                    <Select value={value} onValueChange={(v) => onChange?.(v)}>
                        <SelectTrigger className="h-9 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((o) => (
                                <SelectItem key={o} value={o}>
                                    {o}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <Input
                        value={value}
                        onChange={(e) => onChange?.(e.target.value)}
                        className="h-9 text-sm"
                    />
                )
            ) : value ? (
                <span className="text-sm text-foreground font-medium">{value}</span>
            ) : (
                <span className="text-sm text-muted-foreground/50 font-medium">—</span>
            )}
        </div>
    );
}

function progressPct(value: number, max: number): number {
    if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
    return Math.min(100, (value / max) * 100);
}

function AcademicProgressCard({
    gpa,
    gpaMax,
    creditsEarned,
    creditsRequired,
}: {
    gpa?: number;
    gpaMax?: number;
    creditsEarned?: number;
    creditsRequired?: number;
}) {
    const gpaPct = progressPct(gpa ?? 0, gpaMax ?? 0);
    const creditsPct = progressPct(creditsEarned ?? 0, creditsRequired ?? 0);
    const hasCredits =
        creditsEarned !== undefined &&
        creditsRequired !== undefined &&
        Number.isFinite(creditsEarned) &&
        Number.isFinite(creditsRequired);
    let creditsRemaining: number | null = null;
    let creditsLabel = "—";
    if (hasCredits) {
        creditsRemaining = Math.max(0, creditsRequired - creditsEarned);
        creditsLabel = `${creditsEarned} / ${creditsRequired}`;
    }

    const hasGpa = gpa !== undefined && gpaMax !== undefined && Number.isFinite(gpa) && Number.isFinite(gpaMax);
    let gpaLabel = "—";
    if (hasGpa) {
        gpaLabel = `${gpa.toFixed(2)} / ${gpaMax.toFixed(1)}`;
    }

    return (
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                        <Award className="size-3.5 shrink-0 text-primary" aria-hidden />
                        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            GPA
                        </span>
                        <span className="truncate text-sm font-semibold tabular-nums text-foreground">
                            {gpaLabel}
                        </span>
                    </div>
                    {hasGpa ? (
                        <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                            {gpaPct.toFixed(0)}%
                        </span>
                    ) : null}
                </div>
                <Progress value={gpaPct} className="h-1 bg-primary/15" aria-label="GPA progress" />
            </div>

            <div className="space-y-1.5 sm:border-l sm:border-t-0 sm:border-border/60 sm:pl-4 sm:pt-0 border-t border-border/60 pt-3 sm:pt-0">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                        <BookOpen className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            Credits
                        </span>
                        <span className="truncate text-sm font-semibold tabular-nums text-foreground">
                            {creditsLabel}
                        </span>
                    </div>
                    {creditsRemaining !== null ? (
                        <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                            {creditsRemaining} left
                        </span>
                    ) : null}
                </div>
                <Progress value={creditsPct} className="h-1" aria-label="Credits progress" />
            </div>
        </div>
    );
}

function ProgramCard({
    program,
    editing,
    // onFieldChange,
}: {
    program: any;
    editing: boolean;
    // onFieldChange: (key: keyof Program, value: string) => void;
}) {
    const isPrimary = program?.type === "Primary";



    return (
        <article
            className={cn(
                "glass-card w-full overflow-hidden rounded-2xl border border-border/70",
                isPrimary ? "border-l-4 border-l-primary" : "border-l-4 border-l-border",
            )}
        >
            <header className="flex flex-col gap-3 border-b border-border/60 bg-muted/25 px-6 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div
                        className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-xl",
                            isPrimary ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                        )}
                    >
                        <GraduationCap className="size-5" aria-hidden />
                    </div>
                    <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                className={cn(
                                    "border-0 font-medium",
                                    isPrimary
                                        ? "bg-primary/10 text-primary hover:bg-primary/10"
                                        : "bg-secondary text-secondary-foreground hover:bg-secondary",
                                )}
                            >
                                {program?.type}
                            </Badge>
                            <Badge
                                variant="outline"
                                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            >
                                {program?.student_status?.name}
                            </Badge>
                        </div>
                        <h3 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
                            {program?.study_level?.name} - {program?.study_program?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{program?.faculty?.name}</p>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground sm:text-right">
                    {program?.department}
                </p>
            </header>

            <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <Field
                    label="Program Name"
                    value={program?.study_program?.name}
                    editing={editing}
                />
                <Field
                    label="Faculty"
                    value={program?.faculty?.name}
                    editing={editing}
                />
                <Field
                    label="Department"
                    value={program?.department}
                    editing={editing}
                />
                <Field
                    label="Year of Registration"
                    value={program?.reg_year?.year}
                    editing={editing}
                />
                <Field
                    label="Status"
                    value={program?.student_status?.name}
                    editing={editing}
                    options={["Active", "Inactive", "Completed"]}
                />
                <Field
                    label="Study Level"
                    value={program?.study_level?.name}
                    editing={editing}
                />
                <Field
                    label="Speciality / Profile"
                    value={program?.study_profile?.name}
                    editing={editing}
                />
                <Field
                    label="Funding Type"
                    value={program?.fundingType}
                    editing={editing}
                    options={["State-Funded", "Self-Funded", "Scholarship"]}
                />

            </div>

            <div className="border-t border-border/60 bg-muted/10 px-6 py-3">
                <AcademicProgressCard
                    gpa={program.gpa}
                    gpaMax={program.gpaMax}
                    creditsEarned={program.creditsEarned}
                    creditsRequired={program.creditsRequired}
                />
            </div>
        </article>
    );
}

export default function StudentProfilePage() {
    const { id } = useParams();
    const [contractStaff] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [identity, setIdentity] = useState<Identity>(studentMockData.identity);
    const [programs, setPrograms] = useState<Program[]>(studentMockData.programs);
    const [draftIdentity, setDraftIdentity] = useState<Identity>(identity);
    const [draftPrograms, setDraftPrograms] = useState<Program[]>(programs);

    const queryKey = ["student", id];
    const { data, isLoading, error } = useQuery({
        queryKey: queryKey,
        queryFn: () => getStudentDetail({ id }),
    });


    const mutation = useMutation({
        mutationFn: syncStudent,
        onSuccess: (result) => {
            if (result.success) {
                toast.success(result.message ?? "Student synced successfully");
                queryClient.invalidateQueries({ queryKey: queryKey });
                return;
            }
            const detail = result.errors?.[0]?.message;
            toast.error(detail ? `${result.message}: ${detail}` : (result.message ?? "Sync failed"));
        },
        onError: (error: Error) => {
            toast.error(error?.message ?? "Failed to sync student");
        },
    });

    const startEdit = () => {
        setDraftIdentity(identity);
        setDraftPrograms(programs);
        setEditMode(true);
    };
    const cancel = () => setEditMode(false);
    const save = () => {
        setIdentity(draftIdentity);
        setPrograms(draftPrograms);
        setEditMode(false);
    };


    const setIdField = (k: keyof Identity, v: string) => setDraftIdentity((p) => ({ ...p, [k]: v }));

    const handleSync = () => {
        mutation.mutate({ student_id: Number(id), students: [] });
    };

    const fullName = data?.student?.firstname + " " + data?.student?.lastname;



    const lsp = useMemo(() => {
        if (!data?.student?.programs || data?.student?.programs?.length === 0) return null;
        return data?.student?.programs?.sort((a: any, b: any) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())[0];
    }, [data?.student?.programs]);

    return (
        <ContentLoader isLoading={isLoading} error={withError(error, data)}>
            <div className="mx-auto w-full space-y-6 p-6 xl:max-w-6xl 2xl:max-w-7xl">
                {/* Header Card */}
                <div className="glass-card rounded-2xl border border-border/70 p-6">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Avatar */}
                        <div className="flex flex-col items-center gap-3 shrink-0 lg:w-40">
                            <div className="relative group">
                                <Avatar className="h-24 w-24 ring-2 ring-border">
                                    <AvatarImage src={"#"} alt={fullName} />
                                    <AvatarFallback className="bg-muted text-muted-foreground">{generateAvatarFallback(fullName)}</AvatarFallback>
                                </Avatar>
                                {editMode && (
                                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
                                        <Camera className="h-5 w-5 text-white" />
                                    </div>
                                )}
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 border-0 font-medium">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5" />
                                {studentMockData.status}
                            </Badge>
                            {contractStaff && (
                                <div className="flex w-full flex-col gap-2 pt-1">
                                    {!editMode ? (
                                        <Button variant="outline" size="sm" className="w-full" onClick={startEdit} disabled>
                                            <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                            Edit profile
                                        </Button>
                                    ) : (
                                        <>
                                            <Button size="sm" className="w-full" onClick={save}>
                                                <Save className="h-3.5 w-3.5 mr-1.5" />
                                                Save
                                            </Button>
                                            <Button variant="outline" size="sm" className="w-full" onClick={cancel}>
                                                <X className="h-3.5 w-3.5 mr-1.5" />
                                                Cancel
                                            </Button>
                                        </>
                                    )}
                                    <Button variant="outline" size="sm" className="w-full" onClick={handleSync} disabled={mutation.isPending}>
                                        {mutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5" /> : <CloudSync className="h-3.5 w-3.5 mr-1.5" />}
                                        {mutation.isPending ? "Syncing..." : "Sync"}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Identity */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <Field label="Full Name" value={data?.student?.firstname + " " + data?.student?.lastname} editing={editMode} onChange={(v) => setIdField("fullName", v)} />
                            <Field label="Student ID" value={data?.student?.document_id ?? ""} editing={editMode} onChange={(v) => setIdField("studentId", v)} />
                            <Field label="Date of Birth" value={data?.student?.birthdate ?? ""} editing={editMode} onChange={(v) => setIdField("dateOfBirth", v)} />
                            <Field label="Gender" value={data?.student?.gender ?? ""} editing={editMode} onChange={(v) => setIdField("gender", v)} options={["Male", "Female", "Other"]} />
                            <Field label="Nationality" value={data?.student?.nationality ?? ""} editing={editMode} onChange={(v) => setIdField("nationality", v)} />
                            <Field label="Email" value={data?.student?.email ?? ""} editing={editMode} onChange={(v) => setIdField("email", v)} />
                            <Field label="Mobile" value={data?.student?.mobile ?? ""} editing={editMode} onChange={(v) => setIdField("phone", v)} />
                            <Field label="Academic Email" value={data?.student?.academic_email ?? ""} editing={editMode} onChange={(v) => setIdField("enrollmentStatus", v)} options={["Enrolled", "On Leave", "Graduated", "Withdrawn"]} />
                        </div>

                        {/* Quick stats */}
                        <div className="flex flex-col gap-2 lg:items-end lg:w-72 shrink-0">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border border-border text-xs text-foreground">
                                <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="font-medium">Faculty:</span>
                                <span className="text-muted-foreground">{lsp?.faculty?.name}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border border-border text-xs text-foreground">
                                <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="font-medium">Academic Year:</span>
                                <span className="text-muted-foreground">{lsp?.reg_year?.year}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border border-border text-xs text-foreground">
                                <ClipboardList className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="font-medium">Program:</span>
                                <span className="text-muted-foreground">{lsp?.study_program?.name}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="information" className="w-full space-y-5">
                    <nav
                        aria-label="Student profile sections"
                        className="glass-card flex h-12 w-full items-center justify-start overflow-hidden rounded-2xl border border-border/70 px-2 py-2"
                    >
                        <div className="w-full overflow-x-auto overflow-y-hidden overscroll-x-contain overscroll-y-none [-webkit-overflow-scrolling:touch]">
                            <TabsList className="flex h-9 w-max flex-nowrap items-center justify-start gap-1 overflow-hidden rounded-xl bg-muted/40 p-1">
                                {profileTabs.map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="inline-flex h-8 shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground shadow-none after:hidden transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                                    >
                                        <tab.icon className="size-4 shrink-0 opacity-80" aria-hidden />
                                        <span className="whitespace-nowrap">{tab.label}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                    </nav>

                    <TabsContent value="information" className="mt-0 focus-visible:outline-none">
                        <section className="w-full space-y-5">
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                                    Study Programs
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Enrolled programs, faculty assignment, and academic standing.
                                </p>
                            </div>
                            <div className="flex w-full flex-col gap-5">
                                {data?.student?.programs?.map((p, i) => (
                                    <ProgramCard
                                        key={`${i}`}
                                        program={p as any}
                                        editing={editMode}
                                    // onFieldChange={(key, value) => setProgramField(i, key, value)}
                                    />
                                ))}
                            </div>
                        </section>
                    </TabsContent>

                    {profileTabs
                        .filter((tab) => tab.value !== "information")
                        .map((tab) => (
                            <TabsContent
                                key={tab.value}
                                value={tab.value}
                                className="mt-0 focus-visible:outline-none"
                            >
                                <div className="glass-card flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/80 px-6 py-20 text-center">
                                    <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60">
                                        <tab.icon className="size-7 text-muted-foreground/50" strokeWidth={1.5} aria-hidden />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-foreground">{tab.label}</p>
                                        <p className="text-sm text-muted-foreground">This section is coming soon.</p>
                                    </div>
                                </div>
                            </TabsContent>
                        ))}
                </Tabs>
            </div>
        </ContentLoader>
    );
}
