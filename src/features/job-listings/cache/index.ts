import { getGlobalTag, getIdTag, getOrganizationTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getJobListingGlobalTag() {
  return getGlobalTag("jobListings");
}

export function getJobListingOrganizationTag(orgId: string) {
  return getOrganizationTag({ id: orgId, tag: "jobListings" });
}

export function getJobListingIdTag(id: string) {
  return getIdTag({ id, tag: "jobListings" });
}

export function revalidateJobListingTag({
  id,
  orgId,
}: {
  id: string;
  orgId: string;
}) {
  revalidateTag(getJobListingGlobalTag());
  revalidateTag(getJobListingOrganizationTag(orgId));
  revalidateTag(getJobListingIdTag(id));
}
