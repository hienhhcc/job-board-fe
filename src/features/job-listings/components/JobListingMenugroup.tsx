"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { formatJobListingStatus } from "@/features/job-listings/lib/formatters";
import { FullJobListing, JobListingStatus } from "@/types";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type JobListing = Pick<FullJobListing, "id" | "title"> & {
  applicationCount: number;
};

type JobListingMenuGroupProps = {
  status: JobListingStatus;
  jobListings: JobListing[];
};

export function JobListingMenuGroup({
  status,
  jobListings,
}: JobListingMenuGroupProps) {
  const { jobListingId } = useParams();

  return (
    <SidebarMenu>
      <Collapsible
        defaultOpen={
          status !== "delisted" ||
          jobListings.find((job) => job.id === jobListingId) != null
        }
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              {formatJobListingStatus(status)}
              <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {jobListings.map((jobListing) => (
                <JobListingMenuItem key={jobListing.id} {...jobListing} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  );
}

function JobListingMenuItem({ id, title, applicationCount }: JobListing) {
  const { jobListingId } = useParams();

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton isActive={jobListingId === id} asChild>
        <Link href={`/employer/job-listings/${id}`}>
          <span className="truncate">{title}</span>
        </Link>
      </SidebarMenuSubButton>
      {applicationCount > 0 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {applicationCount}
        </div>
      )}
    </SidebarMenuSubItem>
  );
}
