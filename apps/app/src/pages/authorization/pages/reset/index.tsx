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
import { useNavigate, useSearchParams } from "react-router";
import Links from "../../components/links";
import {
    authCardClassName,
    authInputClassName,
    authPageClassName,
    authSeparatorClassName,
    authSeparatorLabelClassName,
    authSeparatorLineClassName,
} from "../../components/styles";

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
            <span className="text-xl font-bold text-foreground tracking-tight">flowtrove</span>
        </div>
    )
};

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const form = useForm<ResetPasswordSchema>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            email: searchParams.get("email") ?? "",
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
                    <div className={authPageClassName}>
                        <div className={authCardClassName}>
                            <div className="space-y-3">
                                {/* Logo */}
                                <div className="text-left">
                                    <FlowTroveLogo className="mb-6" />
                                </div>

                                {/* Login Header - Dark text for white background */}
                                <div className="text-left space-y-2">
                                    <h1 className="text-xl font-semibold text-foreground">Reset Password</h1>
                                    <p className="text-base font-normal text-muted-foreground">Continue to FlowTrove</p>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className='space-y-1'>
                                            <FormLabel className="sr-only"> Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className={authInputClassName}
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


                                <div className={authSeparatorClassName}>
                                    <div className={authSeparatorLineClassName} />
                                    <span className={authSeparatorLabelClassName}>or</span>
                                    <div className={authSeparatorLineClassName} />
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

export default ResetPassword;