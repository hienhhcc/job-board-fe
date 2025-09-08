import { getJobListing } from "@/app/employer/job-listings/[jobListingId]/page";
import { Card, CardContent } from "@/components/ui/card";
import JobListingForm from "@/features/job-listings/components/JobListingForm";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default function EditJobListingPage(
  props: PageProps<"/employer/job-listings/[jobListingId]/edit">
) {
  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Edit Job Listing</h1>
      <p className="text-muted-foreground mb-6">
        This does not post the listing yet. It just saves a draft.
      </p>
      <Card>
        <CardContent>
          <Suspense>
            <SuspendedPage {...props} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function SuspendedPage({
  params,
}: PageProps<"/employer/job-listings/[jobListingId]/edit">) {
  const { jobListingId } = await params;
  const { orgId } = await getCurrentOrganization();

  if (orgId == null) return notFound();

  const jobListing = await getJobListing(jobListingId, orgId);

  if (jobListing == null) notFound();

  return <JobListingForm jobListing={jobListing} />;
}
