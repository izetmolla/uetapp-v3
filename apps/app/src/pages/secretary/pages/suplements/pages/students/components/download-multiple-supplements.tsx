import type { Student } from "../api";
import type { Row } from "@tanstack/react-table";
import { useCallback, useState, useRef, useEffect } from "react";
import { createSingleSupplementRequest } from "../api";
import { toast } from "sonner";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";

interface DownloadStatus {
    studentId: string;
    studentName: string;
    status: 'pending' | 'success' | 'failed';
}

const DownloadMultipleSupplements = ({ students, templates }: { students?: Row<Student>[], templates?: { id: string; name: string }[] }) => {
    const [selectedTemplate, setSelectedTemplate] = useState<string>(templates ? templates.length > 0 ? templates[0].id : "" : "");
    const [currentDownloadingStudent, setCurrentDownloadingStudent] = useState<Student>()
    const [isDownloading, setIsDownloading] = useState(false)
    const [downloadStatuses, setDownloadStatuses] = useState<DownloadStatus[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [hasError, setHasError] = useState(false)
    const statusListRef = useRef<HTMLDivElement>(null)




    const processDownloads = useCallback(async (startIndex: number = 0) => {
        if (!students || students.length === 0 || !selectedTemplate) {
            toast.error("Ju lutem zgjidhni studentet dhe templaten");
            return;
        }

        setIsDownloading(true);
        setHasError(false);

        // Initialize download statuses if starting from beginning
        if (startIndex === 0) {
            const initialStatuses: DownloadStatus[] = students.map(row => ({
                studentId: row.original.id.toString(),
                studentName: `${row.original.first_name} ${row.original.last_name}`,
                status: 'pending'
            }));
            setDownloadStatuses(initialStatuses);
        }

        try {
            for (let i = startIndex; i < students.length; i++) {
                const row = students[i];
                const student = row.original;
                setCurrentIndex(i);
                setCurrentDownloadingStudent(student);

                const documentName = `${student.first_name} ${student.last_name} - ${student.study_profile_name} - ${student.study_program_name}`;

                try {
                    // Wait for each download to complete before moving to the next
                    const result = await createSingleSupplementRequest({
                        student_id: student.id.toString(),
                        document_name: documentName,
                        template_id: selectedTemplate
                    });

                    // Wait 2 seconds before proceeding to allow user to see the progress
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    if (result?.data?.error) {
                        console.error("Error creating supplement request:", result.data.error);
                        toast.error(`Gabim gjate krijimit te suplementit per ${student.first_name} ${student.last_name}: ${result.data?.message}`);
                        
                        // Mark as failed
                        setDownloadStatuses(prev => prev.map((status, idx) => 
                            idx === i ? { ...status, status: 'failed' } : status
                        ));
                        setHasError(true);
                        
                        // Stop processing and wait for user to continue
                        setCurrentDownloadingStudent(undefined);
                        setIsDownloading(false);
                        toast.warning(`Shkarkimi u ndal. Klikoni "Vazhdo" per te vazhduar nga ${student.first_name} ${student.last_name}`);
                        return;
                    } else if (result?.data?.download_url) {
                        const downloadWindow = window.open(result.data.download_url, '_blank');
                        
                        if (downloadWindow) {
                            // Wait for the download window/tab to be closed before continuing
                            let windowClosed = false;
                            let timeoutReached = false;
                            
                            await new Promise<void>((resolve) => {
                                const checkClosed = setInterval(() => {
                                    if (downloadWindow.closed) {
                                        windowClosed = true;
                                        clearInterval(checkClosed);
                                        resolve();
                                    }
                                }, 500); // Check every 500ms
                                
                                // Timeout after 60 seconds to prevent infinite waiting
                                setTimeout(() => {
                                    if (!downloadWindow.closed) {
                                        timeoutReached = true;
                                        clearInterval(checkClosed);
                                        toast.warning(`Dritarja e shkarkimit per ${student.first_name} ${student.last_name} nuk u mbyll. Ju lutem mbylleni dritaren para se te vazhdoni.`);
                                        setHasError(true);
                                        setDownloadStatuses(prev => prev.map((status, idx) => 
                                            idx === i ? { ...status, status: 'failed' } : status
                                        ));
                                        setCurrentDownloadingStudent(undefined);
                                        setIsDownloading(false);
                                    }
                                    clearInterval(checkClosed);
                                    resolve();
                                }, 60000);
                            });
                            
                            // Only mark as success if window was actually closed (not timed out)
                            if (windowClosed && !timeoutReached) {
                                setDownloadStatuses(prev => prev.map((status, idx) => 
                                    idx === i ? { ...status, status: 'success' } : status
                                ));
                            } else if (timeoutReached) {
                                // If timeout occurred, stop and wait for user to close the window and continue
                                return;
                            }
                        } else {
                            // If popup was blocked, mark as failed
                            toast.error(`Dritarja e shkarkimit u bllokua per ${student.first_name} ${student.last_name}`);
                            setDownloadStatuses(prev => prev.map((status, idx) => 
                                idx === i ? { ...status, status: 'failed' } : status
                            ));
                            setHasError(true);
                            setCurrentDownloadingStudent(undefined);
                            setIsDownloading(false);
                            return;
                        }
                    }
                } catch (error: any) {
                    console.error("Error creating supplement request:", error);
                    toast.error(`Gabim gjate krijimit te suplementit per ${student.first_name} ${student.last_name}: ${error.message || 'Error i panjohur'}`);
                    
                    // Mark as failed
                    setDownloadStatuses(prev => prev.map((status, idx) => 
                        idx === i ? { ...status, status: 'failed' } : status
                    ));
                    setHasError(true);
                    
                    // Stop processing and wait for user to continue
                    setCurrentDownloadingStudent(undefined);
                    setIsDownloading(false);
                    toast.warning(`Shkarkimi u ndal. Klikoni "Vazhdo" per te vazhduar nga ${student.first_name} ${student.last_name}`);
                    return;
                }
            }

            // All downloads completed successfully
            toast.success("Shkarkimi i te gjithe suplementeve u kompletuar");
            setCurrentDownloadingStudent(undefined);
            setIsDownloading(false);
            setHasError(false);
        } catch (error: any) {
            console.error("Unexpected error during download process:", error);
            toast.error(`Gabim i papritur: ${error.message || 'Error i panjohur'}`);
            setHasError(true);
            setCurrentDownloadingStudent(undefined);
            setIsDownloading(false);
        }
    }, [students, selectedTemplate]);

    const handleDownload = useCallback(() => {
        processDownloads(0);
    }, [processDownloads]);

    const handleContinue = useCallback(() => {
        // Find the first failed or pending item and continue from there
        const nextIndex = downloadStatuses.findIndex(status => 
            status.status === 'failed' || status.status === 'pending'
        );
        if (nextIndex !== -1) {
            processDownloads(nextIndex);
        } else {
            // If no failed items, start from current index
            processDownloads(currentIndex);
        }
    }, [processDownloads, downloadStatuses, currentIndex]);

    // Auto-scroll to keep current item visible
    useEffect(() => {
        if (statusListRef.current && currentIndex >= 0) {
            const currentElement = statusListRef.current.children[currentIndex] as HTMLElement;
            if (currentElement) {
                currentElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }
    }, [currentIndex, downloadStatuses]);

    return (
        <div>
            <h1>Download Multiple Supplements</h1>
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
            {currentDownloadingStudent && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Duke shkarkuar: {currentDownloadingStudent.first_name} {currentDownloadingStudent.last_name}...
                    {downloadStatuses.length > 0 && (
                        <span className="ml-2">
                            ({currentIndex + 1} / {downloadStatuses.length})
                        </span>
                    )}
                </div>
            )}
            
            {downloadStatuses.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-semibold mb-2">Progresi i Shkarkimit:</div>
                    <div ref={statusListRef} className="space-y-1 max-h-40 overflow-y-auto">
                        {downloadStatuses.map((status, idx) => (
                            <div key={status.studentId} className="text-xs flex items-center gap-2 py-1">
                                <span className={`w-2 h-2 rounded-full ${
                                    status.status === 'success' ? 'bg-green-500' :
                                    status.status === 'failed' ? 'bg-red-500' :
                                    'bg-gray-400'
                                }`} />
                                <span className={idx === currentIndex ? 'font-bold' : ''}>
                                    {status.studentName}
                                </span>
                                <span className="text-gray-500">
                                    {status.status === 'success' ? '✓' :
                                     status.status === 'failed' ? '✗' :
                                     '...'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-2 pt-5 justify-end">
                <Button onClick={handleDownload} disabled={isDownloading}>
                    {isDownloading ? 'Duke shkarkuar...' : 'Download'}
                </Button>
                {hasError && (
                    <Button onClick={handleContinue} variant="outline" disabled={isDownloading}>
                        Vazhdo
                    </Button>
                )}
            </div>
        </div>
    )
}

export default DownloadMultipleSupplements;