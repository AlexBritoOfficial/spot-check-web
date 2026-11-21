import { createClient, withSessionCookies } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

// Matches the username check constraint in
// spot-check-iOS/supabase/migrations/20261118155802_profiles_and_auth_trigger.sql
const usernameSchema = z
  .string()
  .regex(/^[a-zA-Z0-9_]{3,30}$/, "3-30 letters, numbers, or underscores");

const signUpSchema = z.object({
  username: usernameSchema,
  email: z.string().email(),
  password: z.string().min(8),
  homeCity: z.string().optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = signUpSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 },
    );
  }

  const { username, email, password, homeCity } = result.data;
  const { supabase, cookieResponse } = createClient(request);

  // handle_new_user() (same migration as above) reads these exact metadata
  // keys to populate the profiles row — no separate profile-creation call
  // needed here.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, home_city: homeCity ?? "" } },
  });

  if (error) {
    return withSessionCookies(
      NextResponse.json({ error: error.message }, { status: 400 }),
      cookieResponse,
    );
  }

  return withSessionCookies(
    NextResponse.json(
      { user: { id: data.user?.id, email: data.user?.email } },
      { status: 201 },
    ),
    cookieResponse,
  );
}
