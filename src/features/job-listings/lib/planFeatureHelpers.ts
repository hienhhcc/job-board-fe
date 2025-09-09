import { env } from "@/data/env/client";
import { getJobListingOrganizationTag } from "@/features/job-listings/cache";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { hasPlanFeature } from "@/services/clerk/lib/planFeatures";
import { auth } from "@clerk/nextjs/server";

export async function hasReachedMaxFeaturedJobListings() {
  const { orgId } = await getCurrentOrganization();

  if (orgId == null) return true;

  const count = await getPublishedJobListingsCount(orgId);

  const canPost = await Promise.all([
    hasPlanFeature("post_1_job_listing").then((has) => has && count < 1),
    hasPlanFeature("post_3_job_listings").then((has) => has && count < 3),
    hasPlanFeature("post_15_job_listings").then((has) => has && count < 15),
  ]);

  return !canPost.some(Boolean);
}

async function getPublishedJobListingsCount(orgId: string) {
  const { getToken } = await auth();

  const token = await getToken();

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/org/${orgId}/job-listing/count-published`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: {
          tags: [getJobListingOrganizationTag(orgId)],
        },
      }
    );

    const json: number = await response.json();

    return json;
  } catch (err) {
    console.log("Network error", err);
    return 0;
  }
}
