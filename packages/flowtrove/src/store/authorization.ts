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

const authorizationStore: StateCreator<AuthorizationState> = (set) => ({
  user: undefined,
  tokens: undefined,
  isSignedIn: false,
  redirectUrl: "",
  sessions: [],
  setRedirectUrl: (url) => set({ redirectUrl: url }),
  signIn: (isSignedIn) => set({ isSignedIn }),
  signOut: () =>
    set({
      user: undefined,
      tokens: undefined,
      isSignedIn: false,
    }),
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
    url: "/auth/sign-out",
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
