import { beforeEach, describe, expect, it } from "vitest"

import useAuthorizationStore, {
  getActiveSession,
  migratePersistedAuthorization,
} from "./authorization"
import type { User, Tokens } from "../types"

const userA: User = {
  id: "user-a",
  email: "a@test.com",
  first_name: "Ada",
  created_at: "",
  roles: [],
}

const userB: User = {
  id: "user-b",
  email: "b@test.com",
  first_name: "Bob",
  created_at: "",
  roles: [],
}

const tokensA: Tokens = { access_token: "access-a", refresh_token: "refresh-a" }
const tokensB: Tokens = { access_token: "access-b", refresh_token: "refresh-b" }

describe("authorization store (multi-session)", () => {
  beforeEach(() => {
    useAuthorizationStore.setState({
      current_session: "",
      sessions: [],
      user: undefined,
      tokens: undefined,
      isSignedIn: false,
      redirectUrl: "",
      accessDenied: false,
    })
  })

  it("signInUser adds a session and sets current_session", () => {
    useAuthorizationStore.getState().signInUser({ user: userA, tokens: tokensA })

    const state = useAuthorizationStore.getState()
    expect(state.current_session).toBe("user-a")
    expect(state.sessions).toHaveLength(1)
    expect(state.user?.id).toBe("user-a")
    expect(state.tokens?.access_token).toBe("access-a")
    expect(getActiveSession(state)?.user.email).toBe("a@test.com")
  })

  it("keeps multiple users and resolves active by current_session", () => {
    useAuthorizationStore.getState().signInUser({ user: userA, tokens: tokensA })
    useAuthorizationStore.getState().signInUser({ user: userB, tokens: tokensB })

    let state = useAuthorizationStore.getState()
    expect(state.sessions).toHaveLength(2)
    expect(state.current_session).toBe("user-b")
    expect(state.user?.id).toBe("user-b")

    useAuthorizationStore.getState().setCurrentSession("user-a")
    state = useAuthorizationStore.getState()
    expect(state.current_session).toBe("user-a")
    expect(state.tokens?.access_token).toBe("access-a")
  })

  it("signOut clears tokens and current_session but keeps user shortcut", () => {
    useAuthorizationStore.getState().signInUser({ user: userA, tokens: tokensA })
    useAuthorizationStore.getState().signOut()

    const state = useAuthorizationStore.getState()
    expect(state.sessions).toHaveLength(1)
    expect(state.sessions[0]?.user.id).toBe("user-a")
    expect(state.sessions[0]?.tokens).toBeUndefined()
    expect(state.sessions[0]?.trusted).toBe(false)
    expect(state.current_session).toBe("")
    expect(state.isSignedIn).toBe(false)
    expect(state.user).toBeUndefined()
  })

  it("signOut clears trusted device but keeps session in the list", () => {
    useAuthorizationStore.getState().signInUser({ user: userA, tokens: tokensA })
    useAuthorizationStore.getState().setSessionTrusted("user-a", true)
    useAuthorizationStore.getState().signOut()

    const session = useAuthorizationStore.getState().sessions[0]
    expect(session?.user.email).toBe("a@test.com")
    expect(session?.trusted).toBe(false)
    expect(session?.tokens).toBeUndefined()
  })

  it("signOut does not remove other signed-in sessions or auto-switch", () => {
    useAuthorizationStore.getState().signInUser({ user: userA, tokens: tokensA })
    useAuthorizationStore.getState().signInUser({ user: userB, tokens: tokensB })
    useAuthorizationStore.getState().setCurrentSession("user-a")
    useAuthorizationStore.getState().signOut()

    const state = useAuthorizationStore.getState()
    expect(state.sessions).toHaveLength(2)
    expect(state.current_session).toBe("")
    expect(state.isSignedIn).toBe(false)
    const a = state.sessions.find((s) => s.id === "user-a")
    const b = state.sessions.find((s) => s.id === "user-b")
    expect(a?.tokens).toBeUndefined()
    expect(b?.tokens?.access_token).toBe("access-b")
  })

  it("migrates legacy flat user/tokens persistence", () => {
    const migrated = migratePersistedAuthorization({
      user: userA,
      tokens: tokensA,
      isSignedIn: true,
    })
    expect(migrated.sessions).toHaveLength(1)
    expect(migrated.sessions[0]?.id).toBe("user-a")
    expect(migrated.current_session).toBe("user-a")
  })
})
