import { createClient, withSessionCookies } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = signInSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 },
    );
  }

  const { supabase, cookieResponse } = createClient(request);
  const { data, error } = await supabase.auth.signInWithPassword(
    result.data,
  );

  if (error) {
    return withSessionCookies(
      NextResponse.json({ error: error.message }, { status: 401 }),
      cookieResponse,
    );
  }

  return withSessionCookies(
    NextResponse.json({
      user: { id: data.user.id, email: data.user.email },
    }),
    cookieResponse,
  );
}
