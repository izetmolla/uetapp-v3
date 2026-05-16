import { type FC } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "../../lib/network"
import I18NextProvider from "./I18NextProvider"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { Toaster } from "@workspace/ui/components/sonner"
import { ThemeProvider } from "./theme-provider"
import { ActiveThemeProvider } from "../active-theme"

interface AppProviderProps {
    children: React.ReactNode
}


const AppProvider: FC<AppProviderProps> = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="system" disableTransitionOnChange>
                <ActiveThemeProvider>
                    <I18NextProvider>
                        <TooltipProvider>
                            {children}
                            <Toaster richColors closeButton />
                        </TooltipProvider>
                    </I18NextProvider>
                </ActiveThemeProvider>
            </ThemeProvider>
        </QueryClientProvider>
    )
}

export default AppProvider
