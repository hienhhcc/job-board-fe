"use server";

import { env } from "@/data/env/client";
import { jobListingSchema } from "@/features/job-listings/actions/schemas";
import { revalidateJobListingTag } from "@/features/job-listings/cache";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { FullJobListing } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

async function insertJobListing(data: z.infer<typeof jobListingSchema>) {
  const { getToken, orgId } = await auth();

  const token = await getToken();

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/job-listing/org/${orgId}`,
      {
        method: "POST",
        body: JSON.stringify({
          ...data,
          status: "draft",
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
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

export async function createJobListing(
  unsafeData: z.infer<typeof jobListingSchema>
) {
  const { orgId } = await getCurrentOrganization();

  if (orgId == null) {
    return {
      error: true,
      message: "You don't have a permission to create a job listing",
    };
  }

  const { success, data } = jobListingSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: "There was an error creating your job listing",
    };
  }

  const jobListing = await insertJobListing({
    ...data,
  });

  if (!jobListing) {
    return null;
  }

  revalidateJobListingTag({ id: jobListing.id, orgId });
  redirect(`/employer/job-listings/${jobListing.id}`);
}
