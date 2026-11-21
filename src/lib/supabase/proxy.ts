import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

// Refreshes the Supabase session cookie on every request that isn't
// excluded by proxy.ts's matcher. Route handlers' own Supabase clients
// (src/lib/supabase/server.ts) read cookies but mostly don't rewrite them,
// so without this running first, an access token nearing expiry would never
// get refreshed and signed-in users would be logged out silently.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // The call itself (not its return value) is what matters here — it's
  // what triggers setAll with a refreshed token when the current one is
  // near expiry.
  await supabase.auth.getUser();

  return response;
}
