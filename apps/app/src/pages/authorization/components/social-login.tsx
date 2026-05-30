import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { useTranslation } from "react-i18next";
import { authSocialButtonClassName } from "./styles";

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
        // window.location.href = `/api/authorization/providers/microsoft`; to be on future
        window.location.href = `/api/auth/azureadv2`
    };

    return (
        <Button
            type="button"
            variant="outline"
            onClick={signInWithMicrosoft}
            className={authSocialButtonClassName}
        >
            <MicrosoftLogo />
            <span>{t("Sign in with Microsoft")}</span>
        </Button>
    );
};

export default SocialLogin;
