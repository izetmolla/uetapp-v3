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

    if (variant === "minimal") {
        return (
            <div className={cn("relative", className)}>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-8 px-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                    <Globe className="w-4 h-4 mr-1" />
                    {currentLanguage.code.split('_')[0].toUpperCase()}
                </Button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                            {languages.map((language) => (
                                <button
                                    key={language.code}
                                    type="button"
                                    onClick={() => handleLanguageChange(language.code)}
                                    className={cn(
                                        "w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2",
                                        language.code === i18n.language && "bg-gray-100 text-gray-900"
                                    )}
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
                    <ChevronDown className="w-3 h-3 ml-1" />
                </Button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                            {languages.map((language) => (
                                <button
                                    key={language.code}
                                    type="button"
                                    onClick={() => handleLanguageChange(language.code)}
                                    className={cn(
                                        "w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2",
                                        language.code === i18n.language && "bg-gray-100 text-gray-900"
                                    )}
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
                className="h-10 px-4 text-sm font-medium bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
                <Globe className="w-4 h-4 mr-2" />
                <span className="mr-1">{currentLanguage.flag}</span>
                {currentLanguage.name}
                <ChevronDown className="w-4 h-4 ml-2" />
            </Button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                        <div className="py-1">
                            {languages.map((language) => (
                                <button
                                    key={language.code}
                                    type="button"
                                    onClick={() => handleLanguageChange(language.code)}
                                    className={cn(
                                        "w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors",
                                        language.code === i18n.language && "bg-gray-100 text-gray-900 font-medium"
                                    )}
                                >
                                    <span className="text-lg">{language.flag}</span>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{language.name}</span>
                                        <span className="text-xs text-gray-500">{language.code}</span>
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