import axios from "axios"
import ApiService from "../lib/network"
import type { AuthSession, Tokens, User } from "../types"
import { create, type StateCreator } from "zustand"
import { devtools } from "zustand/middleware"
import { persist, createJSONStorage } from "zustand/middleware"

import { createAuthorizationPersistStorage } from "./authorization-persist-storage"

export type { AuthSession }

export interface AuthorizationState {
  /** Active session id; use to resolve `user` / `tokens` from `sessions`. */
  current_session: string
  /** All signed-in accounts on this browser tab. */
  sessions: AuthSession[]
  /** Mirrors the active session (kept in sync for existing consumers). */
  user?: User
  tokens?: Tokens
  isSignedIn: boolean
  redirectUrl?: string
  /** When true, the app shell should render the unauthorized access page (403 / permission 401). */
  accessDenied: boolean
  signIn: (isSignedIn: boolean) => void
  /** Clears tokens and `current_session` for the active account; keeps `user` as a login shortcut. */
  signOut: () => void
  /** Clears every local session and calls the backend sign-out endpoint. */
  signOutAll: () => void
  /** Removes one session by id; updates `current_session` when needed. */
  removeSession: (sessionId: string) => void
  setCurrentSession: (sessionId: string) => void
  setAccessToken: (token: string) => void
  signInUser: (props: {
    user?: User
    tokens?: Tokens
    /** Defaults to `user.id`. */
    sessionId?: string
  }) => void
  setRedirectUrl: (url: string) => void
  setAccessDenied: (accessDenied: boolean) => void
  clearAccessDenied: () => void
}

export function sessionHasTokens(session: AuthSession): boolean {
  return Boolean(
    session.tokens?.access_token || session.tokens?.refresh_token,
  )
}

export function getActiveSession(
  state: Pick<AuthorizationState, "sessions" | "current_session">,
): AuthSession | undefined {
  if (!state.current_session) return undefined
  const active = state.sessions.find((s) => s.id === state.current_session)
  if (!active || !sessionHasTokens(active)) return undefined
  return active
}

/** Sessions that still have valid tokens (can switch without re-login). */
export function getSignedInSessions(
  state: Pick<AuthorizationState, "sessions" | "current_session">,
): AuthSession[] {
  return state.sessions.filter(
    (s) => sessionHasTokens(s) && s.id !== state.current_session,
  )
}

function syncActiveSessionFields(
  sessions: AuthSession[],
  currentSession: string,
): Pick<AuthorizationState, "user" | "tokens" | "isSignedIn"> {
  const active = getActiveSession({ sessions, current_session: currentSession })
  return {
    user: active?.user,
    tokens: active?.tokens,
    isSignedIn: Boolean(active),
  }
}

function sessionIdForUser(user?: User): string {
  if (user?.id) return user.id
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `session-${Date.now()}`
}

/** Migrates legacy persisted blobs (flat user/tokens or `sessions: string[]`). */
export function migratePersistedAuthorization(
  persisted: Partial<AuthorizationState> | undefined,
): Pick<AuthorizationState, "sessions" | "current_session"> {
  if (!persisted) {
    return { sessions: [], current_session: "" }
  }

  const rawSessions = persisted.sessions
  if (
    Array.isArray(rawSessions) &&
    rawSessions.length > 0 &&
    typeof rawSessions[0] === "object" &&
    rawSessions[0] !== null &&
    "user" in rawSessions[0]
  ) {
    const sessions = rawSessions as AuthSession[]
    const current =
      persisted.current_session &&
      sessions.some((s) => s.id === persisted.current_session)
        ? persisted.current_session
        : (sessions[0]?.id ?? "")
    return { sessions, current_session: current }
  }

  if (persisted.user && persisted.tokens) {
    const id = sessionIdForUser(persisted.user)
    return {
      sessions: [{ id, user: persisted.user, tokens: persisted.tokens }],
      current_session: persisted.current_session || id,
    }
  }

  return {
    sessions: [],
    current_session: persisted.current_session ?? "",
  }
}

/**
 * Notifies the backend to invalidate the server-side session and clear
 * the cookie. We deliberately use a bare axios call rather than
 * ApiService here so that:
 *
 *   - The request interceptor doesn't try to refresh a token that we
 *     are about to throw away.
 *   - The response interceptor doesn't recursively call signOut() on
 *     a 401 (which can happen when the session has already expired by
 *     the time we get here).
 *
 * Failures are intentionally swallowed: the user has clearly indicated
 * they want to be signed out and we should never block that on a
 * flaky network or an already-revoked session.
 */
async function callSignOutEndpoint(): Promise<void> {
  try {
    await axios({
      method: "post",
      url: "/api/authorization/sign-out",
      withCredentials: true,
      timeout: 5000,
    })
  } catch {
    /* idempotent: already signed out / network down / cookie missing */
  }
}

