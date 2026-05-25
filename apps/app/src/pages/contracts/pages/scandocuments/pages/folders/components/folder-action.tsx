import {
    Download,
    MoreVertical,
    Pencil,
    Trash2,
    UserPlus,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import type { Folder } from "../api";
import useFoldersStore from "../store";
import { useCallback } from "react";

export type FolderActionProps = {
    folder: Folder;
    onQuickEdit?: (folder: Folder) => void;
    onAddStudentToScan?: (folder: Folder) => void;
    onDownload?: (folder: Folder) => void;
    onDelete?: (folder: Folder) => void;
};

const FolderAction = ({
    folder,
    onQuickEdit,
    onAddStudentToScan,
    onDownload,
    onDelete,
}: FolderActionProps) => {
    const {
        setFolder,
        setIsSaveFolderDialogOpen,
        setIsAddStudentToScanDialogOpen,
        setIsDeleteFolderDialogOpen,
        setIsDownloadDialogOpen,
    } = useFoldersStore();


    const handleQuickEdit = useCallback(() => {
        setFolder(folder);
        setIsSaveFolderDialogOpen(true);
        onQuickEdit?.(folder);
    }, [folder, setFolder, setIsSaveFolderDialogOpen]);

    const handleDelete = useCallback(() => {
        setFolder(folder);
        setIsDeleteFolderDialogOpen(true);
        onDelete?.(folder);
    }, [folder, setFolder, setIsDeleteFolderDialogOpen]);

    const handleDownload = useCallback(() => {
        setFolder(folder);
        setIsDownloadDialogOpen(true);
        onDownload?.(folder);
    }, [folder, setFolder, setIsDownloadDialogOpen]);

    const handleAddStudentToScan = useCallback(() => {
        setFolder(folder);
        setIsAddStudentToScanDialogOpen(true);
        onAddStudentToScan?.(folder);
    }, [folder, setFolder, setIsAddStudentToScanDialogOpen]);


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    aria-label={`Actions for ${folder.name}`}
                    variant="ghost"
                    className="size-8 p-0 data-[state=open]:bg-muted"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreVertical className="size-4" aria-hidden />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onSelect={handleQuickEdit} className="cursor-pointer">
                    <Pencil className="size-4 opacity-70" aria-hidden />
                    Quick Edit
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleAddStudentToScan} className="cursor-pointer">
                    <UserPlus className="size-4 opacity-70" aria-hidden />
                    Add student to scan
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleDownload} className="cursor-pointer">
                    <Download className="size-4 opacity-70" aria-hidden />
                    Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    variant="destructive"
                    onSelect={handleDelete}
                    className="cursor-pointer"
                >
                    <Trash2 className="size-4" aria-hidden />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default FolderAction;
