import { MoreVertical, Pencil } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import type { StudyLevelGroup } from "../api";
import useStudyLevelGroupStore from "../store";

type GroupRowActionProps = {
    group: StudyLevelGroup;
};

export default function GroupRowAction({ group }: GroupRowActionProps) {
    const { setStudyLevelGroup, setIsEditStudyLevelGroupDialogOpen } = useStudyLevelGroupStore();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Group actions">
                    <MoreVertical className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => {
                        setStudyLevelGroup(group);
                        setIsEditStudyLevelGroupDialogOpen(true);
                    }}
                >
                    <Pencil className="mr-2 size-4" />
                    Edit group
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