const authorizationStore: StateCreator<AuthorizationState> = (set, get) => ({
  current_session: "",
  sessions: [],
  user: undefined,
  tokens: undefined,
  isSignedIn: false,
  redirectUrl: "",
  accessDenied: false,
  setRedirectUrl: (url) => set({ redirectUrl: url }),
  setAccessDenied: (accessDenied) => set({ accessDenied }),
  clearAccessDenied: () => set({ accessDenied: false }),
  signIn: (isSignedIn) => set({ isSignedIn }),
  setCurrentSession: (sessionId) => {
    const { sessions } = get()
    const session = sessions.find((s) => s.id === sessionId)
    if (!session || !sessionHasTokens(session)) return
    set({
      current_session: sessionId,
      accessDenied: false,
      ...syncActiveSessionFields(sessions, sessionId),
    })
  },
  removeSession: (sessionId) => {
    const { sessions, current_session } = get()
    const remaining = sessions.filter((s) => s.id !== sessionId)
    if (remaining.length === 0) {
      set({
        sessions: [],
        current_session: "",
        user: undefined,
        tokens: undefined,
        isSignedIn: false,
        accessDenied: false,
      })
      return
    }
    const nextCurrent =
      sessionId === current_session ? remaining[0]!.id : current_session
    set({
      sessions: remaining,
      current_session: nextCurrent,
      accessDenied: false,
      ...syncActiveSessionFields(remaining, nextCurrent),
    })
  },
  signOutAll: () => {
    void callSignOutEndpoint()
    set((state) => ({
      sessions: state.sessions.map((s) => ({ ...s, tokens: undefined })),
      current_session: "",
      user: undefined,
      tokens: undefined,
      isSignedIn: false,
      accessDenied: false,
    }))
  },
  signOut: () => {
    const { current_session, sessions } = get()
    void callSignOutEndpoint()
    const sessionsNext = sessions.map((s) =>
      s.id === current_session ? { ...s, tokens: undefined } : s,
    )
    set({
      sessions: sessionsNext,
      current_session: "",
      user: undefined,
      tokens: undefined,
      isSignedIn: false,
      accessDenied: false,
    })
  },
  setAccessToken: (access_token) =>
    set((state) => {
      const tokens: Tokens = {
        access_token,
        refresh_token: state.tokens?.refresh_token ?? "",
      }
      const sessions = state.sessions.map((s) =>
        s.id === state.current_session ? { ...s, tokens } : s,
      )
      return { tokens, sessions }
    }),
  signInUser: (props) => {
    const { user, tokens, sessionId } = props
    if (!tokens) return

    set((state) => {
      if (user) {
        const id = sessionId ?? sessionIdForUser(user)
        const without = state.sessions.filter((s) => s.id !== id)
        const sessions: AuthSession[] = [...without, { id, user, tokens }]
        return {
          sessions,
          current_session: id,
          accessDenied: false,
          ...syncActiveSessionFields(sessions, id),
        }
      }

      // Tokens-only (reauthorize / tests): update the active session when possible.
      const id = sessionId ?? state.current_session
      if (id && state.sessions.some((s) => s.id === id)) {
        const sessions = state.sessions.map((s) =>
          s.id === id ? { ...s, tokens } : s,
        )
        return {
          sessions,
          current_session: id,
          accessDenied: false,
          ...syncActiveSessionFields(sessions, id),
        }
      }

      return {
        tokens,
        isSignedIn: true,
        accessDenied: false,
      }
    })
  },
})

export function useSignOutApi() {
  return ApiService.fetchData({
    url: "/api/authorization/sign-out",
    method: "post",
  })
}

const useAuthorizationStore = create<AuthorizationState>()(
  devtools(
    persist(authorizationStore, {
      name: "authorization-storage",
      storage: createJSONStorage(() => createAuthorizationPersistStorage()),
      partialize: (state) => ({
        sessions: state.sessions,
        current_session: state.current_session,
        redirectUrl: state.redirectUrl,
      }),
      merge: (persistedState, currentState) => {
        const migrated = migratePersistedAuthorization(
          persistedState as Partial<AuthorizationState>,
        )
        let currentSession = migrated.current_session
        const active = migrated.sessions.find((s) => s.id === currentSession)
        if (currentSession && (!active || !sessionHasTokens(active))) {
          currentSession = ""
        }
        return {
          ...currentState,
          sessions: migrated.sessions,
          current_session: currentSession,
          redirectUrl:
            (persistedState as Partial<AuthorizationState>)?.redirectUrl ??
            currentState.redirectUrl,
          ...syncActiveSessionFields(migrated.sessions, currentSession),
        }
      },
    }),
    {
      name: "authorization-storage",
      enabled: import.meta.env.DEV,
    },
  ),
)

export default useAuthorizationStore
