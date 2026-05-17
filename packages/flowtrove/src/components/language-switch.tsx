import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { ChevronDown, Globe } from "lucide-react";

// Language configuration with display names and flags
const languages = [
    { code: "en_US", name: "English", flag: "🇺🇸" },
    { code: "de_DE", name: "Deutsch", flag: "🇩🇪" },
    { code: "fr_FR", name: "Français", flag: "🇫🇷" },
    { code: "it_IT", name: "Italiano", flag: "🇮🇹" },
    { code: "sq_AL", name: "Shqip", flag: "🇦🇱" },
];

const dropdownPanelClassName =
    "absolute right-0 top-full z-20 rounded-md border border-border bg-popover text-popover-foreground shadow-lg";

const dropdownItemClassName = (isActive: boolean) =>
    cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent font-medium text-accent-foreground"
    );

interface LanguageSwitchProps {
    className?: string;
    variant?: "default" | "compact" | "minimal";
}

const LanguageSwitch: React.FC<LanguageSwitchProps> = ({
    className,
    variant = "default"
}) => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    const handleLanguageChange = (languageCode: string) => {
        i18n.changeLanguage(languageCode);
        setIsOpen(false);
    };

    const backdrop = isOpen ? (
        <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
        />
    ) : null;

    if (variant === "minimal") {
        return (
            <div className={cn("relative", className)}>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-8 px-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                    <Globe className="mr-1 h-4 w-4" />
                    {currentLanguage.code.split('_')[0].toUpperCase()}
                </Button>

                {isOpen && (
                    <>
                        {backdrop}
                        <div className={cn(dropdownPanelClassName, "mt-1 w-48")}>
                            {languages.map((language) => (
                                <button
                                    key={language.code}
                                    type="button"
                                    onClick={() => handleLanguageChange(language.code)}
                                    className={dropdownItemClassName(language.code === i18n.language)}
                                >
                                    <span className="text-base">{language.flag}</span>
                                    <span>{language.name}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    }

    if (variant === "compact") {
        return (
            <div className={cn("relative", className)}>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-8 px-3 text-sm"
                >
                    <span className="mr-1">{currentLanguage.flag}</span>
                    {currentLanguage.name}
                    <ChevronDown className="ml-1 h-3 w-3" />
                </Button>

                {isOpen && (
                    <>
                        {backdrop}
                        <div className={cn(dropdownPanelClassName, "mt-1 w-48")}>
                            {languages.map((language) => (
                                <button
                                    key={language.code}
                                    type="button"
                                    onClick={() => handleLanguageChange(language.code)}
                                    className={dropdownItemClassName(language.code === i18n.language)}
                                >
                                    <span className="text-base">{language.flag}</span>
                                    <span>{language.name}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Default variant
    return (
        <div className={cn("relative", className)}>
            <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 px-4 text-sm font-medium"
            >
                <Globe className="mr-2 h-4 w-4" />
                <span className="mr-1">{currentLanguage.flag}</span>
                {currentLanguage.name}
                <ChevronDown className="ml-2 h-4 w-4" />
            </Button>

            {isOpen && (
                <>
                    {backdrop}
                    <div className={cn(dropdownPanelClassName, "mt-2 w-56 rounded-lg shadow-xl")}>
                        <div className="py-1">
                            {languages.map((language) => (
                                <button
                                    key={language.code}
                                    type="button"
                                    onClick={() => handleLanguageChange(language.code)}
                                    className={cn(
                                        dropdownItemClassName(language.code === i18n.language),
                                        "gap-3 px-4 py-3"
                                    )}
                                >
                                    <span className="text-lg">{language.flag}</span>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{language.name}</span>
                                        <span className="text-xs text-muted-foreground">{language.code}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LanguageSwitch;
