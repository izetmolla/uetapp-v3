

import { Card, CardContent } from "@workspace/ui/components/card";
import useAuthorizationStore from "@workspace/flowtrove/store/authorization";
import { useTranslation } from "react-i18next";

export function WelcomeCard() {
    const { user } = useAuthorizationStore();
    const { t } = useTranslation();
    return (
        <Card className="overflow-hidden">
            <CardContent className="relative">
                <div className="grid items-center pt-6 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <div className="text-3xl font-semibold">
                            {t("Hi")}, {user?.first_name} <span className="text-4xl">👋</span>
                        </div>
                        <div className="text-2xl">{t("Welcome to the uet intranet system")}</div>
                        <div className="text-muted-foreground">
                            {t("This is your dashboard, here you can manage your intranet system.")}
                        </div>
                    </div>
                    <figure className="hidden lg:col-span-1 lg:block">
                        <img
                            width={100}
                            height={50}
                            src={`/static/app/0.0.36/images/academy-dashboard-light.svg`}
                            className="block w-full dark:hidden"
                            alt="shadcn/ui"
                        />
                        <img
                            width={100}
                            height={50}
                            src={`/static/app/0.0.36/images/academy-dashboard-dark.svg`}
                            className="hidden w-full dark:block"
                            alt="shadcn/ui"
                        />
                    </figure>
                    <img
                        width={800}
                        height={300}
                        src={`/static/app/0.0.36/images/star-shape.png`}
                        className="pointer-events-none absolute inset-0 aspect-auto"
                        alt="shadcn/ui"
                    />
                </div>
            </CardContent>
        </Card>
    );
}