import { ActionButton } from "@/components/ActionButton";
import { AsyncIf } from "@/components/AsyncIf";
import LoadingSpinner from "@/components/LoadingSpinner";
import { MarkdownPartial } from "@/components/markdown/MarkdownPartial";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { env } from "@/data/env/client";
import {
  toggleJobListingFeatured,
  toggleJobListingStatus,
} from "@/features/job-listings/actions/actions";
import { getJobListingOrganizationTag } from "@/features/job-listings/cache";
import DeleteJobListingButton from "@/features/job-listings/components/DeleteJobListingButton";
import EditJobListingButton from "@/features/job-listings/components/EditJobListingButton";
import JobListingBadges from "@/features/job-listings/components/JobListingBadges";
import { formatJobListingStatus } from "@/features/job-listings/lib/formatters";
import {
  hasReachedMaxFeaturedJobListings,
  hasReachedMaxPublishedJobListings,
} from "@/features/job-listings/lib/planFeatureHelpers";
import { getNextJobListingStatus } from "@/features/job-listings/lib/utils";
import { getJobListingApplicationByJobListingTag } from "@/features/jobListingApplications/cache/jobListingApplications";
import { ApplicationTable } from "@/features/jobListingApplications/components/ApplicationTable";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermission";
import {
  APIResponse,
  ApplicationStage,
  FullJobListing,
  JobListingStatus,
} from "@/types";
import { auth } from "@clerk/nextjs/server";
import { EyeIcon, EyeOffIcon, StarIcon, StarOffIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode, Suspense } from "react";

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
    <div className="space-y-6 max-w-6xl mx-auto p-4 @container">
      <div className="flex items-center justify-between gap-4 @max-4xl:flex-col @max-4xl:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {jobListing.title}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge>{formatJobListingStatus(jobListing.status)}</Badge>
            <JobListingBadges jobListing={jobListing} />
          </div>
        </div>
        <div className="flex items-center gap-2 empty:-mt:4">
          <EditJobListingButton jobListingId={jobListing.id} />
          <StatusUpdateButton status={jobListing.status} id={jobListing.id} />
          {jobListing.status === "published" && (
            <FeaturedToggleButton
              isFeatured={jobListing.isFeatured}
              id={jobListing.id}
            />
          )}
          <DeleteJobListingButton jobListingId={jobListing.id} />
        </div>
      </div>

      <MarkdownPartial
        dialogMarkdown={<MarkdownRenderer source={jobListing.description} />}
        mainMarkdown={
          <MarkdownRenderer
            source={jobListing.description}
            className="prose-sm"
          />
        }
        dialogTitle="Description"
      />

      <Separator />
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Application</h2>
        <Suspense fallback={<SkeletonApplicationTable />}>
          <Applications jobListingId={jobListingId} />
        </Suspense>
      </div>
    </div>
  );
}

function SkeletonApplicationTable() {
  return (
    <ApplicationTable
      applications={[]}
      canUpdateRating={false}
      canUpdateStage={false}
      disableToolbar
      noResultsMessage={<LoadingSpinner className="size-12" />}
    />
  );
}

async function Applications({ jobListingId }: { jobListingId: string }) {
  const response = await getJobListingApplications(jobListingId);

  if (response == null || response?.success === false) return null;

  return (
    <ApplicationTable
      applications={
        response.data.map((a) => ({
          ...a,
          user: {
            ...a.user,
            resume: a.user.resume
              ? {
                  ...a.user.resume,
                  mardownSummary: a.user.resume.aiSummary ? (
                    <MarkdownRenderer source={a.user.resume.aiSummary} />
                  ) : null,
                }
              : null,
          },
          coverLetterMarkdown: a.coverLetter ? (
            <MarkdownRenderer source={a.coverLetter} />
          ) : null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        })) as any
      }
      canUpdateRating={await hasOrgUserPermission(
        "job_listing:applicant_change_rating"
      )}
      canUpdateStage={await hasOrgUserPermission(
        "job_listing:applicant_change_stage"
      )}
    />
  );
}

