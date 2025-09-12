import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getUserResumeGlobalTag() {
  return getGlobalTag("userResumes");
}

export function getUserResumeIdTag({ userId }: { userId: string }) {
  return getIdTag({ tag: "userResumes", id: userId });
}

export function revalidateUserResumeCache({ userId }: { userId: string }) {
  revalidateTag(getUserResumeGlobalTag());
  revalidateTag(getUserResumeIdTag({ userId }));
}
