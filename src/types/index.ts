export const wageIntervals = ["hourly", "yearly"] as const;
export type WageInterval = (typeof wageIntervals)[number];

export const locationRequirements = ["remote", "in-office", "hybrid"] as const;
export type LocationRequirement = (typeof locationRequirements)[number];

export const experienceLevels = ["junior", "mid-level", "senior"] as const;
export type ExperienceLevel = (typeof experienceLevels)[number];

export const jobListingStatuses = ["draft", "published", "delisted"] as const;
export type JobListingStatus = (typeof jobListingStatuses)[number];

export const jobListingTypes = [
  "internship",
  "part-time",
  "full-time",
] as const;
export type JobListingType = (typeof jobListingTypes)[number];

export type FullUser = {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FullOrganization = {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FullJobListing = {
  id: string;
  title: string;
  description: string;
  wage: number;
  wageInterval: WageInterval;
  stateAbbreviation: string;
  city: string;
  isFeatured: boolean;
  locationRequirement: LocationRequirement;
  experienceLevel: ExperienceLevel;
  status: JobListingStatus;
  type: JobListingType;
  postedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type APIResponse<T> = ErrorResponse | SuccessResponse<T>;

export type SuccessResponse<T> = {
  success: true;
  data: T;
};

export type ErrorResponse = {
  success: false;
  message: string;
};
