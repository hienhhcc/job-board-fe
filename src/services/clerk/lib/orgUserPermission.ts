import { auth } from "@clerk/nextjs/server";

type UserPermission =
  | "job_listing:applicant_change_rating"
  | "job_listing:applicant_change_stage"
  | "job_listing:change_status"
  | "job_listing:create_job_listing"
  | "job_listing:delete_job_listing"
  | "job_listing:update_job_listing"
  | "job_listing:applicant_change_stage";

export async function hasOrgUserPermission(permission: UserPermission) {
  const { has } = await auth();

  return has({ permission });
}
