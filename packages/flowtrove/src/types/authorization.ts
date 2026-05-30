export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  username?: string
  image?: string
  created_at: string
  roles: string[]
}

export interface Tokens {
  access_token: string
  refresh_token: string
}

/** One account on this browser. `tokens` cleared on sign-out; `user` kept as a login shortcut. */
export interface AuthSession {
  id: string
  user: User
  tokens?: Tokens
  /** When true, resume on this device without a password until sign-out. */
  trusted?: boolean
}

export interface Confirmation {
  message?: string
  type: "email" | "phone" | "device"
  email?: string
  phone?: string
  device?: string
}