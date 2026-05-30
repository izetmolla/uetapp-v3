import type { StateStorage } from "zustand/middleware"

import type { AuthSession } from "../types"

/** Shape written to localStorage (no zustand `state` / `version` wrapper). */
export interface PersistedAuthorizationSnapshot {
  sessions: AuthSession[]
  current_session: string
  redirectUrl?: string
}

function isZustandPersistEnvelope(
  value: unknown,
): value is { state: PersistedAuthorizationSnapshot; version?: number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "state" in value &&
    typeof (value as { state: unknown }).state === "object"
  )
}

function parseSnapshot(raw: string | null): PersistedAuthorizationSnapshot | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (isZustandPersistEnvelope(parsed)) {
      return parsed.state
    }
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "sessions" in parsed &&
      Array.isArray((parsed as PersistedAuthorizationSnapshot).sessions)
    ) {
      return parsed as PersistedAuthorizationSnapshot
    }
    return null
  } catch {
    return null
  }
}

/**
 * Persists authorization as a flat JSON object in localStorage:
 * `{ sessions, current_session, redirectUrl }`
 *
 * Zustand persist still uses an internal envelope at runtime; this adapter
 * strips it on write and restores it on read (also reads legacy wrapped blobs).
 */
export function createAuthorizationPersistStorage(): StateStorage {
  return {
    getItem: (name) => {
      const snapshot = parseSnapshot(localStorage.getItem(name))
      if (!snapshot) return null
      return JSON.stringify({ state: snapshot, version: 0 })
    },
    setItem: (name, value) => {
      try {
        const parsed: unknown = JSON.parse(value)
        const snapshot = isZustandPersistEnvelope(parsed)
          ? parsed.state
          : (parsed as PersistedAuthorizationSnapshot)
        localStorage.setItem(name, JSON.stringify(snapshot))
      } catch {
        localStorage.setItem(name, value)
      }
    },
    removeItem: (name) => {
      localStorage.removeItem(name)
    },
  }
}
