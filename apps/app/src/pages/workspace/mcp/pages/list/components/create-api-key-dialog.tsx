"use client";

import { Button } from "@workspace/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { CalendarIcon, LoaderCircle, PlusCircle } from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@workspace/ui/components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { addYears, format, startOfDay } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";
import { Calendar } from "@workspace/ui/components/calendar";
import { type FC } from "react";
import { toast } from "sonner";
import { createMCPToken, createMCPTokenSchema, type CreateMCPTokenSchemaTypes } from "../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";


interface CreateApiKeyDialogProps {
    isOpen: boolean;
    onClose: () => void;
    queryKey: string[];
}

const CreateApiKeyDialog: FC<CreateApiKeyDialogProps> = ({ isOpen, onClose, queryKey }) => {
    const { ws = "" } = useParams();
    const queryClient = useQueryClient();
    const defaultExpiryDate = addYears(new Date(), 1);

    const form = useForm<CreateMCPTokenSchemaTypes>({
        resolver: zodResolver(createMCPTokenSchema),
        defaultValues: {
            ws,
            name: "",
            expires_at: defaultExpiryDate
        }
    });

    const mutation = useMutation({
        mutationFn: createMCPToken,
        onSuccess: async () => {
            toast.success("MCP server created successfully", {
                richColors: true,
            });
            await queryClient.invalidateQueries({ queryKey });
            form.reset({ name: "", expires_at: defaultExpiryDate });
            onClose();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message ?? error?.message ?? "Failed to create MCP server", {
                richColors: true,
            });
        }
    });

    function onSubmit(values: CreateMCPTokenSchemaTypes) {
        mutation.mutate(values);
    }



    const handleCancel = () => {
        form.reset({ name: "", expires_at: defaultExpiryDate });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                overlayClassName="bg-black/80"
                className="w-full max-w-[calc(100%-2rem)] border-border/60 p-5 shadow-xl sm:max-w-md sm:rounded-2xl sm:p-6">
                <DialogHeader className="items-center gap-2 text-center">
                    <div className="mb-1 flex size-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary shadow-sm">
                        <PlusCircle className="size-6" aria-hidden />
                    </div>
                    <DialogTitle className="text-xl">Create new MCP server</DialogTitle>
                    <DialogDescription>
                        Add a server name and choose an expiry date for this MCP server key.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-3 space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="space-y-0">
                                    <FormLabel className="text-sm font-medium text-foreground">
                                        MCP server name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            className="h-10 w-full text-sm"
                                            placeholder="Enter server name"
                                            autoComplete="name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="expires_at"
                            render={({ field }) => (
                                <FormItem className="flex flex-col space-y-0">
                                    <FormLabel className="text-sm font-medium text-foreground">
                                        Expiry date
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className={cn(
                                                        "h-10 justify-start pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}>
                                                    {field.value instanceof Date ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick an expiry date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value instanceof Date ? field.value : undefined}
                                                onSelect={field.onChange}
                                                disabled={(date) => date < startOfDay(new Date())}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 pt-2 sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full cursor-pointer sm:w-auto"
                                onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="w-full cursor-pointer sm:w-auto"
                                disabled={mutation.isPending}>
                                {mutation.isPending && (
                                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                                )}
                                {mutation.isPending ? "Creating..." : "Create MCP server"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default CreateApiKeyDialog;