function FeaturedToggleButton({
  isFeatured,
  id,
}: {
  isFeatured: boolean;
  id: string;
}) {
  const button = (
    <ActionButton
      action={toggleJobListingFeatured.bind(null, id)}
      variant="outline"
    >
      {featuredToggleButtonText(isFeatured)}
    </ActionButton>
  );

  return (
    <AsyncIf
      condition={() => hasOrgUserPermission("job_listing:change_status")}
    >
      {isFeatured ? (
        button
      ) : (
        <AsyncIf
          condition={async () => {
            const isMaxed = await hasReachedMaxFeaturedJobListings();
            return !isMaxed;
          }}
          otherwise={
            <UpgradePopover
              buttonText={featuredToggleButtonText(isFeatured)}
              popoverText="You must upgrade your plan to feature more job listings."
            />
          }
        >
          {button}
        </AsyncIf>
      )}
    </AsyncIf>
  );
}

function StatusUpdateButton({
  status,
  id,
}: {
  status: JobListingStatus;
  id: string;
}) {
  const button = (
    <ActionButton
      action={toggleJobListingStatus.bind(null, id)}
      variant="outline"
      requireAreYouSure={getNextJobListingStatus(status) === "published"}
      areYouSureDescription="This will immediately show this job listing to all users."
    >
      {statusToggleButtonText(status)}
    </ActionButton>
  );

  return (
    <AsyncIf
      condition={() => hasOrgUserPermission("job_listing:change_status")}
    >
      {getNextJobListingStatus(status) === "published" ? (
        <AsyncIf
          condition={async () => {
            const isMaxed = await hasReachedMaxPublishedJobListings();

            return !isMaxed;
          }}
          otherwise={
            <UpgradePopover
              buttonText={statusToggleButtonText(status)}
              popoverText="You must upgrade your plan to publish more job listings."
            />
          }
        >
          {button}
        </AsyncIf>
      ) : (
        button
      )}
    </AsyncIf>
  );
}

function UpgradePopover({
  buttonText,
  popoverText,
}: {
  buttonText: ReactNode;
  popoverText: ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{buttonText}</Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2">
        {popoverText}
        <Button asChild>
          <Link href="/employer/pricing">Upgrade Plan</Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
}

function featuredToggleButtonText(isFeatured: boolean) {
  if (isFeatured) {
    return (
      <>
        <StarOffIcon className="size-4" />
        UnFeature
      </>
    );
  }

  return (
    <>
      <StarIcon className="size-4" />
      Feature
    </>
  );
}

function statusToggleButtonText(status: JobListingStatus) {
  switch (status) {
    case "delisted":
    case "draft":
      return (
        <>
          <EyeIcon className="size-4" />
          Publish
        </>
      );
    case "published":
      return (
        <>
          <EyeOffIcon className="size-4" />
          Delist
        </>
      );
    default:
      throw new Error(`Unknown status: ${status satisfies never}`);
  }
}

export async function getJobListingApplications(
  jobListingId: string
): Promise<APIResponse<
  {
    coverLetter: string;
    jobListingId: string;
    createdAt: Date;
    stage: ApplicationStage;
    user: {
      id: string;
      name: string;
      imageUrl: string;
      resume: { aiSummary: null; resumeFileUrl: string };
    };
    rating: number;
  }[]
> | null> {
  const { getToken, orgId } = await auth();

  const token = await getToken();

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/org/${orgId}/job-listings/${jobListingId}/applications`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: {
          tags: [getJobListingApplicationByJobListingTag(jobListingId)],
        },
      }
    );

    const json = await response.json();

    return json;
  } catch (err) {
    console.log("Network error", err);
    return null;
  }
}

export async function getJobListing(jobListingId: string, orgId: string) {
  const { getToken } = await auth();

  const token = await getToken();

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/org/${orgId}/job-listings/${jobListingId}`,
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
