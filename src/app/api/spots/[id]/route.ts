import { createClient, withSessionCookies } from "@/lib/supabase/server";
import { spotSchema } from "@/app/lib/spotSchema";
import { reshapeSpot } from "../reshape";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = spotSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 },
    );
  }

  const { latLng, ...rest } = result.data;
  const { supabase, cookieResponse } = createClient(request);

  // rating/status are deliberately not sent: the column-level GRANT in
  // 20261118155807_rls.sql only lets `authenticated` write the columns
  // listed below. Including rating or status here would fail the whole
  // update with a column-permission error, not silently ignore them.
  const { data: spot, error } = await supabase
    .from("spots")
    .update({
      name: rest.name,
      city: rest.city,
      spot_type: rest.spotType,
      description: rest.description,
      features: rest.features,
      difficulty: rest.difficulty,
      is_skateable: rest.isSkateable,
      is_public: rest.isPublic,
      photo: rest.photo,
      lat: latLng.lat,
      lng: latLng.lng,
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update spot" },
      { status: 500 },
    );
  }

  // RLS silently returns zero rows rather than throwing — a non-owner's
  // update and an update to a nonexistent id both land here. Collapsed
  // into one 404 on purpose, so a non-owner can't use the response to
  // probe which spot ids exist.
  if (!spot) {
    return NextResponse.json({ error: "Spot not found" }, { status: 404 });
  }

  return withSessionCookies(NextResponse.json(reshapeSpot(spot)), cookieResponse);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { supabase, cookieResponse } = createClient(request);

  const { data: spot, error } = await supabase
    .from("spots")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete spot" },
      { status: 500 },
    );
  }

  if (!spot) {
    return NextResponse.json({ error: "Spot not found" }, { status: 404 });
  }

  return withSessionCookies(new NextResponse(null, { status: 204 }), cookieResponse);
}
