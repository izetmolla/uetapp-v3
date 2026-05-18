import type { FC, ReactNode } from "react";
import { Separator } from "@workspace/ui/components/separator";

interface FormSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
    showSeparator?: boolean;
}

const FormSection: FC<FormSectionProps> = ({ title, description, children, showSeparator = true }) => (
    <section className="space-y-4">
        {showSeparator ? <Separator /> : null}
        <div className="space-y-1">
            <h3 className="text-sm font-medium leading-none">{title}</h3>
            {description ? (
                <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
            ) : null}
        </div>
        {children}
    </section>
);

export default FormSection;
