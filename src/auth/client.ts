import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL:
    typeof window === "undefined"
      ? (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
      : window.location.origin,
})

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
  changePassword,
} = authClient
