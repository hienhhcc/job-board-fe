import { env } from "@/data/env/client";
import { getJobListingOrganizationTag } from "@/features/job-listings/cache";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { FullJobListing } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Props = {
  params: Promise<{ jobListingId: string }>;
};

export default function JobListingPage(props: Props) {
  return (
    <Suspense>
      <SuspendedPage {...props} />
    </Suspense>
  );
}

async function SuspendedPage({ params }: Props) {
  const { orgId } = await getCurrentOrganization();

  if (orgId == null) return null;

  const { jobListingId } = await params;
  const jobListing = await getJobListing(jobListingId, orgId);

  if (jobListing == null) return notFound();

  return (
    <div className="space-y-6 max-w-6xl max-auto p-4 @container">
      <div className="flex items-center justify-between gap-4 @max-4xl:flex-col @max-4xl:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {jobListing.title}
          </h1>
        </div>
      </div>
    </div>
  );
}

async function getJobListing(jobListingId: string, orgId: string) {
  const { getToken } = await auth();

  const token = await getToken();

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/job-listing/org/${orgId}/${jobListingId}`,
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
