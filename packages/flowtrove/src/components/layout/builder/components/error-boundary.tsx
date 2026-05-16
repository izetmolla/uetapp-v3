import React, { Component, useCallback, useState } from "react"
import type { ErrorInfo, ReactNode } from "react"
import {
  AlertTriangle,
  Bug,
  ChevronDown,
  ChevronRight,
  ClipboardCopy,
  Check,
  RotateCcw,
  RefreshCw,
  Home,
  Code2,
  Layers,
  FileWarning,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

// ─── Usage examples ───────────────────────────────────────────────────────────
//
// 1. Wrap any subtree — full-screen fallback by default:
//
//    <ErrorBoundary>
//      <MyPage />
//    </ErrorBoundary>
//
// 2. Inline variant — compact card that fits inside a panel or sidebar:
//
//    <ErrorBoundary inline>
//      <PropertiesPanel />
//    </ErrorBoundary>
//
// 3. Auto-reset when route / key changes (useful in routers):
//
//    <ErrorBoundary resetOnPropsChange key={location.pathname}>
//      <Outlet />
//    </ErrorBoundary>
//
// 4. Custom fallback — render function receives full error context:
//
//    <ErrorBoundary
//      fallback={({ error, errorId, reset }) => (
//        <div>
//          <p>Failed: {error.message} ({errorId})</p>
//          <button onClick={reset}>Retry</button>
//        </div>
//      )}
//    >
//      <Widget />
//    </ErrorBoundary>
//
// 5. Wire to external logging (Sentry, LogRocket, etc.):
//
//    <ErrorBoundary onError={(err, info, id) => Sentry.captureException(err, { extra: { id } })}>
//      <App />
//    </ErrorBoundary>
//
// 6. HOC — wrap an exported component so it self-contains its errors:
//
//    export default withErrorBoundary(DashboardChart, { inline: true })
//
// 7. useErrorHandler — catch async / imperative errors inside functional components:
//
//    function DataLoader() {
//      const { handleError } = useErrorHandler()
//
//      useEffect(() => {
//        fetchData().catch(handleError)
//      }, [handleError])
//
//      return <div>...</div>
//    }
//

// ─── Types ────────────────────────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
  timestamp: number
}

interface ErrorBoundaryProps {
  children?: ReactNode
  /** Render a fully custom fallback; receives error context for flexibility. */
  fallback?: ReactNode | ((ctx: ErrorFallbackContext) => ReactNode)
  /** Called after every caught error — wire to Sentry, LogRocket, etc. */
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void
  /** Auto-reset when children identity changes (useful in routers). */
  resetOnPropsChange?: boolean
  /** Inline variant renders a compact card instead of full-screen overlay. */
  inline?: boolean
}

export interface ErrorFallbackContext {
  error: Error
  errorInfo: ErrorInfo | null
  errorId: string
  timestamp: number
  reset: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INITIAL_STATE: ErrorBoundaryState = {
  hasError: false,
  error: null,
  errorInfo: null,
  errorId: "",
  timestamp: 0,
}

function generateErrorId(): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return `EB-${ts}-${rand}`.toUpperCase()
}

function parseComponentStack(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("at "))
    .map((line) => line.slice(3).trim())
}

function parseJsStack(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 15)
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  })
}

function buildClipboardPayload(state: ErrorBoundaryState): string {
  const sections = [
    `Error ID:    ${state.errorId}`,
    `Timestamp:   ${formatTimestamp(state.timestamp)}`,
    `URL:         ${window.location.href}`,
    `User Agent:  ${navigator.userAgent}`,
    "",
    `--- Error ---`,
    state.error?.toString() ?? "Unknown error",
    "",
    `--- Stack Trace ---`,
    state.error?.stack ?? "(none)",
    "",
    `--- Component Stack ---`,
    state.errorInfo?.componentStack ?? "(none)",
  ]
  return sections.join("\n")
}

// ─── Collapsible section (no external state needed) ───────────────────────────

