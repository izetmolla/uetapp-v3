import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
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
} from "lucide-react";


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
        phone: "+355 69 234 5678",
        enrollmentStatus: "Enrolled",
    },
    quickStats: {
        faculty: "Faculty of Engineering",
        academicYear: "2024–2025",
        program: "BSc Computer Science",
        gpa: 3.72,
        gpaMax: 4.0,
    },
    programs: [
        {
            type: "Primary",
            programName: "BSc in Computer Science",
            faculty: "Faculty of Engineering and Architecture",
            department: "Department of Computer Engineering",
            yearOfRegistration: "2022",
            currentYear: "Year 3 of 4",
            studyForm: "Full-Time",
            speciality: "Software Engineering",
            fundingType: "State-Funded",
            status: "Active",
        },
        {
            type: "Minor",
            programName: "Minor in Data Science",
            faculty: "Faculty of Natural Sciences",
            department: "Department of Mathematics & Informatics",
            yearOfRegistration: "2023",
            currentYear: "Year 2 of 2",
            studyForm: "Part-Time",
            speciality: "",
            fundingType: "Self-Funded",
            status: "Active",
        },
    ],
};

type Identity = typeof studentMockData.identity;
type Program = (typeof studentMockData.programs)[number];

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
            <span className="text-xs text-zinc-400 uppercase tracking-wide">{label}</span>
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
                <span className="text-sm text-zinc-800 font-medium">{value}</span>
            ) : (
                <span className="text-sm text-zinc-300 font-medium">—</span>
            )}
        </div>
    );
}

