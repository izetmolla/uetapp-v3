import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import SocialLogin from "../../components/social-login";
import { useMutation } from "@tanstack/react-query";
import { checkTrustedDevice, signIn } from "./api";
import { toast } from "@workspace/ui/components/sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInSchema } from "./api/validations";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import useAuthorizationStore, {
    sessionCanResume,
} from "@workspace/flowtrove/store/authorization";
import type { AuthSession } from "@workspace/flowtrove/store/authorization";
import PasswordInput from "@workspace/flowtrove/components/password";
import Links from "../../components/links";
import { useTranslation } from "react-i18next";
import LanguageSwitch from "@workspace/flowtrove/components/language-switch";
import Sessions, { userLoginId } from "./components/sessions";
import TrustDevice from "./components/trust-device";
import ConfirmOtp from "./components/confirm-otp";
import type { SignInResponseType } from "./api";
import type { Confirmation } from "@workspace/flowtrove/types";
import {
    authCardClassName,
    authInputClassName,
    authLinkClassName,
    authPageClassName,
    authSeparatorClassName,
    authSeparatorLabelClassName,
    authSeparatorLineClassName,
} from "../../components/styles";

/** When true, email and password are shown together for direct sign-in. When false, email is checked first. */
const show2fields = true;

type SignInView = "picker" | "form" | "trust" | "otp";

const FlowTroveLogo = ({ className }: { className?: string }) => {
    const navigate = useNavigate();
    return (
        <div className={cn("flex items-center gap-3 cursor-pointer", className)} onClick={() => navigate("/")}>
            <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">U</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-500 rounded-lg blur-sm opacity-50 -z-10"></div>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">UET App</span>
        </div>
    )
};

