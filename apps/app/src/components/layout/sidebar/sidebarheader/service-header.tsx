
import Logo from "../../logo";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@workspace/ui/components/sidebar";
import { useNavigate } from "react-router";
import { type FC } from "react";


interface ServiceHeaderProps {
    service: {
        title: string;
        description: string;
        name: string;
    };
}
const ServiceHeader: FC<ServiceHeaderProps> = ({ service }) => {
    const navigate = useNavigate();
    const stopLogoEvent = (e: React.MouseEvent<HTMLImageElement> | React.PointerEvent<HTMLImageElement>) => {
        e.stopPropagation();
    };


    const onLogoClick = (e: React.MouseEvent<HTMLImageElement>) => {
        stopLogoEvent(e);
        navigate("/");
    };

    const onTitleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        navigate(`/${service.name}`);
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    className="hover:text-foreground h-(--header-height) items-center gap-3 rounded-lg px-2 py-2 group-data-[collapsible=icon]:px-0! cursor-pointer"
                >
                    <Logo onClick={onLogoClick} onPointerDown={stopLogoEvent} />
                    <div className="min-w-0 space-y-0.5 leading-tight group-data-[collapsible=icon]:hidden cursor-pointer" onClick={onTitleClick}>
                        <p className="text-foreground truncate text-sm font-semibold">
                            {service.title || "UET App Workspace"}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                            {service.description || "Your university management system"}
                        </p>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

export default ServiceHeader;