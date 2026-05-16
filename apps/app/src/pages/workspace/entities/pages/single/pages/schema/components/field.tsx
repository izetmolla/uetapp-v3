

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">{label}</label>
            {children}
        </div>
    );
}

export default Field;