const SignIn = () => {
    const { t } = useTranslation('authorization');
    const [searchParams] = useSearchParams();
    const redirectUrl = useMemo(() => searchParams.get("redirectUrl"), [searchParams]);
    const navigate = useNavigate();

    const { signInUser, sessions, setCurrentSession, setSessionTrusted } =
        useAuthorizationStore()
    const [view, setView] = useState<SignInView>(() => (sessions.length > 0 ? "picker" : "form"));
    const [emailDisabled, setEmailDisabled] = useState(false);
    const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
    const [pendingConfirmation, setPendingConfirmation] = useState<Confirmation | null>(null);
    const [otpError, setOtpError] = useState<string | undefined>();
    const [isCompletingSignIn, setIsCompletingSignIn] = useState(false);

    const form = useForm<SignInSchema>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
            checkEmail: !show2fields,
        }
    })
    const [showPassword, setShowPassword] = useState(show2fields);
    const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (sessions.length === 0 && view === "picker") {
            setView("form");
        }
    }, [sessions.length, view]);

    useEffect(() => {
        if (!showPassword || show2fields) return;
        const timer = window.setTimeout(() => {
            passwordInputRef.current?.focus();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [showPassword]);

    useEffect(() => {
        if (view !== "form" || !emailDisabled) return;
        const timer = window.setTimeout(() => {
            passwordInputRef.current?.focus();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [view, emailDisabled]);

    const resetFormState = () => {
        form.reset({ email: "", password: "", checkEmail: !show2fields });
        setConfirmedEmail(null);
        setEmailDisabled(false);
        setShowPassword(show2fields);
    };

    const completeRedirect = () => {
        setIsCompletingSignIn(true);
        if (redirectUrl) {
            window.location.replace(redirectUrl)
        } else {
            navigate("/", { replace: true })
        }
    };

    const completeSignInAfterAuth = (data: SignInResponseType) => {
        const session_id = data.session_id
        signInUser({
            user: data.user,
            tokens: data.tokens,
            session_id,
        })
        if (session_id) {
            const existing = useAuthorizationStore
                .getState()
                .sessions.find((s) => s.id === session_id)
            if (existing?.trusted) {
                completeRedirect()
            } else {
                setPendingSessionId(session_id)
                setView("trust")
            }
        } else {
            completeRedirect()
        }
    }

    const handleSignInResponse = (data: SignInResponseType) => {
        if (data.confirmation) {
            setPendingConfirmation(data.confirmation)
            setPendingSessionId(data.session_id ?? null)
            setOtpError(undefined)
            setView("otp")
            return
        }
        completeSignInAfterAuth(data)
    }

    const openPasswordForm = (session: AuthSession) => {
        const loginId = userLoginId(session.user)
        form.setValue("email", loginId);
        form.setValue("password", "");
        form.setValue("checkEmail", false);
        form.clearErrors();
        setConfirmedEmail(loginId);
        setEmailDisabled(true);
        setShowPassword(true);
        setView("form");
    };

    const resumeTrustedSession = useMutation({
        mutationFn: (session_id: string) => checkTrustedDevice(session_id),
        onSuccess: (data, session_id) => {
            if (data?.error) {
                useAuthorizationStore.setState({
                    current_session: "",
                    user: undefined,
                    tokens: undefined,
                    isSignedIn: false,
                });
                toast.error(data.error.message ?? t("Session expired. Please sign in again."));
                const session = useAuthorizationStore
                    .getState()
                    .sessions.find((s) => s.id === session_id);
                if (session) openPasswordForm(session);
                return;
            }

            if (data.confirmation) {
                handleSignInResponse(data);
                return;
            }

            const resolvedSessionId = data.session_id ?? session_id;
            if (data.user && data.tokens) {
                signInUser({
                    user: data.user,
                    tokens: data.tokens,
                    session_id: resolvedSessionId,
                });
            } else {
                setCurrentSession(resolvedSessionId);
            }
            completeRedirect();
        },
        onError: (_error, session_id) => {
            useAuthorizationStore.setState({
                current_session: "",
                user: undefined,
                tokens: undefined,
                isSignedIn: false,
            });
            toast.error(t("Session expired. Please sign in again."));
            const session = useAuthorizationStore
                .getState()
                .sessions.find((s) => s.id === session_id);
            if (session) openPasswordForm(session);
        },
    });

    const handleSelectSession = (session: AuthSession) => {
        if (sessionCanResume(session)) {
            setCurrentSession(session.id);
            resumeTrustedSession.mutate(session.id);
            return;
        }

        openPasswordForm(session);
    };

    const handleUseAnotherAccount = () => {
        resetFormState();
        setView("form");
    };

    const handleBackToPicker = () => {
        resetFormState();
        setPendingSessionId(null);
        setPendingConfirmation(null);
        setOtpError(undefined);
        setView("picker");
    };

    const handleBackFromOtp = () => {
        setPendingConfirmation(null);
        setPendingSessionId(null);
        setOtpError(undefined);
        setView(sessions.length > 0 ? "picker" : "form");
    };

    const handleOtpConfirm = (_code: string) => {
        // OTP verify API to be wired here
    };

    const handleOtpResend = () => {
        // OTP resend API to be wired here
    };

    const handleTrustDevice = () => {
        if (pendingSessionId) {
            setSessionTrusted(pendingSessionId, true);
        }
        completeRedirect();
    };

    const handleSkipTrustDevice = () => {
        completeRedirect();
    };

    const mutation = useMutation({
        mutationFn: signIn,
        onSuccess: (data) => {
            if (data?.error) {
                if (data?.error?.field != "") {
                    form.setError(t(data.error.field as string) as "email" | "password" | "checkEmail", { message: data.error.message })
                } else {
                    toast.error(data.error.message);
                }
            } else {
                if (form.getValues("checkEmail")) {
                    const email = form.getValues("email");
                    setConfirmedEmail(email);
                    setShowPassword(true);
                    form.setValue("password", "");
                    form.setValue("checkEmail", false);
                } else {
                    handleSignInResponse(data)
                }
            }
        },
        onError: (error: any) => {
            console.log(error);
            if (error?.response?.data?.error && error?.response?.data?.message) {
                if (error?.response?.data?.details?.field === 'password') {
                    form.setError('password', { message: t(error.response?.data.message as string) })
                } else {
                    form.setError('email', { message: t(error?.response.data.message as string) })
                }
            } else {
                toast.error(t("Internal Server Error: !"), {
                    richColors: true,
                    description: t(error?.message as string),
                    position: 'bottom-right',
                    duration: 5000,
                    action: {
                        label: t("Close"),
                        onClick: () => {
                            toast.dismiss()
                        }
                    }
                })
            }
        }
    })

    const onsubmit = (data: SignInSchema) => {
        mutation.mutate({
            ...form.getValues(),
            ...data,
            checkEmail: show2fields ? false : data.checkEmail,
        })
    }

    const showOtp = view === "otp" && pendingConfirmation !== null;
    const showPicker = view === "picker" && sessions.length > 0 && !isCompletingSignIn && !showOtp;
    const showTrust = (view === "trust" && pendingSessionId !== null) || (isCompletingSignIn && !showOtp);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onsubmit)}>
                <div className="min-h-screen">
                    <div className={authPageClassName}>
                        <div className={authCardClassName}>
                            <div className="space-y-3">
                                <div className="flex items-start justify-between mb-6">
                                    <FlowTroveLogo />
                                    <LanguageSwitch variant="minimal" />
                                </div>

                                {showOtp ? (
                                    <ConfirmOtp
                                        confirmation={pendingConfirmation}
                                        onConfirm={handleOtpConfirm}
                                        onResend={handleOtpResend}
                                        onCancel={handleBackFromOtp}
                                        error={otpError}
                                    />
                                ) : showTrust ? (
                                    <TrustDevice
                                        onTrust={handleTrustDevice}
                                        onSkip={handleSkipTrustDevice}
                                        isCompleting={isCompletingSignIn}
                                    />
                                ) : showPicker ? (
                                    <Sessions
                                        sessions={sessions}
                                        onSelectSession={handleSelectSession}
                                        onUseAnotherAccount={handleUseAnotherAccount}
                                        resumingSessionId={
                                            resumeTrustedSession.isPending
                                                ? resumeTrustedSession.variables
                                                : null
                                        }
                                    />
                                ) : (
                                    <>
                                        {sessions.length > 0 ? (
                                            <button
                                                type="button"
                                                className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                                onClick={handleBackToPicker}
                                            >
                                                <ArrowLeft className="size-4" />
                                                {t("Back")}
                                            </button>
                                        ) : null}

                                        <div className="text-left space-y-2">
                                            <h1 className="text-xl font-semibold text-foreground">
                                                {emailDisabled ? t("Enter password") : t('Log in')}
                                            </h1>
                                            {!emailDisabled ? (
                                                <p className="text-base font-normal text-muted-foreground">
                                                    {t("Continue to UET App")}
                                                </p>
                                            ) : null}
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="sr-only">{t("Email")}</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            className={authInputClassName}
                                                            placeholder={t("Email")}
                                                            autoComplete="email"
                                                            disabled={emailDisabled}
                                                            {...field}
                                                            onChange={(event) => {
                                                                field.onChange(event);
                                                                if (
                                                                    !show2fields &&
                                                                    showPassword &&
                                                                    confirmedEmail !== null &&
                                                                    event.target.value !== confirmedEmail
                                                                ) {
                                                                    setShowPassword(false);
                                                                    setConfirmedEmail(null);
                                                                    form.setValue("checkEmail", true);
                                                                    form.setValue("password", "");
                                                                    form.clearErrors("password");
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {(show2fields || showPassword) && (
                                            <FormField
                                                control={form.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem className='space-y-1'>
                                                        <FormLabel className="sr-only">{t("Password")}</FormLabel>
                                                        <FormControl>
                                                            <PasswordInput
                                                                className={authInputClassName}
                                                                placeholder={t("Password")}
                                                                autoComplete="current-password"
                                                                data-form-type="other"
                                                                spellCheck="false"
                                                                {...field}
                                                                ref={(node) => {
                                                                    field.ref(node);
                                                                    passwordInputRef.current = node;
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        {(show2fields || showPassword) && (
                                            <div className="flex justify-end">
                                                <Link
                                                    to={`/reset-password?email=${encodeURIComponent(form.getValues("email"))}`}
                                                    className={authLinkClassName}
                                                >
                                                    {t("Forgot password?")}
                                                </Link>
                                            </div>
                                        )}

                                        <Button
                                            className="h-10 w-full rounded-md border border-transparent bg-gradient-brand text-base font-normal text-white shadow-brand-glow transition-opacity hover:opacity-90"
                                            disabled={mutation.isPending}
                                            type="submit"
                                        >
                                            {mutation.isPending && <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />}
                                            {show2fields || showPassword ? t("Sign in") : t("Continue with email")}
                                        </Button>

                                        <div className={authSeparatorClassName}>
                                            <div className={authSeparatorLineClassName} />
                                            <span className={authSeparatorLabelClassName}>{t("or")}</span>
                                            <div className={authSeparatorLineClassName} />
                                        </div>
                                        <SocialLogin />
                                    </>
                                )}

                                <Links />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
};

export default SignIn;
