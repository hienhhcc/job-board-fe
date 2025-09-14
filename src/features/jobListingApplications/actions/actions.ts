"use server";

import {
  getPublishedJobListingById,
  getUserResume,
} from "@/app/(job-seeker)/job-listings/[jobListingId]/page";
import { getJobListing } from "@/app/employer/job-listings/[jobListingId]/page";
import { env } from "@/data/env/client";
import { newJobListingApplicationSchema } from "@/features/job-listings/actions/schemas";
import { revalidateJobListingApplicationCache } from "@/features/jobListingApplications/cache/jobListingApplications";
import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/lib/getCurrentAuth";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermission";
import {
  APIResponse,
  ApplicationStage,
  applicationStages,
  FullJobListingApplication,
} from "@/types";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

async function insertJobListingApplicationDb({
  jobListingId,
  coverLetter,
}: {
  jobListingId: string;
  coverLetter: string | null;
}): Promise<APIResponse<FullJobListingApplication> | null> {
  const { getToken } = await auth();
  const token = await getToken();

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/job-listings/${jobListingId}/applications`,
      {
        method: "POST",
        body: JSON.stringify({
          coverLetter,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

export async function createJobListingApplication(
  jobListingId: string,
  unsafeData: z.infer<typeof newJobListingApplicationSchema>
) {
  const permissionError = {
    error: true,
    message: "You don't have permission to submit an application",
  };

  const { userId } = await getCurrentUser();

  if (userId == null) return permissionError;

  const [userResume, jobListing] = await Promise.all([
    getUserResume({ userId }),
    getPublishedJobListingById(jobListingId),
  ]);

  if (userResume == null || jobListing == null) return permissionError;

  const { success, data } =
    newJobListingApplicationSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: "There was an error submitting your application",
    };
  }

  const insertedJobListingApplication = await insertJobListingApplicationDb({
    jobListingId,
    coverLetter: data.coverLetter,
  });

  if (insertedJobListingApplication == null) {
    return {
      error: true,
      message: "There was an error submitting your application",
    };
  }

  revalidateJobListingApplicationCache({ userId, jobListingId });

  return {
    error: false,
    message: "Your application was successfully submitted",
  };
}

export async function updateJobListingApplicationRating(
  { jobListingId, userId }: { jobListingId: string; userId: string },
  unsafeRating: number | null
) {
  const { success, data: rating } = z
    .number()
    .min(1)
    .max(5)
    .nullish()
    .safeParse(unsafeRating);

  if (!success) {
    return {
      error: true,
      message: "Invalid rating",
    };
  }

  if (!(await hasOrgUserPermission("job_listing:applicant_change_rating"))) {
    return {
      error: true,
      message: "You don't have permission to update the rating",
    };
  }

  const { orgId } = await getCurrentOrganization();
  if (orgId == null) {
    return {
      error: true,
      message: "You don't have permission to update the rating",
    };
  }

  const jobListing = await getJobListing(jobListingId, orgId);
  if (jobListing == null || orgId !== jobListing.organizationId) {
    return {
      error: true,
      message: "You don't have permission to update the rating",
    };
  }
  await updateJobListingApplication(
    { jobListingId, userId },
    { rating: rating! }
  );
  revalidateJobListingApplicationCache({ jobListingId, userId });
}

export async function updateJobListingApplicationStage(
  { jobListingId, userId }: { jobListingId: string; userId: string },
  unsafeStage: ApplicationStage
) {
  const { success, data: stage } = z
    .enum(applicationStages)
    .safeParse(unsafeStage);

  if (!success) {
    return {
      error: true,
      message: "Invalid stage",
    };
  }

  if (!(await hasOrgUserPermission("job_listing:applicant_change_stage"))) {
    return {
      error: true,
      message: "You don't have permission to update the stage",
    };
  }

  const { orgId } = await getCurrentOrganization();
  if (orgId == null) {
    return {
      error: true,
      message: "You don't have permission to update the stage",
    };
  }

  const jobListing = await getJobListing(jobListingId, orgId);
  if (jobListing == null || orgId !== jobListing.organizationId) {
    return {
      error: true,
      message: "You don't have permission to update the stage",
    };
  }
  await updateJobListingApplication({ jobListingId, userId }, { stage });
  revalidateJobListingApplicationCache({ jobListingId, userId });
}

export async function updateJobListingApplication(
  {
    jobListingId,
    userId,
  }: {
    jobListingId: string;
    userId: string;
  },
  data: Partial<FullJobListingApplication>
): Promise<APIResponse<FullJobListingApplication> | null> {
  const { getToken } = await auth();

  const token = await getToken();

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/job-listings/${jobListingId}/applications/${userId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
