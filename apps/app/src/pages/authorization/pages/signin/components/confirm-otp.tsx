import { checkConfirmation, resendConfirmation } from "../api"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useMutation } from "@tanstack/react-query"
import { LoaderCircle, ShieldCheck } from "lucide-react"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { authInputClassName } from "../../../components/styles"
import type { SignInResponseType } from "../api"
import type { Confirmation } from "@workspace/flowtrove/types"

const OTP_LENGTH = 6
const RESEND_SECONDS = 60

export interface ConfirmOtpProps {
    confirmation: Confirmation
    session_id: string
    onVerified: (data: SignInResponseType) => void
    onCancel: () => void
    onConfirmationUpdated?: (confirmation: Confirmation) => void
}

function contactLabel(confirmation: Confirmation): string | null {
    if (confirmation.type === "device" && confirmation.device?.trim()) {
        return confirmation.device.trim()
    }
    if (confirmation.type === "phone" && confirmation.phone?.trim()) {
        return confirmation.phone.trim()
    }
    if (confirmation.type === "email" && confirmation.email?.trim()) {
        return confirmation.email.trim()
    }

    const trimmedEmail = confirmation.email?.trim()
    const trimmedPhone = confirmation.phone?.trim()
    if (trimmedEmail && trimmedPhone) return `${trimmedEmail} · ${trimmedPhone}`
    return trimmedEmail || trimmedPhone || confirmation.device?.trim() || null
}

function sanitizeCode(value: string): string {
    return value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, OTP_LENGTH)
}

function getApiErrorMessage(error: unknown, fallback: string): string {
    const axiosError = error as {
        response?: { data?: { message?: string; error?: { message?: string } } }
        message?: string
    }
    return (
        axiosError.response?.data?.error?.message ??
        axiosError.response?.data?.message ??
        axiosError.message ??
        fallback
    )
}