function Section({
  title,
  icon: Icon,
  defaultOpen = false,
  count,
  children,
}: {
  title: string
  icon: React.ElementType
  defaultOpen?: boolean
  count?: number
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-muted/40"
      >
        {open ? (
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="flex-1">{title}</span>
        {count !== undefined && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {count}
          </Badge>
        )}
      </button>
      {open && (
        <div className="border-t border-border/40 bg-background/60 px-3 py-2.5">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = text
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="gap-1.5 text-xs"
    >
      {copied ? (
        <Check className="size-3" />
      ) : (
        <ClipboardCopy className="size-3" />
      )}
      {copied ? "Copied" : "Copy report"}
    </Button>
  )
}

// ─── Error Boundary ───────────────────────────────────────────────────────────

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { ...INITIAL_STATE }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
      timestamp: Date.now(),
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    if (import.meta.env.DEV) {
      console.groupCollapsed(
        `%c ErrorBoundary %c ${this.state.errorId} `,
        "background:#ef4444;color:#fff;padding:2px 6px;border-radius:3px;font-weight:600",
        "color:#ef4444;font-weight:600",
      )
      console.error(error)
      console.info("Component stack:", errorInfo.componentStack)
      console.groupEnd()
    }

    this.props.onError?.(error, errorInfo, this.state.errorId)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (
      this.props.resetOnPropsChange &&
      prevProps.children !== this.props.children &&
      this.state.hasError
    ) {
      this.resetError()
    }
  }

  resetError = () => this.setState({ ...INITIAL_STATE })

  render() {
    if (!this.state.hasError) return this.props.children

    if (this.props.fallback) {
      if (typeof this.props.fallback === "function") {
        return this.props.fallback({
          error: this.state.error!,
          errorInfo: this.state.errorInfo,
          errorId: this.state.errorId,
          timestamp: this.state.timestamp,
          reset: this.resetError,
        })
      }
      return this.props.fallback
    }

    return (
      <ErrorFallbackUI
        error={this.state.error!}
        errorInfo={this.state.errorInfo}
        errorId={this.state.errorId}
        timestamp={this.state.timestamp}
        onReset={this.resetError}
        inline={this.props.inline}
      />
    )
  }
}

// ─── Default fallback UI ──────────────────────────────────────────────────────

function ErrorFallbackUI({
  error,
  errorInfo,
  errorId,
  timestamp,
  onReset,
  inline,
}: {
  error: Error
  errorInfo: ErrorInfo | null
  errorId: string
  timestamp: number
  onReset: () => void
  inline?: boolean
}) {
  const componentFrames = parseComponentStack(errorInfo?.componentStack ?? undefined)
  const jsFrames = parseJsStack(error.stack)
  const clipboardPayload = buildClipboardPayload({
    hasError: true,
    error,
    errorInfo,
    errorId,
    timestamp,
  })

  const card = (
    <div
      className={cn(
        "w-full rounded-xl border border-destructive/30 bg-background shadow-lg",
        inline ? "max-w-xl" : "max-w-2xl",
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3.5 border-b border-border/60 px-5 py-4">
        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="size-5 text-destructive" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-foreground">
            Something went wrong
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            An unexpected error prevented this component from rendering.
          </p>
        </div>
      </div>

      {/* Error summary */}
      <div className="space-y-3 px-5 py-4">
        {/* Quick-info badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="destructive" className="gap-1 font-mono text-[11px]">
            <Bug className="size-3" />
            {error.name || "Error"}
          </Badge>
          <Badge variant="outline" className="gap-1 font-mono text-[11px]">
            {errorId}
          </Badge>
          <span className="text-muted-foreground">
            {formatTimestamp(timestamp)}
          </span>
        </div>

        {/* Error message */}
        <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2.5">
          <p className="break-words font-mono text-sm leading-relaxed text-destructive">
            {error.message || error.toString()}
          </p>
        </div>

        {/* Expandable debug sections */}
        {componentFrames.length > 0 && (
          <Section
            title="Component tree"
            icon={Layers}
            defaultOpen
            count={componentFrames.length}
          >
            <ol className="space-y-1 font-mono text-xs leading-relaxed text-muted-foreground">
              {componentFrames.map((frame, i) => (
                <li key={i} className="flex items-baseline gap-2">
                  <span className="w-5 shrink-0 text-right tabular-nums text-muted-foreground/50">
                    {i + 1}
                  </span>
                  <span className="break-all">{frame}</span>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {jsFrames.length > 0 && (
          <Section title="Stack trace" icon={Code2} count={jsFrames.length}>
            <ol className="space-y-1 font-mono text-[11px] leading-relaxed text-muted-foreground">
              {jsFrames.map((frame, i) => (
                <li key={i} className="flex items-baseline gap-2">
                  <span className="w-5 shrink-0 text-right tabular-nums text-muted-foreground/50">
                    {i + 1}
                  </span>
                  <span className="break-all">{frame}</span>
                </li>
              ))}
            </ol>
          </Section>
        )}

        <Section title="Environment" icon={FileWarning}>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
            <dt className="font-medium text-foreground/70">URL</dt>
            <dd className="truncate">{window.location.href}</dd>
            <dt className="font-medium text-foreground/70">Mode</dt>
            <dd>{import.meta.env.PROD ? "Production" : "Development"}</dd>
            <dt className="font-medium text-foreground/70">Viewport</dt>
            <dd>
              {window.innerWidth} x {window.innerHeight}
            </dd>
          </dl>
        </Section>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border/60 px-5 py-3">
        <Button variant="default" size="sm" onClick={onReset} className="gap-1.5">
          <RotateCcw className="size-3" />
          Try again
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.location.reload()}
          className="gap-1.5"
        >
          <RefreshCw className="size-3" />
          Reload page
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (window.location.href = "/")}
          className="gap-1.5"
        >
          <Home className="size-3" />
          Home
        </Button>
        <div className="flex-1" />
        <CopyButton text={clipboardPayload} />
      </div>
    </div>
  )

  if (inline) return card

  return (
    <div className="flex min-h-screen items-center justify-center bg-background/80 p-6 backdrop-blur-sm">
      {card}
    </div>
  )
}

// ─── useErrorHandler ──────────────────────────────────────────────────────────

export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null)

  const handleError = useCallback((err: Error) => {
    setError(err)
    if (import.meta.env.DEV) {
      console.error("[useErrorHandler]", err)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { error, handleError, clearError } as const
}

// ─── withErrorBoundary HOC ────────────────────────────────────────────────────

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  boundaryProps?: Omit<ErrorBoundaryProps, "children">,
) {
  function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...boundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }

  WithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`

  return WithErrorBoundary
}

export default ErrorBoundary
