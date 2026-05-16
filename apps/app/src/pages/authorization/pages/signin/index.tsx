import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import SocialLogin from "../../components/social-login";
import { useMutation } from "@tanstack/react-query";
import { signIn } from "./api";
import { toast } from "@workspace/ui/components/sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInSchema } from "./api/validations";
import { useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import useAuthorizationStore from "@workspace/flowtrove/store/authorization";
import PasswordInput from "@workspace/flowtrove/components/password";
import Links from "../../components/links";
import { useTranslation } from "react-i18next";
import LanguageSwitch from "@workspace/flowtrove/components/language-switch";

// Enhanced FlowTrove Logo Component
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
            <span className="text-xl font-bold text-gray-900 tracking-tight">UET App</span>
        </div>
    )
};

const authInputClassName = cn(
    "h-10 w-full rounded-md border-[1.5px] border-gray-300 bg-white px-3",
    "text-sm text-gray-900 shadow-sm placeholder:text-gray-400",
    "transition-[border-color,box-shadow] duration-150",
    "hover:border-gray-400",
    "focus-visible:border-gray-500 focus-visible:ring-2 focus-visible:ring-gray-200/80",
    "disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:opacity-60",
);

const SignIn = () => {
    const { t } = useTranslation('authorization');
    const [searchParams] = useSearchParams();
    const redirectUrl = useMemo(() => searchParams.get("redirectUrl"), [searchParams]);
    const navigate = useNavigate();

    // const navigate = useNavigate()
    const { signInUser } = useAuthorizationStore()
    const form = useForm<SignInSchema>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
            checkEmail: true
        }
    })
    // const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!showPassword) return;
        const timer = window.setTimeout(() => {
            passwordInputRef.current?.focus();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [showPassword]);

    const mutation = useMutation({
        mutationFn: signIn,
        onSuccess: ({ data }) => {
            if (data?.error) {
                if (data?.error?.field != "") {
                    form.setError(t(data.error.field as string) as "email" | "password" | "checkEmail", { message: data.error.message })
                } else {
                    toast.error(data.error.message);
                }
            } else {
                if (form.getValues("checkEmail")) {
                    setShowPassword(true);
                    form.setValue("password", "");
                    form.setValue("checkEmail", false);
                } else {
                    signInUser({ user: data.user, tokens: data.tokens })
                    if (redirectUrl) {
                        window.location.replace(redirectUrl ?? "/")
                    } else {
                        navigate("/", { replace: true })
                    }
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
        mutation.mutate({ ...form.getValues(), ...data })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onsubmit)}>
                <div className="min-h-screen">
                    {/* Background */}
                    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-login">
                        {/* Container - 400px width, 32px padding, 12px border radius, responsive shadow */}
                        <div className="w-full max-w-[450px] rounded-[12px] border border-gray-200 bg-white p-8 shadow-2xl">
                            <div className="space-y-3">
                                {/* Header with Logo and Language Switch */}
                                <div className="flex items-start justify-between mb-6">
                                    <FlowTroveLogo />
                                    <LanguageSwitch variant="minimal" />
                                </div>

                                {/* Login Header - Dark text for white background */}
                                <div className="text-left space-y-2">
                                    <h1 className="text-xl font-semibold text-gray-900">{t('Log in')}</h1>
                                    <p className="text-base font-normal text-gray-600">{t("Continue to UET App")}</p>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className='space-y-1'>
                                            <FormLabel className="sr-only">{t("Email")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className={authInputClassName}
                                                    placeholder={t("Email")}
                                                    autoComplete="email"
                                                    readOnly={showPassword}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {showPassword && (
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

                                {showPassword && (
                                    <div className="flex justify-end">
                                        <Link
                                            to={`/reset-password?email=${encodeURIComponent(form.getValues("email"))}`}
                                            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                        >
                                            {t("Forgot password?")}
                                        </Link>
                                    </div>
                                )}

                                {/* Continue Button - Light gray styling for white background */}
                                <Button
                                    className="h-10 w-full rounded-md border border-transparent bg-gradient-brand text-base font-normal text-white shadow-brand-glow transition-opacity hover:opacity-90"
                                    disabled={mutation.isPending}
                                    type="submit"
                                >
                                    {mutation.isPending && <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />}
                                    {showPassword ? t("Sign in") : t("Continue with email")}
                                </Button>


                                {/* Separator - Dark styling for white background */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">{t("or")}</span>
                                    </div>
                                </div>
                                <SocialLogin />

                                {/* Footer Links - Dark styling for white background */}
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