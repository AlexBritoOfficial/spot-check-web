import type { Enums } from "./database.types";

export type SpotType = Enums<"spot_type">;
export type Feature = Enums<"feature">;
export type Difficulty = Enums<"difficulty">;
export type Status = Enums<"spot_status">;

export type Spot = {
  id: string;
  ownerId: string | null;
  name: string;
  city: string;
  spotType: SpotType;
  description: string | null;
  features: Feature[];
  difficulty: Difficulty;
  isSkateable: boolean;
  isPublic: boolean;
  rating: number;
  latLng: { lat: number; lng: number };
  photo: string | null;
  status: Status;
  createdAt: string;
  distanceMeters?: number;
};
