import { cn } from "@workspace/ui/lib/utils"
import { type FC } from "react"


interface LoaderProps {
    fullScreen?: boolean
}
const Loader: FC<LoaderProps> = ({ fullScreen }) => {
    return (
        <div className={cn("flex justify-center items-center", fullScreen ? "min-h-[100vh]" : "")}>
            <span className="relative flex h-5 w-5" aria-hidden>
                <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/35"
                />
                <span
                    className="relative inline-flex h-5 w-5 rounded-full bg-primary ring-1 ring-primary/25"
                />
            </span>
        </div>
    )
}

export default Loader
