import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import SocialLogin from "../../components/social-login";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "./api";
import { toast } from "@workspace/ui/components/sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordSchema } from "./api/validations";
import { LoaderCircle } from "lucide-react";
import PasskeyLogin from "../../components/passkey-login";
import { Link, useNavigate } from "react-router";
import Links from "../../components/links";
import { useTranslation } from "react-i18next";

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

const ResetPassword = () => {
    const { t } = useTranslation('authorization');
    const form = useForm<ResetPasswordSchema>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            email: "",
        }
    })
    // const [password, setPassword] = useState("");
    const mutation = useMutation({
        mutationFn: resetPassword,
        onSuccess: ({ data }) => {
            if (data.error) {
                if (data.error.message != "") {
                    form.setError(data.error.field as keyof ResetPasswordSchema, { message: data.error.message })
                } else {
                    toast.error(data.error.message);
                }
            } else {
                console.log(data);
            }
        },
        onError: (error) => {
            console.log(error);
            toast.error(error.message);
        }
    })




    const onsubmit = (data: ResetPasswordSchema) => {
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
                                    <h1 className="text-xl font-semibold text-gray-900">Reset Password</h1>
                                    <p className="text-base font-normal text-gray-600">Continue to FlowTrove</p>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className='space-y-1'>
                                            <FormLabel className="sr-only"> Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="h-10 w-full rounded-md border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus-visible:border-gray-400 focus-visible:ring-2 focus-visible:ring-gray-200"
                                                    placeholder="Email"
                                                    autoComplete="email"
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
                                    Reset Password
                                </Button>

                                <PasskeyLogin />

                                {/* Separator - Dark styling for white background */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">or</span>
                                    </div>
                                </div>
                                <SocialLogin />

                                {/* Sign Up Link - Dark styling for white background */}
                                <div className="text-left">
                                    <Link to="/register" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">{t("New to FlowTrove? Get started")} →</Link>
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

export default ResetPassword;