import { useCallback, useEffect, useMemo, useState, type FC } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Plus, ChevronDown, Globe, CheckCircle2, Loader2, XCircle } from "lucide-react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@workspace/ui/components/collapsible";
import {
  addDomain,
  addDomainSchema,
  checkDomainAvailability,
  type AddDomainSchema,
} from "./api";
import { useMutation, useQuery, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@workspace/ui/lib/utils";
import { useParams } from "react-router";
import { ButtonGroup } from "@workspace/ui/components/button-group";
import { isApiErrorBody, queryClient, getApiErrorMessageFromBody } from "@workspace/flowtrove/lib/network";
import { useTranslation } from "react-i18next";

const DOMAIN_DEBOUNCE_MS = 500;
const FLOWTROVE_SUBDOMAIN_SUFFIX = ".flowtrove.com";
const SUBDOMAIN_LABEL_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

type DomainPreviewStatus =
  | "idle"
  | "invalid"
  | "pending"
  | "checking"
  | "error"
  | "taken"
  | "available";

function previewRowClass(status: DomainPreviewStatus): string {
  return cn(
    "flex min-w-0 max-w-full items-center gap-1.5 font-mono text-[11px] leading-snug",
    (status === "idle" || status === "pending" || status === "checking") && "text-muted-foreground",
    (status === "invalid" || status === "error" || status === "taken") && "text-destructive",
    status === "available" && "font-medium text-emerald-600 dark:text-emerald-500",
  );
}

function serverMessageClass(status: DomainPreviewStatus): string {
  return cn(
    "mt-1 min-w-0 text-xs leading-snug wrap-break-word",
    (status === "invalid" || status === "error" || status === "taken") && "text-destructive",
    status === "available" && "text-emerald-700/90 dark:text-emerald-400/90",
    (status === "idle" || status === "pending" || status === "checking") && "text-muted-foreground",
  );
}

function StatusGlyph({ status }: { status: DomainPreviewStatus }) {
  if (status === "invalid" || status === "error" || status === "taken") {
    return <XCircle className="size-3.5 shrink-0 opacity-90" aria-hidden />;
  }
  if (status === "checking") {
    return <Loader2 className="size-3.5 shrink-0 animate-spin opacity-80" aria-hidden />;
  }
  if (status === "available") {
    return <CheckCircle2 className="size-3.5 shrink-0 opacity-90" aria-hidden />;
  }
  return null;
}

function normalizeDomain(value: string): string {
  return value.trim().toLowerCase();
}

function getCheckingDomain(value: string, mode: DomainType): string {
  const normalized = normalizeDomain(value);
  if (!normalized) return "";
  return mode === "subdomain" ? `${normalized}${FLOWTROVE_SUBDOMAIN_SUFFIX}` : normalized;
}

type DomainType = "subdomain" | "custom";



interface AddDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  queryKey: QueryKey;
}

type AvailabilityState = {
  showResult: boolean;
  failed: boolean;
  available: boolean;
  taken: boolean;
  resolved: boolean;
  message?: string;
};

