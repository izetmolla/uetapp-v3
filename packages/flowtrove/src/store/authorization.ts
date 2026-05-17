import axios from "axios"
import ApiService from "../lib/network"
import type { Tokens, User } from "../types"
import { create, type StateCreator } from "zustand"
import { devtools } from "zustand/middleware"
import { persist, createJSONStorage } from "zustand/middleware"

export interface AuthorizationState {
  user?: User
  tokens?: Tokens
  isSignedIn: boolean
  redirectUrl?: string
  sessions: string[]
  signIn: (isSignedIn: boolean) => void
  signOut: () => void
  setAccessToken: (token: string) => void
  signInUser: ({ user, tokens }: { user?: User; tokens?: Tokens }) => void
  setRedirectUrl: (url: string) => void
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

const authorizationStore: StateCreator<AuthorizationState> = (set) => ({
  user: undefined,
  tokens: undefined,
  isSignedIn: false,
  redirectUrl: "",
  sessions: [],
  setRedirectUrl: (url) => set({ redirectUrl: url }),
  signIn: (isSignedIn) => set({ isSignedIn }),
  signOut: () => {
    // Fire-and-forget the backend call so the local state still clears
    // even if the network is down. The endpoint is idempotent.
    void callSignOutEndpoint()
    set({
      user: undefined,
      tokens: undefined,
      isSignedIn: false,
    })
  },
  setAccessToken: (access_token) =>
    set((state) => ({
      tokens: {
        access_token,
        refresh_token: state.tokens?.refresh_token ?? "",
      },
    })),
  signInUser: (props) =>
    set({ isSignedIn: true, user: props.user, tokens: props.tokens }),
})

export function useSignOutApi() {
  return ApiService.fetchData({
    url: "/api/authorization/sign-out",
    method: "post",
  })
}

// 5. Create the Zustand store
const useAuthorizationStore = create<AuthorizationState>()(
  devtools(
    persist(authorizationStore, {
      name: "authorization-storage",
      storage: createJSONStorage(() => localStorage),
    }),
    {
      name: "authorization-storage",
      enabled: import.meta.env.DEV,
    }
  )
)

export default useAuthorizationStore
