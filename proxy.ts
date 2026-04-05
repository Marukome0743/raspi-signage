import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export const PUBLIC_PATHS = ["/dashboard/login", "/dashboard/password-reset"]

export type RoutingDecision =
  | { action: "pass" }
  | { action: "redirect"; destination: string }

export function getRoutingDecision(
  pathname: string,
  isAuthenticated: boolean,
): RoutingDecision {
  if (!pathname.startsWith("/dashboard")) {
    return { action: "pass" }
  }

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return { action: "pass" }
  }

  if (!isAuthenticated) {
    return { action: "redirect", destination: "/dashboard/login" }
  }

  return { action: "pass" }
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          supabaseResponse = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const decision = getRoutingDecision(request.nextUrl.pathname, !!user)

  if (decision.action === "redirect") {
    const redirectUrl = new URL(decision.destination, request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const matcherPattern =
  "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
