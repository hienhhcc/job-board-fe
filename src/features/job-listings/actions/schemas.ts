import {
  experienceLevels,
  jobListingTypes,
  locationRequirements,
  wageIntervals,
} from "@/types";
import { z } from "zod";

export const jobListingSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    experienceLevel: z.enum(experienceLevels),
    locationRequirement: z.enum(locationRequirements),
    type: z.enum(jobListingTypes),
    wage: z.number().int().positive().min(1).nullable(),
    wageInterval: z.enum(wageIntervals),
    stateAbbreviation: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val))
      .nullable(),
    city: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val))
      .nullable(),
  })
  .refine(
    (listing) => {
      return listing.locationRequirement === "remote" || listing.city != null;
    },
    {
      error: "Required for non-remote listings",
      path: ["city"],
    }
  )
  .refine(
    (listing) => {
      return (
        listing.locationRequirement === "remote" ||
        listing.stateAbbreviation != null
      );
    },
    {
      error: "Required for non-remote listings",
      path: ["stateAbbreviation"],
    }
  );
