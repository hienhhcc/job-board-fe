import { env } from "@/data/env/client";
import { getJobListingOrganizationTag } from "@/features/job-listings/cache";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { FullJobListing } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function EmployerHomePage() {
  return (
    <Suspense>
      <SuspendedPage />
    </Suspense>
  );
}

async function SuspendedPage() {
  const [{ getToken }, { orgId }] = await Promise.all([
    auth(),
    getCurrentOrganization(),
  ]);

  if (orgId == null) return null;

  const jobListing = await getMostRecentJobListing(orgId, await getToken());

  if (jobListing == null) {
    redirect("/employer/job-listings/new");
  } else {
    redirect(`/employer/job-listings/${jobListing.id}`);
  }
}

async function getMostRecentJobListing(orgId: string, token: string | null) {
  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/job-listing/org/${orgId}/recent`,
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

    const json: FullJobListing = await response.json();

    return json;
  } catch (err) {
    console.log("Network error", err);
    return null;
  }
}
