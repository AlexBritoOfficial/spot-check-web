import { createClient, withSessionCookies } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { supabase, cookieResponse } = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return withSessionCookies(NextResponse.json({ user: null }), cookieResponse);
  }

  // profiles is readable by any authenticated user (see the RLS
  // migration), so this is just reading our own row back.
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, home_city")
    .eq("id", user.id)
    .maybeSingle();

  return withSessionCookies(
    NextResponse.json({
      user: {
        id: user.id,
        email: user.email ?? null,
        username: profile?.username ?? null,
        homeCity: profile?.home_city ?? null,
      },
    }),
    cookieResponse,
  );
}
