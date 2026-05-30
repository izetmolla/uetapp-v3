import type { AuthSession } from "@workspace/flowtrove/store/authorization"
import useAuthorizationStore, {
    sessionHasTokens,
} from "@workspace/flowtrove/store/authorization"
import type { User } from "@workspace/flowtrove/types"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn, generateAvatarFallback } from "@workspace/ui/lib/utils"
import { MoreVertical, Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

export interface SessionsProps {
    sessions: AuthSession[]
    onSelectSession: (session: AuthSession) => void
    onUseAnotherAccount: () => void
}

function isPresent(value?: string | null): value is string {
    if (!value) return false
    const trimmed = value.trim()
    if (!trimmed) return false
    return trimmed.toLowerCase() !== "null"
}

export function userLoginId(user: User): string {
    if (isPresent(user.email)) return user.email.trim()
    if (isPresent(user.username)) return user.username.trim()
    return ""
}

function sessionDisplayName(session: AuthSession): string {
    const name = [session.user.first_name, session.user.last_name]
        .filter(Boolean)
        .join(" ")
        .trim()
    if (name) return name
    return userLoginId(session.user)
}

function userAvatarUrl(user: User): string | undefined {
    const url = user.avatar_url?.trim() || user.image?.trim()
    return url || undefined
}

export default function Sessions({
    sessions,
    onSelectSession,
    onUseAnotherAccount,
}: SessionsProps) {
    const { t } = useTranslation("authorization")
    const removeSession = useAuthorizationStore((state) => state.removeSession)

    if (sessions.length === 0) return null

    const scrollSessions = sessions.length > 3

    return (
        <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">{t("Pick an account")}</h2>

            <div
                className={cn(
                    "divide-y divide-border/60",
                    scrollSessions &&
                        "max-h-[15rem] overflow-y-auto overscroll-contain pr-1 [-ms-overflow-style:none] [scrollbar-width:thin]",
                )}
            >
                {sessions.map((session) => {
                    const name = sessionDisplayName(session)
                    const signedIn = sessionHasTokens(session)
                    const avatarUrl = userAvatarUrl(session.user)
                    const emailLabel = isPresent(session.user.email)
                        ? session.user.email.trim()
                        : null

                    return (
                        <div
                            key={session.id}
                            className="group flex items-center gap-3 py-3 first:pt-2"
                        >
                            <button
                                type="button"
                                className="flex min-w-0 flex-1 items-center gap-3 text-left transition-opacity hover:opacity-80"
                                onClick={() => onSelectSession(session)}
                            >
                                <Avatar className="size-10 shrink-0 rounded-full bg-muted">
                                    {avatarUrl ? (
                                        <AvatarImage src={avatarUrl} alt={name} />
                                    ) : null}
                                    <AvatarFallback className="rounded-full bg-muted text-sm text-muted-foreground">
                                        {generateAvatarFallback(name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-foreground">
                                        {name}
                                    </p>
                                    {emailLabel ? (
                                        <p className="truncate text-sm text-muted-foreground">
                                            {emailLabel}
                                        </p>
                                    ) : null}
                                    {signedIn ? (
                                        <p className="text-xs text-muted-foreground/80">
                                            {t("Signed in")}
                                        </p>
                                    ) : null}
                                </div>
                            </button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className={cn(
                                            "flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground",
                                            "opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
                                            "hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                                        )}
                                        aria-label={t("Account options")}
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        <MoreVertical className="size-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-40">
                                    <DropdownMenuItem
                                        className="cursor-pointer text-destructive focus:text-destructive"
                                        onClick={() => removeSession(session.id)}
                                    >
                                        {t("Remove account")}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )
                })}
            </div>

            <div className="border-t border-border/60">
                <button
                    type="button"
                    className="flex w-full items-center gap-3 py-3 text-left transition-opacity hover:opacity-80"
                    onClick={onUseAnotherAccount}
                >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Plus className="size-5" strokeWidth={1.5} />
                    </div>
                    <span className="text-sm text-foreground">{t("Use another account")}</span>
                </button>
            </div>
        </div>
    )
}
