import { beforeEach, describe, expect, it } from "vitest"

import { createAuthorizationPersistStorage } from "./authorization-persist-storage"

const KEY = "authorization-storage-test"

describe("authorization persist storage", () => {
  const storage = createAuthorizationPersistStorage()

  beforeEach(() => {
    localStorage.removeItem(KEY)
  })

  it("writes flat JSON without state/version wrapper", () => {
    const snapshot = {
      sessions: [
        {
          id: "u1",
          user: {
            id: "u1",
            email: "a@test.com",
            created_at: "",
            roles: [],
          },
        },
      ],
      current_session: "",
      redirectUrl: "",
    }

    storage.setItem(
      KEY,
      JSON.stringify({ state: snapshot, version: 0 }),
    )

    const raw = localStorage.getItem(KEY)
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!)
    expect(parsed).toEqual(snapshot)
    expect(parsed).not.toHaveProperty("state")
    expect(parsed).not.toHaveProperty("version")
  })

  it("reads legacy zustand-wrapped blob from localStorage", () => {
    const snapshot = {
      sessions: [],
      current_session: "u1",
      redirectUrl: "/x",
    }
    localStorage.setItem(
      KEY,
      JSON.stringify({ state: snapshot, version: 0 }),
    )

    const item = storage.getItem(KEY)
    expect(item).toBeTruthy()
    expect(JSON.parse(item!).state).toEqual(snapshot)
  })

  it("reads flat blob written directly", () => {
    const snapshot = {
      sessions: [],
      current_session: "",
      redirectUrl: "",
    }
    localStorage.setItem(KEY, JSON.stringify(snapshot))

    const item = storage.getItem(KEY)
    expect(JSON.parse(item!).state).toEqual(snapshot)
  })
})