export default function StudentProfilePage() {
    const [contractStaff] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [identity, setIdentity] = useState<Identity>(studentMockData.identity);
    const [programs, setPrograms] = useState<Program[]>(studentMockData.programs);
    const [draftIdentity, setDraftIdentity] = useState<Identity>(identity);
    const [draftPrograms, setDraftPrograms] = useState<Program[]>(programs);

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

    const current = editMode ? draftIdentity : identity;
    const currentPrograms = editMode ? draftPrograms : programs;

    const setIdField = (k: keyof Identity, v: string) =>
        setDraftIdentity((p) => ({ ...p, [k]: v }));
    const setProgramField = (i: number, k: keyof Program, v: string) =>
        setDraftPrograms((p) => p.map((pr, idx) => (idx === i ? { ...pr, [k]: v } : pr)));

    const gpaPct = (studentMockData.quickStats.gpa / studentMockData.quickStats.gpaMax) * 100;

    return (

        <div className="p-6 space-y-6 max-w-[1400px]">
            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 relative">
                <div className="absolute top-5 right-5 flex gap-2">
                    {contractStaff && !editMode && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={startEdit}
                            className="border-zinc-200 text-zinc-700"
                        >
                            <Pencil className="h-3.5 w-3.5 mr-1.5" />
                            Edit
                        </Button>
                    )}
                    {editMode && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={cancel}
                                className="border-zinc-200 text-zinc-700"
                            >
                                <X className="h-3.5 w-3.5 mr-1.5" />
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={save}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                <Save className="h-3.5 w-3.5 mr-1.5" />
                                Save
                            </Button>
                        </>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-3 shrink-0">
                        <div className="relative group">
                            <Avatar className="h-24 w-24 ring-2 ring-zinc-100">
                                <AvatarImage src={studentMockData.avatar} alt={identity.fullName} />
                                <AvatarFallback>EM</AvatarFallback>
                            </Avatar>
                            {editMode && (
                                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
                                    <Camera className="h-5 w-5 text-white" />
                                </div>
                            )}
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0 font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5" />
                            {studentMockData.status}
                        </Badge>
                    </div>

                    {/* Identity */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <Field label="Full Name" value={current.fullName} editing={editMode} onChange={(v) => setIdField("fullName", v)} />
                        <Field label="Student ID" value={current.studentId} editing={editMode} onChange={(v) => setIdField("studentId", v)} />
                        <Field label="Date of Birth" value={current.dateOfBirth} editing={editMode} onChange={(v) => setIdField("dateOfBirth", v)} />
                        <Field label="Gender" value={current.gender} editing={editMode} onChange={(v) => setIdField("gender", v)} options={["Male", "Female", "Other"]} />
                        <Field label="Nationality" value={current.nationality} editing={editMode} onChange={(v) => setIdField("nationality", v)} />
                        <Field label="Email" value={current.email} editing={editMode} onChange={(v) => setIdField("email", v)} />
                        <Field label="Phone" value={current.phone} editing={editMode} onChange={(v) => setIdField("phone", v)} />
                        <Field label="Enrollment Status" value={current.enrollmentStatus} editing={editMode} onChange={(v) => setIdField("enrollmentStatus", v)} options={["Enrolled", "On Leave", "Graduated", "Withdrawn"]} />
                    </div>

                    {/* Quick stats */}
                    <div className="flex flex-col gap-2 lg:items-end lg:w-72 shrink-0">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-100 text-xs text-zinc-700">
                            <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
                            <span className="font-medium">Faculty:</span>
                            <span className="text-zinc-600">{studentMockData.quickStats.faculty}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-100 text-xs text-zinc-700">
                            <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                            <span className="font-medium">Academic Year:</span>
                            <span className="text-zinc-600">{studentMockData.quickStats.academicYear}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-100 text-xs text-zinc-700">
                            <ClipboardList className="h-3.5 w-3.5 text-indigo-600" />
                            <span className="font-medium">Program:</span>
                            <span className="text-zinc-600">{studentMockData.quickStats.program}</span>
                        </div>
                        <div className="w-full lg:w-64 mt-2 px-4 py-3 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">GPA</span>
                                <span className="text-sm font-semibold text-indigo-700">
                                    {studentMockData.quickStats.gpa.toFixed(2)} / {studentMockData.quickStats.gpaMax.toFixed(2)}
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-indigo-100 overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                    style={{ width: `${gpaPct}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="information" className="w-full">
                <div className="border-b border-zinc-200 overflow-x-auto">
                    <TabsList className="bg-transparent p-0 h-auto gap-1 rounded-none justify-start">
                        {[
                            { v: "information", l: "Information", i: ClipboardList },
                            { v: "addresses", l: "Addresses", i: MapPin },
                            { v: "academic", l: "Academic Info", i: BookOpen },
                            { v: "documents", l: "Documents", i: FileText },
                            { v: "timetable", l: "Timetable", i: Clock },
                            { v: "grades", l: "Grades", i: Award },
                            { v: "finance", l: "Finance Records", i: Wallet },
                        ].map((t) => (
                            <TabsTrigger
                                key={t.v}
                                value={t.v}
                                className="px-4 py-3 rounded-none bg-transparent text-zinc-500 data-[state=active]:text-indigo-600 data-[state=active]:font-semibold data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-indigo-600 transition-all duration-200 whitespace-nowrap"
                            >
                                {t.l}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <TabsContent value="information" className="mt-6 space-y-6">
                    <div>
                        <h2 className="text-base font-semibold text-zinc-800 border-b border-zinc-100 pb-2 mb-4">
                            Study Programs
                        </h2>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                            {currentPrograms.map((p, i) => (
                                <div
                                    key={i}
                                    className="rounded-xl border border-zinc-200 bg-white shadow-sm p-5 relative"
                                >
                                    <Badge
                                        className={
                                            p.type === "Primary"
                                                ? "absolute top-4 right-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-0"
                                                : "absolute top-4 right-4 bg-slate-100 text-slate-700 hover:bg-slate-100 border-0"
                                        }
                                    >
                                        {p.type}
                                    </Badge>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-2">
                                        <Field label="Program Name" value={p.programName} editing={editMode} onChange={(v) => setProgramField(i, "programName", v)} />
                                        <Field label="Faculty" value={p.faculty} editing={editMode} onChange={(v) => setProgramField(i, "faculty", v)} />
                                        <Field label="Department" value={p.department} editing={editMode} onChange={(v) => setProgramField(i, "department", v)} />
                                        <Field label="Year of Registration" value={p.yearOfRegistration} editing={editMode} onChange={(v) => setProgramField(i, "yearOfRegistration", v)} />
                                        <Field label="Current Year" value={p.currentYear} editing={editMode} onChange={(v) => setProgramField(i, "currentYear", v)} />
                                        <Field label="Study Form" value={p.studyForm} editing={editMode} onChange={(v) => setProgramField(i, "studyForm", v)} options={["Full-Time", "Part-Time", "Distance"]} />
                                        <Field label="Speciality / Profile" value={p.speciality} editing={editMode} onChange={(v) => setProgramField(i, "speciality", v)} />
                                        <Field label="Funding Type" value={p.fundingType} editing={editMode} onChange={(v) => setProgramField(i, "fundingType", v)} options={["State-Funded", "Self-Funded", "Scholarship"]} />
                                        <div className="md:col-span-2">
                                            <Field label="Status" value={p.status} editing={editMode} onChange={(v) => setProgramField(i, "status", v)} options={["Active", "Inactive", "Completed"]} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                {[
                    { v: "addresses", i: MapPin },
                    { v: "academic", i: BookOpen },
                    { v: "documents", i: FileText },
                    { v: "timetable", i: Clock },
                    { v: "grades", i: Award },
                    { v: "finance", i: Wallet },
                ].map(({ v, i: Icon }) => (
                    <TabsContent key={v} value={v} className="mt-6">
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <Icon className="h-10 w-10 text-zinc-300" strokeWidth={1.5} />
                            <p className="text-sm text-zinc-400">Tab content coming soon</p>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
