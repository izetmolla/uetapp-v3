export type AcademicYear = {
    id: string;
    label: string;
    folders: number;
    students: number;
    faculties: number;
    completion: number;
    status: "Active" | "Archived";
    accent: string;
};

export type Faculty = {
    slug: string;
    name: string;
    short: string;
    students: number;
    folders: number;
    completion: number;
    accent: string;
    iconKey: "trending" | "cpu" | "book" | "scale" | "stethoscope";
};

export type StudyLevel = {
    slug: string;
    name: string;
    description: string;
    duration: string;
    students: number;
    group: "Undergraduate" | "Postgraduate" | "Vocational";
    iconKey: "book" | "flask" | "briefcase" | "microscope" | "award";
    accent: string;
};

export type Folder = {
    id: string;
    name: string;
    students: number;
    scanned: number;
    status: "Complete" | "In Progress" | "Pending";
    lastModified: string;
};

export type Student = {
    id: string;
    name: string;
    initials: string;
    program: string;
    docs: number;
    status: "Verified" | "Pending Review" | "Missing Docs";
    scannedDate: string;
    color: string;
};

// Seeded pseudo-random so values are stable across renders
function seeded(seed: number) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

const yearAccents = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];

export const academicYears: AcademicYear[] = [
    "2019-2020", "2020-2021", "2021-2022", "2022-2023", "2023-2024", "2024-2025",
].map((label, i) => {
    const rnd = seeded(i + 1);
    return {
        id: label,
        label: label.replace("-", " – "),
        folders: Math.floor(rnd() * 70) + 80,
        students: Math.floor(rnd() * 1700) + 800,
        faculties: 5,
        completion: Math.floor(rnd() * 40) + 60,
        status: i < 4 ? "Archived" : "Active",
        accent: yearAccents[i],
    };
});

export const faculties: Faculty[] = [
    { slug: "ekonomi", name: "Fakulteti i Ekonomisë, Biznesit dhe Zhvillimit", short: "Ekonomi & Biznes", iconKey: "trending", accent: "#10B981", students: 612, folders: 28, completion: 86 },
    { slug: "inxhinieri", name: "Fakulteti i Inxhinierisë, Informatikës dhe Arkitekturës", short: "Inxhinieri & IT", iconKey: "cpu", accent: "#3B82F6", students: 824, folders: 34, completion: 78 },
    { slug: "humane", name: "Fakulteti i Shkencave Humane, Edukimit dhe Arteve Liberale", short: "Shkencat Humane", iconKey: "book", accent: "#F59E0B", students: 458, folders: 22, completion: 92 },
    { slug: "juridik", name: "Fakulteti i Shkencave Juridike, Politike dhe Marrëdhënieve Ndërkombëtare", short: "Juridik & Politike", iconKey: "scale", accent: "#8B5CF6", students: 537, folders: 26, completion: 71 },
    { slug: "mjekesi", name: "Fakulteti i Shkencave Mjekësore Teknike", short: "Mjekësi Teknike", iconKey: "stethoscope", accent: "#EC4899", students: 389, folders: 19, completion: 88 },
];

export const studyLevels: StudyLevel[] = [
    { slug: "bachelor", name: "Bachelor", description: "3–4 year undergraduate degree", duration: "3-4 years", students: 1240, group: "Undergraduate", iconKey: "book", accent: "#3B82F6" },
    { slug: "msc", name: "Master of Science", description: "Research-focused graduate degree", duration: "2 years", students: 312, group: "Postgraduate", iconKey: "flask", accent: "#8B5CF6" },
    { slug: "master-profesional", name: "Professional Master", description: "Career-oriented advanced studies", duration: "2 years", students: 198, group: "Postgraduate", iconKey: "briefcase", accent: "#06B6D4" },
    { slug: "phd", name: "PhD", description: "Doctoral research program", duration: "3-5 years", students: 64, group: "Postgraduate", iconKey: "microscope", accent: "#F59E0B" },
    { slug: "diplome-profesionale", name: "Professional Diploma", description: "Applied vocational qualification", duration: "1 year", students: 142, group: "Vocational", iconKey: "award", accent: "#10B981" },
];

export function generateFolders(count = 30, seed = 42): Folder[] {
    const rnd = seeded(seed);
    const statuses: Folder["status"][] = ["Complete", "In Progress", "Pending"];
    return Array.from({ length: count }, (_, i) => {
        const students = Math.floor(rnd() * 26) + 20;
        const scanned = Math.floor(rnd() * students);
        const statusIdx = Math.floor(rnd() * 3);
        const daysAgo = Math.floor(rnd() * 60);
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        return {
            id: `folder-${String(i + 1).padStart(2, "0")}`,
            name: `Folder ${String(i + 1).padStart(2, "0")}`,
            students,
            scanned,
            status: statuses[statusIdx],
            lastModified: d.toISOString().slice(0, 10),
        };
    });
}

const firstNames = ["Arben", "Besa", "Drilon", "Elira", "Fatos", "Gentian", "Hana", "Ilir", "Jonida", "Klaudia", "Lulzim", "Mira", "Nora", "Olta", "Petrit", "Qendrim", "Rinor", "Saimir", "Teuta", "Urim", "Valbona", "Xhuljana", "Ylli", "Zana", "Aida", "Blerim", "Diellza", "Edmond", "Florian", "Gerta"];
const lastNames = ["Hoxha", "Berisha", "Krasniqi", "Shala", "Gashi", "Bytyqi", "Rama", "Hysaj", "Tahiri", "Mema", "Kelmendi", "Dervishi", "Lleshi", "Ndoja", "Bajrami", "Zogu", "Cana", "Sela", "Vata", "Prifti", "Murati", "Bashota", "Halilaj", "Dushi", "Kastrati", "Llapashtica", "Nikolla", "Toska", "Spahiu", "Lekaj"];
const palette = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316", "#14B8A6"];

export function generateStudents(count = 30, yearLabel = "2024", levelSlug = "bachelor", seed = 7): Student[] {
    const rnd = seeded(seed);
    const statuses: Student["status"][] = ["Verified", "Pending Review", "Missing Docs"];
    const yearShort = yearLabel.split("-")[0] || "2024";
    return Array.from({ length: count }, (_, i) => {
        const fn = firstNames[Math.floor(rnd() * firstNames.length)];
        const ln = lastNames[Math.floor(rnd() * lastNames.length)];
        const name = `${fn} ${ln}`;
        const initials = `${fn[0]}${ln[0]}`;
        const sidx = Math.floor(rnd() * 10);
        const status = statuses[sidx < 6 ? 0 : sidx < 9 ? 1 : 2];
        const daysAgo = Math.floor(rnd() * 120);
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        return {
            id: `STU-${yearShort}-${String(i + 1).padStart(4, "0")}`,
            name,
            initials,
            program: levelSlug.toUpperCase().slice(0, 8),
            docs: Math.floor(rnd() * 8) + 1,
            status,
            scannedDate: d.toISOString().slice(0, 10),
            color: palette[i % palette.length],
        };
    });
}

export function findFaculty(slug: string) {
    return faculties.find((f) => f.slug === slug);
}
export function findLevel(slug: string) {
    return studyLevels.find((l) => l.slug === slug);
}