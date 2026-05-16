import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import SocialLogin from "../../components/social-login";
import { useMutation } from "@tanstack/react-query";
import { signUp } from "./api";
import { toast } from "@workspace/ui/components/sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpSchema } from "./api/validations";
import { LoaderCircle } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import PasswordInput from "@workspace/flowtrove/components/password";
import useAuthorizationStore from "@workspace/flowtrove/store/authorization";
import Links from "../../components/links";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

// Enhanced FlowTrove Logo Component
const FlowTroveLogo = ({ className }: { className?: string }) => {
    const navigate = useNavigate();
    return (
        <div className={cn("flex items-center gap-3 cursor-pointer", className)} onClick={() => navigate("/")}>
            <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">F</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-500 rounded-lg blur-sm opacity-50 -z-10"></div>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">flowtrove</span>
        </div>
    )
};

const SignUp = () => {
    const { t } = useTranslation('authorization');
    const [searchParams] = useSearchParams();
    const redirectUrl = useMemo(() => searchParams.get("redirectUrl"), [searchParams]);
    const navigate = useNavigate()
    const { signInUser } = useAuthorizationStore()
    const form = useForm<SignUpSchema>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            password: "",
        }
    })
    const mutation = useMutation({
        mutationFn: signUp,
        onSuccess: ({ data }) => {
            signInUser({ user: data.user, tokens: data.tokens })
            if (redirectUrl) {
                window.location.replace(redirectUrl ?? "/")
            } else {
                navigate("/", { replace: true })
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




    const onsubmit = (data: SignUpSchema) => {
        mutation.mutate({ ...form.getValues(), ...data })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onsubmit)}>
                <div className="min-h-screen">
                    {/* Background */}
                    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-login">
                        {/* Container - 400px width, 32px padding, 12px border radius, responsive shadow */}
                        <div className="w-full max-w-[450px] bg-white rounded-[12px] p-8 shadow-2xl">
                            <div className="space-y-3">
                                {/* Logo */}
                                <div className="text-left">
                                    <FlowTroveLogo className="mb-6" />
                                </div>

                                {/* Login Header - Dark text for white background */}
                                <div className="text-left space-y-2">
                                    <h1 className="text-xl font-semibold text-gray-900">{t("Sign up")}</h1>
                                    <p className="text-base font-normal text-gray-600">{t("Create Your Account")}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                        control={form.control}
                                        name="first_name"
                                        render={({ field }) => (
                                            <FormItem className='space-y-1'>
                                                <FormLabel className="sr-only"> {t("First Name")}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="h-10 w-full rounded-md border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus-visible:border-gray-400 focus-visible:ring-2 focus-visible:ring-gray-200"
                                                        placeholder={t("First Name")}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="last_name"
                                        render={({ field }) => (
                                            <FormItem className='space-y-1'>
                                                <FormLabel className="sr-only"> {t("Last Name")}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="h-10 w-full rounded-md border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus-visible:border-gray-400 focus-visible:ring-2 focus-visible:ring-gray-200"
                                                        placeholder={t("Last Name")}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className='space-y-1'>
                                            <FormLabel className="sr-only"> {t("Email")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="h-10 w-full rounded-md border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus-visible:border-gray-400 focus-visible:ring-2 focus-visible:ring-gray-200"
                                                    placeholder={t("Email")}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className='space-y-1'>
                                            <FormLabel className="sr-only"> {t("Password")}</FormLabel>
                                            <FormControl>
                                                <PasswordInput
                                                    className="h-10 w-full rounded-md border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus-visible:border-gray-400 focus-visible:ring-2 focus-visible:ring-gray-200"
                                                    placeholder="Password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />




                                {/* Continue Button - Light gray styling for white background */}
                                <Button
                                    className="h-10 w-full rounded-md border border-transparent bg-gradient-brand text-base font-normal text-white shadow-brand-glow transition-opacity hover:opacity-90"
                                    disabled={mutation.isPending}
                                    type="submit"
                                >
                                    {mutation.isPending && <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />}
                                    {t("Creating Account")}
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

                                {/* Sign Up Link - Dark styling for white background */}
                                <div className="text-left">
                                    <Link to="/sign-in" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">{t("Already have an account? Sign in")} →</Link>
                                </div>

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

export default SignUp;