import * as React from "react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Eye, EyeOff } from "lucide-react"

interface PasswordInputProps extends Omit<React.ComponentProps<"input">, 'type'> {
    showVisibilityToggle?: boolean
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, showVisibilityToggle = true, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false)
        const [inputId] = React.useState(() => `password-${Math.random().toString(36).substr(2, 9)}`)

        const togglePasswordVisibility = () => {
            setShowPassword(!showPassword)
        }

        return (
            <div className="relative">
                <Input
                    ref={ref}
                    id={inputId}
                    type={showPassword ? "text" : "password"}
                    autoComplete="off"
                    data-form-type="other"
                    spellCheck="false"
                    className={cn(
                        showVisibilityToggle && "pr-10", // Add right padding when icon is shown
                        className
                    )}
                    {...props}
                />
                {showVisibilityToggle && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "absolute right-2 top-1/2 z-10 h-6 w-6 -translate-y-1/2 text-muted-foreground hover:text-foreground active:!-translate-y-1/2"
                        )}
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </Button>
                )}
            </div>
        )
    }
)

PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
export default PasswordInput