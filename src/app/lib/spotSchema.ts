import { Constants } from "@/types/database.types";

import z from "zod";

export const spotSchema = z.object({
  name: z.string().min(1),
  city: z.string().min(1),
  spotType: z.enum(Constants.public.Enums.spot_type),
  description: z.string().optional(),
  features: z.array(z.enum(Constants.public.Enums.feature)),
  difficulty: z.enum(Constants.public.Enums.difficulty),
  isSkateable: z.boolean(),
  isPublic: z.boolean(),
  rating: z.number().min(0).max(5),
  latLng: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  photo: z.string().optional(),
  status: z.enum(Constants.public.Enums.spot_status),
});

export type NewSpot = z.infer<typeof spotSchema>;
