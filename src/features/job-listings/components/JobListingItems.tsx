import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { env } from "@/data/env/client";
import { getJobListingGlobalTag } from "@/features/job-listings/cache";
import { convertSearchParamsToString } from "@/lib/convertSearchParamsToString";
import { cn } from "@/lib/utils";
import {
  APIResponse,
  experienceLevels,
  FullJobListing,
  FullOrganization,
  jobListingTypes,
  locationRequirements,
} from "@/types";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Suspense } from "react";
import { differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import JobListingBadges from "@/features/job-listings/components/JobListingBadges";
import z from "zod";

async function getJobListings({
  jobListingId,
  searchParams,
}: {
  jobListingId?: string | null;
  searchParams: z.infer<typeof searchParamsSchema>;
}): Promise<APIResponse<
  (FullJobListing & { organization: { name: string; imageUrl: string } })[]
> | null> {
  const { getToken } = await auth();
  const token = await getToken();

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/job-listings?${convertSearchParamsToString({
        ...searchParams,
        jobListingId: jobListingId ?? undefined,
      })}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: {
          tags: [getJobListingGlobalTag()],
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

type Props = {
  searchParamsPromise: Promise<Record<string, string | string[] | undefined>>;
  paramsPromise?: Promise<{ jobListingId: string }>;
};

const searchParamsSchema = z.object({
  title: z.string().optional().catch(undefined),
  city: z.string().optional().catch(undefined),
  state: z.string().optional().catch(undefined),
  experience: z.enum(experienceLevels).optional().catch(undefined),
  locationRequirement: z.enum(locationRequirements).optional().catch(undefined),
  type: z.enum(jobListingTypes).optional().catch(undefined),
  jobIds: z
    .union([z.string(), z.array(z.string())])
    .transform((v) => (Array.isArray(v) ? v : [v]))
    .optional()
    .catch([]),
});

export default function JobListingItems(props: Props) {
  return (
    <Suspense>
      <SuspendedComponent {...props} />
    </Suspense>
  );
}

async function SuspendedComponent({
  searchParamsPromise,
  paramsPromise,
}: Props) {
  const jobListingId = paramsPromise
    ? (await paramsPromise).jobListingId
    : undefined;

  const { success, data } = searchParamsSchema.safeParse(
    await searchParamsPromise
  );
  const searchParams = success ? data : {};

  const response = await getJobListings({ jobListingId, searchParams });

  if (!response || response.success === false || response.data.length === 0) {
    return (
      <div className="text-muted-foreground p-4">No job listings found</div>
    );
  }

  const jobListings = response.data;

  return (
    <div className="space-y-4">
      {jobListings.map((jobListing) => (
        <Link
          key={jobListing.id}
          className="block"
          href={`/job-listings/${jobListing.id}?${convertSearchParamsToString(
            searchParams
          )}`}
        >
          <JobListingListItem
            jobListing={jobListing}
            organization={jobListing.organization}
          />
        </Link>
      ))}
    </div>
  );
}

function JobListingListItem({
  jobListing,
  organization,
}: {
  jobListing: Pick<
    FullJobListing,
    | "title"
    | "stateAbbreviation"
    | "city"
    | "wage"
    | "wageInterval"
    | "experienceLevel"
    | "type"
    | "postedAt"
    | "locationRequirement"
    | "isFeatured"
  >;
  organization: Pick<FullOrganization, "name" | "imageUrl">;
}) {
  const nameInitials = organization?.name
    .split(" ")
    .splice(0, 4)
    .map((w) => w[0])
    .join("");

  return (
    <Card
      className={cn(
        "@container",
        jobListing.isFeatured && "border-featured bg-featured/20"
      )}
    >
      <CardHeader>
        <div className="flex gap-4">
          <Avatar className="size-14 @max-sm:hidden">
            <AvatarImage
              src={organization.imageUrl ?? undefined}
              alt={organization.name}
            />
            <AvatarFallback className="uppercase bg-primary text-primary-foreground">
              {nameInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl">{jobListing.title}</CardTitle>
            <CardDescription className="text-base">
              {organization.name}
            </CardDescription>
            {jobListing.postedAt != null && (
              <div className="text-sm font-medium text-primary @min-md:hidden">
                <Suspense
                  fallback={new Date(jobListing.postedAt).toLocaleDateString()}
                >
                  <DaysSincePosting postedAt={jobListing.postedAt} />
                </Suspense>
              </div>
            )}
          </div>
          {jobListing.postedAt != null && (
            <div className="text-sm font-medium text-primary ml-auto @max-md:hidden">
              <Suspense
                fallback={new Date(jobListing.postedAt).toLocaleDateString()}
              >
                <DaysSincePosting postedAt={jobListing.postedAt} />
              </Suspense>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <JobListingBadges
          jobListing={jobListing}
          className={jobListing.isFeatured ? "border-primary/35" : undefined}
        />
      </CardContent>
    </Card>
  );
}

async function DaysSincePosting({ postedAt }: { postedAt: Date }) {
  const daysSincePosted = differenceInDays(postedAt, Date.now());

  if (daysSincePosted === 0) {
    return <Badge>New</Badge>;
  }

  return new Intl.RelativeTimeFormat(undefined, {
    style: "narrow",
    numeric: "always",
  }).format(daysSincePosted, "days");
}
