import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { env } from "@/data/env/client";
import { getJobListingOrganizationTag } from "@/features/job-listings/cache";
import { JobListingMenuGroup } from "@/features/job-listings/components/JobListingMenugroup";
import { sortJobListingsByStatus } from "@/features/job-listings/lib/utils";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermission";
import { JobListingStatus } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

async function getJobListings(orgId: string) {
  const { getToken } = await auth();
  const token = await getToken();

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/org/${orgId}/job-listing`,
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

    const json: {
      error: boolean;
      message?: string;
      data: {
        id: string;
        title: string;
        status: "draft" | "published" | "delisted";
        applicationCount: number;
      }[];
    } = await response.json();

    return json;
  } catch (err) {
    console.log("Network error", err);
    return null;
  }
}

export default async function JobListingMenu({ orgId }: { orgId: string }) {
  const response = await getJobListings(orgId);

  if (!response || (response && response.error === true)) {
    return null;
  }

  const jobListings = response.data;

  if (
    jobListings.length === 0 &&
    (await hasOrgUserPermission("job_listing:create_job_listing"))
  ) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/employer/job-listings/new">
              <PlusIcon />
              <span>Create your first job listing</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return Object.entries(Object.groupBy(jobListings, (j) => j.status))
    .sort(([a], [b]) => {
      return sortJobListingsByStatus(
        a as JobListingStatus,
        b as JobListingStatus
      );
    })
    .map(([status, value]) => (
      <JobListingMenuGroup
        key={status}
        status={status as JobListingStatus}
        jobListings={value}
      />
    ));
}
