import { getGlobalTag, getIdTag, getJobListingTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getJobListingApplicationGlobalTag() {
  return getGlobalTag("jobListingApplications");
}

export function getJobListingApplicationByJobListingTag(jobListingId: string) {
  return getJobListingTag("jobListingApplications", jobListingId);
}

export function getJobListingApplicationIdTag({
  jobListingId,
  userId,
}: {
  jobListingId: string;
  userId: string;
}) {
  return getIdTag({
    tag: "jobListingApplications",
    id: `${jobListingId}-${userId}`,
  });
}

export function revalidateJobListingApplicationCache({
  userId,
  jobListingId,
}: {
  userId: string;
  jobListingId: string;
}) {
  revalidateTag(getJobListingApplicationGlobalTag());
  revalidateTag(getJobListingApplicationByJobListingTag(jobListingId));
  revalidateTag(getJobListingApplicationIdTag({ jobListingId, userId }));
}
