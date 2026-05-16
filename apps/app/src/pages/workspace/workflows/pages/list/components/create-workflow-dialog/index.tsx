import { useState } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group";
import { useBackendStore } from "../../../../store/backendStore";
import { type HttpMethod, type TriggerType } from "../../../../types";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];



interface CreateWorkflowModalProps {
    isOpen: boolean;
    onClose: () => void;
}
export function CreateWorkflowModal({ isOpen, onClose }: CreateWorkflowModalProps) {
    const { ws } = useParams();
    const navigate = useNavigate();
    const create = useBackendStore((s) => s.createBackend);
    const [name, setName] = useState("");
    const [method, setMethod] = useState<HttpMethod>("GET");
    const [path, setPath] = useState("");
    const [description, setDescription] = useState("");
    const [trigger, setTrigger] = useState<TriggerType>("rest");

    const reset = () => {
        setName(""); setMethod("GET"); setPath(""); setDescription(""); setTrigger("rest");
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { toast.error("Name is required"); return; }
        const b = create({
            name: name.trim(),
            method,
            path: path.trim() || "/api/untitled",
            description: description.trim(),
            trigger,
        });
        toast.success("Backend created successfully");
        onClose();
        reset();
        navigate(`/workspace/${ws}/backends/${b.id}`);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(o) => { onClose(); if (!o) reset(); }}>
            <DialogContent className="max-w-lg glass border-border">
                <form onSubmit={submit} className="space-y-5">
                    <DialogHeader>
                        <DialogTitle className="text-xl">New Backend</DialogTitle>
                        <DialogDescription>
                            Create a new server endpoint. You can edit the workflow afterwards.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-1.5">
                        <Label htmlFor="b-name">Backend Name</Label>
                        <Input id="b-name" placeholder="e.g. Get User Orders" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                    </div>

                    <div className="space-y-1.5">
                        <Label>HTTP Method</Label>
                        <div className="flex gap-1 rounded-lg border border-border bg-secondary/40 p-1">
                            {METHODS.map((m) => (
                                <button
                                    type="button"
                                    key={m}
                                    onClick={() => setMethod(m)}
                                    className={`flex-1 rounded-md px-2 py-1.5 text-mono text-[11px] uppercase tracking-wider transition-all ${method === m
                                        ? "bg-primary text-primary-foreground shadow-glow"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="b-path">Endpoint Path</Label>
                        <Input id="b-path" className="text-mono" placeholder="/api/v1/..." value={path} onChange={(e) => setPath(e.target.value)} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="b-desc">Description (optional)</Label>
                        <Textarea id="b-desc" rows={3} placeholder="What does this backend do?" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label>Trigger Type</Label>
                        <RadioGroup value={trigger} onValueChange={(v) => setTrigger(v as TriggerType)} className="grid grid-cols-1 gap-2">
                            {[
                                { v: "rest", t: "REST API Call", d: "Triggered by an HTTP request" },
                                { v: "schedule", t: "Scheduled (cron)", d: "Run on a recurring schedule" },
                                { v: "event", t: "On Event", d: "Triggered by an internal event" },
                            ].map((o) => (
                                <label
                                    key={o.v}
                                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all ${trigger === o.v ? "border-primary bg-primary/5" : "border-border hover:bg-accent/40"
                                        }`}
                                >
                                    <RadioGroupItem value={o.v} className="mt-0.5" />
                                    <div>
                                        <div className="text-sm font-medium">{o.t}</div>
                                        <div className="text-xs text-muted-foreground">{o.d}</div>
                                    </div>
                                </label>
                            ))}
                        </RadioGroup>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onClose()}>Cancel</Button>
                        <Button type="submit" className="shadow-glow">Create Backend</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
