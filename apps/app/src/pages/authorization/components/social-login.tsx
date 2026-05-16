import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { useTranslation } from "react-i18next";

function MicrosoftLogo({ className }: { className?: string }) {
    return (
        <svg
            className={cn("size-[21px] shrink-0", className)}
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="21"
            viewBox="0 0 21 21"
            aria-hidden
        >
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
        </svg>
    );
}

const SocialLogin = () => {
    const { t } = useTranslation("authorization");

    const signInWithMicrosoft = () => {
        window.location.assign("/api/authorization/providers/microsoft");
    };

    return (
        <Button
            type="button"
            variant="outline"
            onClick={signInWithMicrosoft}
            className={cn(
                "h-10 w-full gap-2.5 rounded-md border-[1.5px] border-gray-400 bg-white px-4",
                "text-[15px] font-normal text-[#5e5e5e] shadow-sm",
                "hover:border-gray-500 hover:bg-[#f3f3f3] hover:text-[#5e5e5e]",
                "focus-visible:border-gray-500 focus-visible:ring-2 focus-visible:ring-[#0078d4]/25",
                "active:border-gray-600 active:bg-[#ebebeb] dark:bg-white dark:hover:bg-[#f3f3f3]"
            )}
        >
            <MicrosoftLogo />
            <span>{t("Sign in with Microsoft")}</span>
        </Button>
    );
};

export default SocialLogin;
