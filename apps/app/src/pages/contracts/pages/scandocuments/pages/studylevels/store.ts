import { create } from "zustand";
import type { StudyLevelGroup } from "./api";


interface StudyLevelGroupStore {
    studyLevelGroup: StudyLevelGroup | null;
    setStudyLevelGroup: (studyLevelGroup: StudyLevelGroup | null) => void;
    isEditStudyLevelGroupDialogOpen: boolean;
    setIsEditStudyLevelGroupDialogOpen: (isEditStudyLevelGroupDialogOpen: boolean) => void;

}
const useStudyLevelGroupStore = create<StudyLevelGroupStore>((set) => ({
    studyLevelGroup: null,
    setStudyLevelGroup: (studyLevelGroup) => set({ studyLevelGroup }),
    isEditStudyLevelGroupDialogOpen: false,
    setIsEditStudyLevelGroupDialogOpen: (isEditStudyLevelGroupDialogOpen) => set({ isEditStudyLevelGroupDialogOpen }),
}));

export default useStudyLevelGroupStore;