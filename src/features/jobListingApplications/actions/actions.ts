"use server";

import {
  getPublishedJobListingById,
  getUserResume,
} from "@/app/(job-seeker)/job-listings/[jobListingId]/page";
import { env } from "@/data/env/client";
import { newJobListingApplicationSchema } from "@/features/job-listings/actions/schemas";
import { revalidateJobListingApplicationCache } from "@/features/jobListingApplications/cache/jobListingApplications";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { APIResponse, FullJobListingApplication } from "@/types";
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
      `${env.NEXT_PUBLIC_API_URL}/job-listings/${jobListingId}/application`,
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
