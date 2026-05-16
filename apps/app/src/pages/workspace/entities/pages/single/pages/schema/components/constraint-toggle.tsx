import { Checkbox } from "@workspace/ui/components/checkbox";

function ConstraintToggle({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />
            <span>{label}</span>
        </label>
    );
}


export default ConstraintToggle;