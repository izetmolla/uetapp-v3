import { useCallback, type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { useMutation, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { AddEntitySchema, addEntity, type AddEntitySchemaType } from "./api";
import { getApiErrorMessageFromBody, isApiErrorBody, queryClient } from "@workspace/flowtrove/lib/network";
import { useTranslation } from "react-i18next";
import {
  entityNameToSnake,
  sanitizeEntityNameInput,
  sanitizeTableNameInput,
  snakeToEntityName,
  stripTrailingTableUnderscores,
} from "./lib/utils";

interface AddNewEntityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  queryKey: QueryKey;
}

const AddNewEntityDialog: FC<AddNewEntityDialogProps> = ({ isOpen, onClose, queryKey }) => {
  const { t } = useTranslation();
  const form = useForm<AddEntitySchemaType>({
    resolver: zodResolver(AddEntitySchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      table_name: "",
    },
  });

  const mutation = useMutation({
    mutationFn: addEntity,
    onSuccess: (res) => {
      if (isApiErrorBody(res)) {
        toast.error(getApiErrorMessageFromBody(res, t("Failed to create entity")), {
          richColors: true,
        });
        return;
      }
      onCloseModal();
      toast.success(t("Entity created successfully"), {
        richColors: true,
      });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: { response?: { data?: { message?: string } }; message?: string }) => {
      toast.error(error?.response?.data?.message ?? error?.message ?? t("Failed to create entity"), {
        richColors: true,
      });
    },
  });

  const onCloseModal = useCallback(() => {
    form.reset({ name: "", table_name: "" });
    onClose();
  }, [form, onClose]);

  const onSubmit = (data: AddEntitySchemaType) => {
    const name = data.name.trim();
    mutation.mutate({
      name,
      table_name: entityNameToSnake(name),
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onCloseModal();
      }}
    >
      <DialogContent
        overlayClassName="bg-black/80"
        className="w-full max-w-md sm:max-w-md gap-0 overflow-hidden rounded-xl border-border/70 p-0 shadow-2xl"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="bg-gradient-to-b from-primary/10 to-background px-6 pt-6 pb-4">
              <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                <Plus className="size-5" />
              </div>
              <DialogHeader className="shrink-0 text-center">
                <DialogTitle className="text-xl">{t("Add New Entity")}</DialogTitle>
                <DialogDescription>
                  {t("Create a new data entity for your workspace.")}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="space-y-3 px-6 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Entity name")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder={t("e.g. GameStyle")}
                        onChange={(event) => {
                          const sanitized = sanitizeEntityNameInput(event.target.value);
                          field.onChange(sanitized);
                          form.setValue("table_name", entityNameToSnake(sanitized), {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="table_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Table name")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder={t("e.g. game_style")}
                        className="font-mono"
                        onChange={(event) => {
                          const sanitized = sanitizeTableNameInput(event.target.value, {
                            preserveTrailingUnderscore: true,
                          });
                          field.onChange(sanitized);
                          const forEntityName = stripTrailingTableUnderscores(sanitized);
                          form.setValue("name", snakeToEntityName(forEntityName), {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                        onBlur={() => {
                          field.onBlur();
                          const current = form.getValues("table_name") ?? "";
                          const trimmed = sanitizeTableNameInput(current);
                          if (trimmed !== current) {
                            form.setValue("table_name", trimmed, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }
                          form.setValue("name", snakeToEntityName(trimmed), {
                            shouldValidate: true,
                          });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4 sm:justify-end">
              <Button type="button" variant="outline" onClick={onCloseModal} disabled={mutation.isPending} className="cursor-pointer">
                {t("Cancel")}
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="cursor-pointer">
                {mutation.isPending ? t("Creating...") : t("Create Entity")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewEntityDialog;
