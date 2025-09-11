type CacheTag =
  | "users"
  | "organizations"
  | "jobListings"
  | "userNotificationSettings"
  | "userResumes"
  | "jobListingApplications"
  | "organizationUserSettings";

export function getGlobalTag(tag: CacheTag) {
  return `global:${tag}` as const;
}

export function getJobListingTag(tag: CacheTag, jobListingId: string) {
  return `jobListing:${jobListingId}-${tag}` as const;
}

export function getOrganizationTag({ id, tag }: { tag: CacheTag; id: string }) {
  return `organization:${id}-${tag}` as const;
}

export function getIdTag({ id, tag }: { tag: CacheTag; id: string }) {
  return `id:${id}-${tag}` as const;
}