const AddDomainModal: FC<AddDomainModalProps> = ({ isOpen, onClose, queryKey }) => {
  const { t } = useTranslation();
  const { ws = "" } = useParams();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [domainType, setDomainType] = useState<DomainType>("subdomain");
  const [debouncedDomain, setDebouncedDomain] = useState("");

  const form = useForm<AddDomainSchema>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      domain: "",
    },
  });

  const rawDomain = useWatch({
    control: form.control,
    name: "domain",
    defaultValue: "",
  });

  const normalizedDomain = useMemo(() => normalizeDomain(rawDomain ?? ""), [rawDomain]);
  const disableUnselectedDomainType = normalizedDomain.length > 0;

  const checkingDomain = useMemo(
    () => getCheckingDomain(normalizedDomain, domainType),
    [normalizedDomain, domainType],
  );

  const domainFormatInvalid = useMemo(() => {
    if (!normalizedDomain) return false;

    if (domainType === "subdomain") {
      return !SUBDOMAIN_LABEL_REGEX.test(normalizedDomain);
    }

    return !addDomainSchema.shape.domain.safeParse(normalizedDomain).success;
  }, [normalizedDomain, domainType]);

  const formParses = normalizedDomain.length > 0 && !domainFormatInvalid;

  const mutation = useMutation({
    mutationFn: addDomain,
    onSuccess: (res) => {
      if (isApiErrorBody(res)) {
        toast.error(getApiErrorMessageFromBody(res, t("Failed to add domain")), {
          richColors: true,
        });
        return;
      }
      onCloseModal();
      toast.success(t("Domain added successfully"), {
        richColors: true,
      });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: { response?: { data?: { message?: string } }; message?: string }) => {
      toast.error(error?.response?.data?.message ?? error?.message ?? t("Failed to add domain"), {
        richColors: true,
      });
    },
  });

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedDomain(checkingDomain);
    }, DOMAIN_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [checkingDomain]);

  useEffect(() => {
    if (!isOpen) {
      setDebouncedDomain("");
    }
  }, [isOpen]);

  const debouncedDomainIsValid = debouncedDomain.length > 0 && !domainFormatInvalid;
  const shouldCheckAvailability =
    isOpen && debouncedDomainIsValid && checkingDomain === debouncedDomain;

  const domainAvailabilityQuery = useQuery({
    queryKey: ["domain-available", ws, debouncedDomain],
    queryFn: async () => {
      const res = await checkDomainAvailability({ domain: debouncedDomain });
      if (isApiErrorBody(res)) {
        toast.error(
          getApiErrorMessageFromBody(res, t("Could not verify domain availability right now.")),
          { richColors: true },
        );
      }
      return res;
    },
    enabled: shouldCheckAvailability,
    staleTime: 30_000,
  });

  const isPendingDebounce = checkingDomain.length > 0 && !domainFormatInvalid && checkingDomain !== debouncedDomain;
  const isCheckingDomain =
    checkingDomain.length > 0 &&
    !domainFormatInvalid &&
    checkingDomain === debouncedDomain &&
    domainAvailabilityQuery.isFetching;

  const availabilityState = useMemo<AvailabilityState>(() => {
    const availabilityData = domainAvailabilityQuery.data;
    const showResult =
      checkingDomain.length > 0 &&
      !domainFormatInvalid &&
      checkingDomain === debouncedDomain &&
      !domainAvailabilityQuery.isFetching &&
      availabilityData !== undefined;

    const apiErrorPayload = showResult && isApiErrorBody(availabilityData);
    const failed =
      showResult && (availabilityData.success === false || apiErrorPayload);
    const available = showResult && !failed && availabilityData.is_available === true;
    const taken = showResult && !failed && availabilityData.is_available === false;
    const resolved = showResult && (available || taken || failed);
    const serverMessage = availabilityData?.message?.trim();

    let message: string | undefined;
    if (resolved) {
      if (failed) {
        message = serverMessage || t("Could not verify domain availability right now.");
      } else if (taken) {
        message = serverMessage || t("This domain is not available.");
      } else if (available) {
        message = serverMessage || t("Domain looks available.");
      }
    } else if (domainAvailabilityQuery.isError && !isCheckingDomain) {
      message = t("Could not verify domain availability right now.");
    }

    return {
      showResult,
      failed,
      available,
      taken,
      resolved,
      message,
    };
  }, [
    checkingDomain,
    debouncedDomain,
    domainAvailabilityQuery.data,
    domainAvailabilityQuery.isError,
    domainAvailabilityQuery.isFetching,
    domainFormatInvalid,
    isCheckingDomain,
    t,
  ]);

  const status: DomainPreviewStatus = (() => {
    if (!checkingDomain) return "idle";
    if (domainFormatInvalid) return "invalid";
    if (isPendingDebounce || isCheckingDomain) return "checking";
    if (domainAvailabilityQuery.isError && !isCheckingDomain) return "error";
    if (availabilityState.failed) return "error";
    if (availabilityState.taken) return "taken";
    if (availabilityState.available) return "available";
    return "pending";
  })();

  const inputHasError =
    domainFormatInvalid ||
    availabilityState.taken ||
    availabilityState.failed ||
    (domainAvailabilityQuery.isError && !isCheckingDomain);
  const submitDisabled = mutation.isPending;

  const onCloseModal = useCallback(() => {
    setDomainType("subdomain");
    setDebouncedDomain("");
    form.reset({ domain: "" });
    onClose();
  }, [form, onClose]);

  const domainValidationErrorMessage = domainType === "subdomain"
    ? t("Use lowercase letters, numbers, and hyphens only.")
    : t("Enter a valid domain like example.com");

  const onSubmit = (data: AddDomainSchema) => {
    if (!data.domain?.trim()) {
      form.setError("domain", { type: "manual", message: t("Domain is required") });
      toast.error(t("Domain is required"), { richColors: true });
      return;
    }
    if (domainFormatInvalid) {
      form.setError("domain", {
        type: "manual",
        message: domainValidationErrorMessage,
      });
      toast.error(domainValidationErrorMessage, { richColors: true });
      return;
    }
    if (!formParses) {
      toast.error(t("Please fix the domain value before submitting."), { richColors: true });
      return;
    }
    if (availabilityState.taken || availabilityState.failed) {
      toast.error(availabilityState.message || t("This domain is not available."), { richColors: true });
      return;
    }

    mutation.mutate({
      ...data,
      domain: checkingDomain,
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
                <DialogTitle className="text-xl">{t("Add New Domain")}</DialogTitle>
                <DialogDescription>
                  {t("Add your domain to manage DNS records and workspace routing.")}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="space-y-3 px-6 py-4">
              <ButtonGroup className="w-full" aria-label="Domain type">
                <Button
                  type="button"
                  variant={domainType === "subdomain" ? "default" : "outline"}
                  className="w-1/2 cursor-pointer"
                  onClick={() => setDomainType("subdomain")}
                  disabled={disableUnselectedDomainType && domainType !== "subdomain"}
                >
                  {t("Subdomain")}
                </Button>
                <Button
                  type="button"
                  variant={domainType === "custom" ? "default" : "outline"}
                  className="w-1/2 cursor-pointer"
                  onClick={() => setDomainType("custom")}
                  disabled={disableUnselectedDomainType && domainType !== "custom"}
                >
                  {t("Custom Domain")}
                </Button>
              </ButtonGroup>
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Domain")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        onChange={(event) => {
                          form.clearErrors("domain");
                          field.onChange(normalizeDomain(event.target.value));
                        }}
                        placeholder={domainType === "subdomain" ? "myteam" : "example.com"}
                        aria-invalid={inputHasError ? true : undefined}
                        className={cn(
                          inputHasError &&
                          "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/35 dark:focus-visible:ring-destructive/30",
                          availabilityState.available &&
                          !inputHasError &&
                          "border-emerald-600/90 focus-visible:border-emerald-600 focus-visible:ring-emerald-500/30 dark:border-emerald-500/80 dark:focus-visible:border-emerald-500",
                        )}
                      />
                    </FormControl>
                    <p role="status" aria-live="polite" aria-atomic="true" className={previewRowClass(status)}>
                      <span className="min-w-0 flex-1 wrap-break-word break-all">
                        {normalizedDomain
                          ? checkingDomain
                          : domainType === "subdomain"
                            ? `myteam${FLOWTROVE_SUBDOMAIN_SUFFIX}`
                            : "example.com"}
                      </span>
                      <StatusGlyph status={status} />
                    </p>
                    {availabilityState.message && !isCheckingDomain ? (
                      <p className={serverMessageClass(status)}>{availabilityState.message}</p>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <div className="rounded-lg border border-border/70 bg-muted/25 px-3 py-2">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between text-sm font-medium text-foreground"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Globe className="size-4" />
                        {t("Advanced Features")}
                      </span>
                      <ChevronDown
                        className={`size-4 transition-transform duration-200 ${isAdvancedOpen ? "rotate-180" : "rotate-0"}`}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2 text-sm text-muted-foreground">
                    {t("Soon you will be able to configure verification and default DNS presets during domain onboarding.")}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </div>

            <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4 sm:justify-end">
              <Button type="button" variant="outline" onClick={onCloseModal} disabled={mutation.isPending} className="cursor-pointer">
                {t("Cancel")}
              </Button>
              <Button type="submit" disabled={submitDisabled} className="cursor-pointer">
                {mutation.isPending ? t("Adding...") : t("Add Domain")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDomainModal;
