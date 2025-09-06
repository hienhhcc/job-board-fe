import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getUserNotificationSettingsGlobalTag() {
  return getGlobalTag("userNotificationSettings");
}

export function getUserNotificationSettingsIdTag(id: string) {
  return getIdTag({ id, tag: "userNotificationSettings" });
}

export function revalidateUserNotificationSetingsCache(id: string) {
  revalidateTag(getUserNotificationSettingsGlobalTag());
  revalidateTag(getUserNotificationSettingsIdTag(id));
}
