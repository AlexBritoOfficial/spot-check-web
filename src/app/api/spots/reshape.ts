import type { Spot } from "@/types/spot";
import type { Tables } from "@/types/database.types";

// Deliberately not just `Tables<"spots">`: the spots_nearby RPC's return
// row has the same field set minus updated_at, plus distance_meters, so a
// narrower shape lets both row kinds satisfy this without a cast.
type SpotFields = {
  id: string;
  owner_id: string | null;
  name: string;
  city: string;
  spot_type: Tables<"spots">["spot_type"];
  description: string | null;
  features: Tables<"spots">["features"];
  difficulty: Tables<"spots">["difficulty"];
  is_skateable: boolean;
  is_public: boolean;
  rating: number;
  lat: number;
  lng: number;
  photo: string | null;
  status: Tables<"spots">["status"];
  created_at: string;
};

export function reshapeSpot(row: SpotFields): Spot {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    city: row.city,
    spotType: row.spot_type,
    description: row.description,
    features: row.features,
    difficulty: row.difficulty,
    isSkateable: row.is_skateable,
    isPublic: row.is_public,
    rating: row.rating,
    latLng: { lat: row.lat, lng: row.lng },
    photo: row.photo,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function reshapeNearbySpot(
  row: SpotFields & { distance_meters: number },
): Spot {
  return { ...reshapeSpot(row), distanceMeters: row.distance_meters };
}
