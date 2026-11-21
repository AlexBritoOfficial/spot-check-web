import { createClient, withSessionCookies } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { supabase, cookieResponse } = createClient(request);
  await supabase.auth.signOut();

  return withSessionCookies(new NextResponse(null, { status: 204 }), cookieResponse);
}
