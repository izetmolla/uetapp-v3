import { Button } from "@workspace/ui/components/button"
import { LoaderCircle, MonitorSmartphone } from "lucide-react"
import { useTranslation } from "react-i18next"

export interface TrustDeviceProps {
    onTrust: () => void
    onSkip: () => void
    isCompleting?: boolean
}

export default function TrustDevice({ onTrust, onSkip, isCompleting = false }: TrustDeviceProps) {
    const { t } = useTranslation("authorization")

    if (isCompleting) {
        return (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
                <LoaderCircle className="size-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t("Signing you in...")}</p>
            </div>
        )
    }

    return (
        <div className="space-y-5 text-left">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <MonitorSmartphone className="size-6" strokeWidth={1.5} />
            </div>

            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                    {t("Trust this device?")}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(
                        "If you trust this device, you can pick this account next time without entering your password again.",
                    )}
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <Button
                    type="button"
                    className="h-10 w-full rounded-md border border-transparent bg-gradient-brand text-base font-normal text-white shadow-brand-glow transition-opacity hover:opacity-90"
                    onClick={onTrust}
                >
                    {t("Yes, trust this device")}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full font-normal"
                    onClick={onSkip}
                >
                    {t("Not now")}
                </Button>
            </div>
        </div>
    )
}
