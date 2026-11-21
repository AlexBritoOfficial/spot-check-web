import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

// Built fresh per request rather than cached like the old prisma.ts
// singleton: a Supabase server client carries the caller's session, so
// reusing one across requests would leak one user's session into another's.
//
// cookieResponse exists only to capture any Set-Cookie writes Supabase makes
// during the call (e.g. a refreshed access token) — the route handler is
// responsible for copying `cookieResponse.cookies` onto whatever response it
// actually returns. Most handlers never trigger a write, making this a
// no-op; sign-in/sign-up/sign-out always do.
export function createClient(request: NextRequest) {
  const cookieResponse = new NextResponse();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  return { supabase, cookieResponse };
}

export function withSessionCookies(
  response: NextResponse,
  cookieResponse: NextResponse,
): NextResponse {
  cookieResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });
  return response;
}
