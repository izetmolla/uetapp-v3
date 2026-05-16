

const Empty = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="px-4 py-6 text-sm text-muted-foreground text-center">
            {children}
        </div>
    )
}

export default Empty;