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
