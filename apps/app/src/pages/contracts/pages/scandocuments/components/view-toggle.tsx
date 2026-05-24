import { Switch } from "@workspace/ui/components/switch";
import { Label } from "@workspace/ui/components/label";
import { useTranslation } from "react-i18next";

interface ViewToggleProps {
  list: boolean;
  onChange: (list: boolean) => void;
  id?: string;
}

export function ViewToggle({ list, onChange, id = "view" }: ViewToggleProps) {
  const { t } = useTranslation("contracts");

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {list ? t("List") : t("Grid")} {t("View")}
      </Label>
      <Switch id={id} checked={list} onCheckedChange={onChange} />
    </div>
  );
}
