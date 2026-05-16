import { Button } from "@workspace/ui/components/button";
import { Plug, Plus } from "lucide-react";

function EmptyState({ onCreate, hasQuery }: { onCreate: () => void; hasQuery: boolean }) {
    return (
        <div className="glass flex flex-col items-center justify-center rounded-2xl py-24 px-8 text-center animate-fade-in">
            <div className="relative mb-5">
                <div className="absolute inset-0 blur-2xl bg-primary/30" />
                <div className="relative flex size-16 items-center justify-center rounded-2xl border border-border bg-card">
                    <Plug className="size-7 text-primary" />
                </div>
            </div>
            <h3 className="text-lg font-semibold">
                {hasQuery ? "No matching backends" : "No backends yet"}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {hasQuery
                    ? "Try a different search term, or create a new backend."
                    : "Backends represent your server endpoints and workflows. Create your first one to get started."}
            </p>
            <Button onClick={onCreate} className="mt-5 shadow-glow">
                <Plus className="size-4" />
                Create your first backend
            </Button>
        </div>
    );
}

export default EmptyState;