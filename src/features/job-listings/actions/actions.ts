"use server";

import { getJobListing } from "@/app/employer/job-listings/[jobListingId]/page";
import { env } from "@/data/env/client";
import { jobListingSchema } from "@/features/job-listings/actions/schemas";
import { revalidateJobListingTag } from "@/features/job-listings/cache";
import {
  hasReachedMaxFeaturedJobListings,
  hasReachedMaxPublishedJobListings,
} from "@/features/job-listings/lib/planFeatureHelpers";
import { getNextJobListingStatus } from "@/features/job-listings/lib/utils";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermission";
import { FullJobListing } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

async function insertJobListing(data: z.infer<typeof jobListingSchema>) {
  const { getToken, orgId } = await auth();

  const token = await getToken();

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/org/${orgId}/job-listings`,
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

  if (
    orgId == null ||
    !(await hasOrgUserPermission("job_listing:create_job_listing"))
  ) {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateJobListingDb(id: string, data: any) {
  const { getToken, orgId } = await auth();

  const token = await getToken();

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/org/${orgId}/job-listings/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
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

export async function updateJobListing(
  id: string,
  unsafeData: z.infer<typeof jobListingSchema>
) {
  const { orgId } = await getCurrentOrganization();

  if (
    orgId == null ||
    !(await hasOrgUserPermission("job_listing:update_job_listing"))
  ) {
    return {
      error: true,
      message: "You don't have a permission to update a job listing",
    };
  }

  const { success, data } = jobListingSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: "There was an error updat your job listing",
    };
  }

  const jobListing = await getJobListing(id, orgId);

  if (jobListing == null) {
    return {
      error: true,
      message: "There was an error updating your job listing",
    };
  }

  await updateJobListingDb(id, data);

  revalidateJobListingTag({ id: jobListing.id, orgId });
  redirect(`/employer/job-listings/${jobListing.id}`);
}

export async function toggleJobListingStatus(id: string) {
  const error = {
    error: true,
    message: "You don't have a permission to update a job listing status",
  };

  const { orgId } = await getCurrentOrganization();
  if (orgId == null) return error;

  const jobListing = await getJobListing(id, orgId);
  if (jobListing == null) return error;

  const newStatus = getNextJobListingStatus(jobListing.status);
  if (
    !(await hasOrgUserPermission("job_listing:change_status")) ||
    (newStatus === "published" && (await hasReachedMaxPublishedJobListings()))
  ) {
    return error;
  }

  await updateJobListingDb(id, {
    status: newStatus,
    isFeatured: newStatus === "published" ? undefined : false,
    postedAt:
      newStatus === "published" && jobListing.postedAt == null
        ? new Date()
        : undefined,
  });

  revalidateJobListingTag({ id: jobListing.id, orgId });

  return { error: false };
}

export async function toggleJobListingFeatured(id: string) {
  const error = {
    error: true,
    message:
      "You don't have a permission to update this job listing's featured status",
  };

  const { orgId } = await getCurrentOrganization();
  if (orgId == null) return error;

  const jobListing = await getJobListing(id, orgId);
  if (jobListing == null) return error;

  const newFeaturedStatus = !jobListing.isFeatured;
  if (
    !(await hasOrgUserPermission("job_listing:change_status")) ||
    (newFeaturedStatus && (await hasReachedMaxFeaturedJobListings()))
  ) {
    return error;
  }

  await updateJobListingDb(id, {
    isFeatured: newFeaturedStatus,
  });

  revalidateJobListingTag({ id: jobListing.id, orgId });

  return { error: false };
}

export async function deleteJobListing(id: string) {
  const { orgId } = await getCurrentOrganization();

  if (
    orgId == null ||
    !(await hasOrgUserPermission("job_listing:delete_job_listing"))
  ) {
    return {
      error: true,
      message: "You don't have a permission to delete a job listing",
    };
  }

  const response = await deleteJobListingDb(id);

  if (!response?.success) {
    return {
      error: true,
      message: "There was an error while deleting your job listing",
    };
  }

  revalidateJobListingTag({ id, orgId });
  redirect("/employer");
}

async function deleteJobListingDb(id: string) {
  const { getToken, orgId } = await auth();

  const token = await getToken();

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/org/${orgId}/job-listings/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const json: {
      success: boolean;
      deletedJobListing: { id: string; organizationId: string };
    } = await response.json();

    return json;
  } catch (err) {
    console.log("Network error", err);
    return null;
  }
}
