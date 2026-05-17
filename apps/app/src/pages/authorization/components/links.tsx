import { Link } from "react-router";
import { cn } from "@workspace/ui/lib/utils";
import { authLinkClassName } from "./styles";

const footerLinkClassName = cn(
    authLinkClassName,
    "text-muted-foreground hover:text-foreground",
);

const Links = () => {
    return (
        <div className="flex justify-start gap-6 text-sm">
            <Link to="#" className={footerLinkClassName}>Help</Link>
            <Link to="#" className={footerLinkClassName}>Privacy</Link>
            <Link to="#" className={footerLinkClassName}>Terms</Link>
        </div>
    )
}

export default Links;
