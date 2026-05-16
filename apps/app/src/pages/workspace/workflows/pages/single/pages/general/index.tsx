import { useEffect, useState } from "react";
import { ArrowLeft, Rocket, Save, Settings, Share2, Loader2 } from "lucide-react";
import { useBackendStore } from "../../../../store/backendStore";
import { NodeLibrarySidebar } from "./components/node-library-sidebar";
import { NodeConfigPanel } from "./components/node-config-panel";
import { FlowCanvas } from "./components/flow-canvas";
import { Button } from "@workspace/ui/components/button";
import { methodColor } from "../../../../lib/backend-format";
import { toast } from "sonner";
import { Link, useNavigate, useParams } from "react-router";



function BackendEditorPage() {
    const { ws, backend_id } = useParams();
    const navigate = useNavigate();
    const backend = useBackendStore((s) => (backend_id ? s.getBackend(backend_id) : undefined));
    const rename = useBackendStore((s) => s.renameBackend);
    const selectedNodeId = useBackendStore((s) => s.ui.selectedNodeId);
    const setSelected = useBackendStore((s) => s.setSelectedNode);

    useEffect(() => {
        setSelected(null);
    }, [backend_id, setSelected]);

    const [editingName, setEditingName] = useState(false);
    const [name, setName] = useState(backend?.name ?? "");
    const [saving, setSaving] = useState(false);

    useEffect(() => { setName(backend?.name ?? ""); }, [backend?.name]);

    if (!backend_id || !backend) {
        return (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-16">
                <div className="text-center">
                    <p className="text-muted-foreground">Backend not found.</p>
                    <Button onClick={() => navigate(`/workspace/${ws}/backends`)} className="mt-3">
                        Back to list
                    </Button>
                </div>
            </div>
        );
    }

    const selectedNode = selectedNodeId ? backend.nodes.find((n) => n.id === selectedNodeId) : null;

    const onSave = () => {
        setSaving(true);
        setTimeout(() => { setSaving(false); toast.success("Saved"); }, 600);
    };

    const onDeploy = () => {
        toast.success("Deployed", { description: `${backend.name} is live.` });
    };

    return (
        <div className="flex min-h-0 min-w-0 max-h-full flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            {/* Top bar */}
            <header className="glass z-30 flex h-12 min-h-12 min-w-0 shrink-0 items-center gap-2 border-b border-border px-2 sm:gap-3 sm:px-3">
                <Link
                    to={ws ? `/workspace/${ws}/backends` : "/workspace"}
                    onClick={() => setSelected(null)}
                    className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="size-3.5 shrink-0" />
                    <span className="hidden sm:inline">Backend List</span>
                </Link>
                <div className="hidden h-5 w-px shrink-0 bg-border sm:block" />

                <div className="min-w-0 flex-1">
                {editingName ? (
                    <input
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => { rename(backend.id, name || backend.name); setEditingName(false); }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") { rename(backend.id, name || backend.name); setEditingName(false); }
                            if (e.key === "Escape") { setName(backend.name); setEditingName(false); }
                        }}
                        className="max-w-full rounded-md border border-primary bg-background px-2 py-1 text-sm font-medium outline-none"
                    />
                ) : (
                    <button
                        onClick={() => setEditingName(true)}
                        className="max-w-full truncate rounded-md px-2 py-1 text-left text-sm font-medium hover:bg-accent transition-colors"
                    >
                        {backend.name}
                    </button>
                )}
                </div>

                <span className={`hidden shrink-0 text-mono text-[10px] uppercase tracking-wider rounded-md border px-2 py-0.5 md:inline-flex ${methodColor(backend.method)}`}>
                    {backend.method}
                </span>
                <span className="hidden min-w-0 max-w-[200px] truncate text-mono text-[11px] text-muted-foreground lg:inline xl:max-w-[320px]">
                    {backend.path}
                </span>

                <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
                    <Button variant="ghost" size="icon" className="size-8">
                        <Share2 className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8">
                        <Settings className="size-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={onSave} disabled={saving} className="h-8">
                        {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                        Save
                    </Button>
                    <Button size="sm" onClick={onDeploy} className="h-8 shadow-glow">
                        <Rocket className="size-3.5" />
                        Deploy
                    </Button>
                </div>
            </header>

            {/* Body */}
            <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
                <NodeLibrarySidebar />
                <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
                    <FlowCanvas backend={backend} />
                </div>
                {selectedNode && selectedNode.type !== "group" && selectedNode.data.kind && (
                    <NodeConfigPanel
                        backendId={backend.id}
                        node={selectedNode}
                        onClose={() => setSelected(null)}
                    />
                )}
            </div>
        </div>
    );
}



export default BackendEditorPage; 