export default function ConfirmOtp({
    confirmation,
    session_id,
    onVerified,
    onCancel,
    onConfirmationUpdated,
}: ConfirmOtpProps) {
    const { t } = useTranslation("authorization")
    const inputId = useId()
    const hiddenInputRef = useRef<HTMLInputElement>(null)
    const inputRefs = useRef<Array<HTMLInputElement | null>>([])
    const submittedRef = useRef(false)
    const [digits, setDigits] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ""))
    const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)
    const [error, setError] = useState<string | undefined>()

    const destination = contactLabel(confirmation)
    const code = digits.join("")

    const verifyMutation = useMutation({
        mutationFn: (otpCode: string) => checkConfirmation(session_id, otpCode),
        onSuccess: (data) => {
            if (data?.error) {
                submittedRef.current = false
                setError(data.error.message ?? t("Invalid verification code"))
                return
            }
            if (data.confirmation) {
                submittedRef.current = false
                onConfirmationUpdated?.(data.confirmation)
                setError(t("Invalid verification code"))
                return
            }
            onVerified(data)
        },
        onError: (err) => {
            submittedRef.current = false
            setError(getApiErrorMessage(err, t("Invalid verification code")))
        },
    })

    const resendMutation = useMutation({
        mutationFn: () => resendConfirmation(session_id),
        onSuccess: (data) => {
            if (data?.error) {
                setError(data.error.message ?? t("Could not resend code"))
                return
            }
            if (data.confirmation) {
                onConfirmationUpdated?.(data.confirmation)
            }
            setError(undefined)
        },
        onError: (err) => {
            setError(getApiErrorMessage(err, t("Could not resend code")))
        },
    })

    const isSubmitting = verifyMutation.isPending
    const isResending = resendMutation.isPending
    const canResend = secondsLeft === 0 && !isSubmitting && !isResending

    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])

    useEffect(() => {
        if (secondsLeft <= 0) return
        const timer = window.setInterval(() => {
            setSecondsLeft((current) => Math.max(0, current - 1))
        }, 1000)
        return () => window.clearInterval(timer)
    }, [secondsLeft])

    useEffect(() => {
        if (code.length !== OTP_LENGTH || verifyMutation.isPending || submittedRef.current) return
        submittedRef.current = true
        setError(undefined)
        verifyMutation.mutate(code)
    }, [code, verifyMutation.isPending, verifyMutation.mutate])

    useEffect(() => {
        if (!isSubmitting && code.length < OTP_LENGTH) {
            submittedRef.current = false
        }
    }, [isSubmitting, code.length])

    const focusInput = useCallback((index: number) => {
        inputRefs.current[index]?.focus()
    }, [])

    const applyFullCode = useCallback(
        (raw: string) => {
            const cleaned = sanitizeCode(raw)
            const next = Array.from({ length: OTP_LENGTH }, (_, index) => cleaned[index] ?? "")
            setDigits(next)
            focusInput(Math.min(Math.max(cleaned.length - 1, 0), OTP_LENGTH - 1))
        },
        [focusInput],
    )

    const updateDigit = (index: number, raw: string) => {
        setError(undefined)
        const cleaned = sanitizeCode(raw)
        if (cleaned.length > 1) {
            applyFullCode(cleaned)
            return
        }

        const nextChar = cleaned.slice(-1)
        setDigits((current) => {
            const next = [...current]
            next[index] = nextChar
            return next
        })
        if (nextChar && index < OTP_LENGTH - 1) {
            focusInput(index + 1)
        }
    }

    const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Backspace" && !digits[index] && index > 0) {
            focusInput(index - 1)
        }
        if (event.key === "ArrowLeft" && index > 0) {
            event.preventDefault()
            focusInput(index - 1)
        }
        if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
            event.preventDefault()
            focusInput(index + 1)
        }
    }

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault()
        applyFullCode(event.clipboardData.getData("text"))
    }

    const handleResend = () => {
        if (!canResend) return
        submittedRef.current = false
        setDigits(Array.from({ length: OTP_LENGTH }, () => ""))
        setSecondsLeft(RESEND_SECONDS)
        setError(undefined)
        focusInput(0)
        resendMutation.mutate()
    }

    return (
        <div className="space-y-5 text-left">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ShieldCheck className="size-6" strokeWidth={1.5} />
            </div>

            <div className="space-y-2 text-center">
                <h2 className="text-xl font-semibold text-foreground">{t("Confirm code")}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    {confirmation.message?.trim() || t("Enter the 6-digit code we sent to")}
                </p>
                {destination ? (
                    <p className="text-sm font-medium text-foreground">{destination}</p>
                ) : null}
            </div>

            <div className="space-y-2">
                <input
                    ref={hiddenInputRef}
                    type="text"
                    inputMode="text"
                    autoComplete="one-time-code"
                    autoCapitalize="characters"
                    value={code}
                    tabIndex={-1}
                    aria-hidden
                    className="pointer-events-none absolute h-px w-px opacity-0"
                    onChange={(event) => applyFullCode(event.target.value)}
                />

                <div
                    className="relative flex items-center justify-center gap-2"
                    role="group"
                    aria-label={t("Verification code")}
                >
                    {digits.map((digit, index) => (
                        <div key={`${inputId}-${index}`} className="flex items-center gap-2">
                            {index === 3 ? (
                                <span
                                    className="select-none text-lg font-medium text-muted-foreground"
                                    aria-hidden
                                >
                                    -
                                </span>
                            ) : null}
                            <input
                                ref={(node) => {
                                    inputRefs.current[index] = node
                                }}
                                id={`${inputId}-${index}`}
                                type="text"
                                inputMode="text"
                                autoCapitalize="characters"
                                autoComplete={index === 0 ? "one-time-code" : "off"}
                                maxLength={1}
                                value={digit}
                                disabled={isSubmitting || isResending}
                                aria-label={t("Character {{position}} of {{total}}", {
                                    position: index + 1,
                                    total: OTP_LENGTH,
                                })}
                                className={cn(
                                    authInputClassName,
                                    "size-11 px-0 text-center text-lg font-semibold uppercase tracking-widest sm:size-12",
                                )}
                                onChange={(event) => updateDigit(index, event.target.value)}
                                onKeyDown={(event) => handleKeyDown(index, event)}
                                onPaste={handlePaste}
                            />
                        </div>
                    ))}
                </div>

                {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <LoaderCircle className="size-4 animate-spin" />
                        {t("Verifying...")}
                    </div>
                ) : null}

                {error ? (
                    <p className="text-center text-sm text-destructive" role="alert">
                        {error}
                    </p>
                ) : null}
            </div>

            <div className="space-y-3">
                <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full font-normal"
                    disabled={isSubmitting || isResending}
                    onClick={onCancel}
                >
                    {t("Cancel")}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    {canResend ? (
                        <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-sm font-normal"
                            disabled={isResending}
                            onClick={handleResend}
                        >
                            {isResending ? (
                                <>
                                    <LoaderCircle className="mr-1 size-3 animate-spin" />
                                    {t("Sending...")}
                                </>
                            ) : (
                                t("Resend code")
                            )}
                        </Button>
                    ) : (
                        <span>
                            {t("Resend code in {{seconds}}s", { seconds: secondsLeft })}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
