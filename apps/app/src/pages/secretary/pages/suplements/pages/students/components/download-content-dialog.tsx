import React, { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { create } from 'zustand'
import type { Student } from "../api"
import { formatDate } from "@workspace/flowtrove/components/datatable/lib/format"
import { useMutation } from "@tanstack/react-query"
import { createSingleSupplementRequest } from "../api"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { toast } from "sonner"



interface DownloadContentDialogProps {
    onOpenChange?: (open: boolean) => void;
    templates: { id: string; name: string }[];
}



const DownloadContentDialog: React.FC<DownloadContentDialogProps> = ({ onOpenChange, templates }) => {
    const { openstudentsToDownload, studentToDownload, setDialogState } = useDownloadDialog();
    const [selectedTemplate, setSelectedTemplate] = useState<string>(templates ? templates.length > 0 ? templates[0].id : "" : "");
    const [doccumentName, setDoccumentName] = useState(`${studentToDownload?.first_name} ${studentToDownload?.last_name} - ${studentToDownload?.study_profile_name} - ${studentToDownload?.study_program_name}`);
    const mutation = useMutation({
        mutationFn: createSingleSupplementRequest,
        onSuccess: ({ data }) => {
            console.log(data);
            if (data?.error) {
                console.error("Error creating supplement request:", data.error);
                toast.error("Gabim gjate krijimit te suplementit. Provoni perseri." + data?.message)
            } else {
                window.open(data?.download_url, '_blank');
            }
        },
        onError: (error) => {
            // Handle error (e.g., show a notification)
            console.error("Error creating supplement request:", error);
            toast.error("Gabim gjate krijimit te suplementit. Provoni perseri." + error?.message)
        }
    });

    const handleOpenChange = (open: boolean) => {
        if (onOpenChange) {
            onOpenChange(open);
        }
        setDialogState(open);
    };

    return (
        <Dialog open={openstudentsToDownload} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[725px]">
                <DialogHeader>
                    <DialogTitle>Shkarko Suplementin {studentToDownload?.first_name} {studentToDownload?.last_name}</DialogTitle>
                    <DialogDescription className="display-none"> </DialogDescription>
                </DialogHeader>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="space-y-4">
                        <div className="flex">
                            <span className="font-bold text-gray-800 dark:text-gray-200 min-w-[160px] mr-4">Emri Atësi Mbiemri:</span>
                            <span className="text-gray-900 dark:text-gray-100">{studentToDownload?.full_name || '-'}</span>
                        </div>

                        <div className="flex">
                            <span className="font-bold text-gray-800 dark:text-gray-200 min-w-[160px] mr-4">Fakulteti:</span>
                            <span className="text-gray-900 dark:text-gray-100">{studentToDownload?.faculty_name || '-'}</span>
                        </div>

                        <div className="flex">
                            <span className="font-bold text-gray-800 dark:text-gray-200 min-w-[160px] mr-4">Programi i Studimit:</span>
                            <span className="text-gray-900 dark:text-gray-100">{studentToDownload?.study_program_name || '-'}</span>
                        </div>

                        <div className="flex">
                            <span className="font-bold text-gray-800 dark:text-gray-200 min-w-[160px] mr-4">Profili i Studimit:</span>
                            <span className="text-gray-900 dark:text-gray-100">{studentToDownload?.study_profile_name || '-'}</span>
                        </div>

                        <div className="flex">
                            <span className="font-bold text-gray-800 dark:text-gray-200 min-w-[160px] mr-4">Viti i Diplomimit:</span>
                            <span className="text-gray-900 dark:text-gray-100">{formatDate(studentToDownload?.graduated_at, { month: 'long', day: 'numeric', year: 'numeric' }) || '-'}</span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 pt-4">
                    <div className="grid gap-3">
                        <Label htmlFor="name-1">Emri i Dokumentit</Label>
                        <Input id="name-1" name="name" value={doccumentName} onChange={(e) => setDoccumentName(e.target.value)} />
                    </div>
                </div>
                <div className="grid gap-4 ">
                    <Select onValueChange={(value) => setSelectedTemplate(value)} value={selectedTemplate}>
                        <SelectTrigger className="w-[100%]">
                            <SelectValue placeholder="Zgjith templaten" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {templates?.map((template, i) => (
                                    <SelectItem key={i} value={template?.id}>
                                        {template?.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Anullo</Button>
                    </DialogClose>
                    <Button
                        disabled={mutation.isPending}
                        onClick={() => mutation.mutateAsync({
                            student_id: studentToDownload?.id.toString() || '',
                            document_name: doccumentName,
                            template_id: selectedTemplate
                        })}>{mutation.isPending ? 'Duke shkarkuar...' : 'Shkarko Tani'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}



interface DownloadDialogState {
    openstudentsToDownload: boolean;
    setDialogState: (state: boolean, studentsToDownload?: string[]) => void;
    studentsToDownload?: string[];
    setStudentsToDownload?: (students: string[]) => void;
    studentToDownload?: Student;
    setStudentToDownload: (student: Student) => void;
}

export const useDownloadDialog = create<DownloadDialogState>((set) => ({
    openstudentsToDownload: false,
    setDialogState: (state: boolean, studentsToDownload?: string[]) => set({
        openstudentsToDownload: state,
        studentsToDownload: state ? studentsToDownload ? studentsToDownload : [] : [],
        ...(!state ? { studentToDownload: undefined } : {})
    }),
    studentsToDownload: [],
    setStudentsToDownload: (students: string[]) => set({ studentsToDownload: students }),
    studentToDownload: undefined,
    setStudentToDownload: (student: Student) => set({
        studentToDownload: student
    })
}));





export default DownloadContentDialog;