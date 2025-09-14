"use server";

import { z } from "zod";
import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/lib/getCurrentAuth";
import { organizationUserSettingsSchema } from "@/features/organizations/actions/schemas";
import { APIResponse, FullOrganizationUserSettings } from "@/types";
import {
  getOrganizationUserSettingsIdTag,
  revalidateOrganizationUserSettingsCache,
} from "@/features/organizations/cache/organizationUserSettings";
import { env } from "@/data/env/client";
import { auth } from "@clerk/nextjs/server";

export async function updateOrganizationUserSettings(
  unsafeData: z.infer<typeof organizationUserSettingsSchema>
) {
  const { userId } = await getCurrentUser();
  const { orgId } = await getCurrentOrganization();
  if (userId == null || orgId == null) {
    return {
      error: true,
      message: "You must be signed in to update notification settings",
    };
  }

  const { success, data } =
    organizationUserSettingsSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "There was an error updating your notification settings",
    };
  }

  await updateOrganizationUserSettingsDb(
    {
      userId,
      organizationId: orgId,
    },
    data
  );

  revalidateOrganizationUserSettingsCache({ userId, organizationId: orgId });

  return {
    error: false,
    message: "Successfully updated your notification settings",
  };
}
export async function updateOrganizationUserSettingsDb(
  {
    userId,
    organizationId,
  }: {
    userId: string;
    organizationId: string;
  },
  settings: Partial<
    Omit<
      FullOrganizationUserSettings,
      "userId" | "organizationId" | "createdAt" | "updatedAt"
    >
  >
): Promise<APIResponse<FullOrganizationUserSettings> | null> {
  const { getToken } = await auth();
  const token = await getToken();

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/org/${organizationId}/user/${userId}/settings`,
      {
        method: "PATCH",
        body: JSON.stringify(settings),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        next: {
          tags: [getOrganizationUserSettingsIdTag({ userId, organizationId })],
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
