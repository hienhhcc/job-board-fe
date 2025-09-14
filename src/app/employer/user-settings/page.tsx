import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { env } from "@/data/env/client";
import { getOrganizationUserSettingsIdTag } from "@/features/organizations/cache/organizationUserSettings";
import { NotificationsForm } from "@/features/organizations/components/NotificationsForm";
import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/lib/getCurrentAuth";
import { APIResponse, FullOrganizationUserSettings } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default function EmployerUserSettingsPage() {
  return (
    <Suspense>
      <SuspendedComponent />
    </Suspense>
  );
}

async function SuspendedComponent() {
  const { userId } = await getCurrentUser();
  const { orgId } = await getCurrentOrganization();
  if (userId == null || orgId == null) return notFound();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
      <Card>
        <CardContent>
          <Suspense fallback={<LoadingSpinner />}>
            <SuspendedForm userId={userId} organizationId={orgId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function SuspendedForm({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId: string;
}) {
  const response = await getNotificationSettings({
    userId,
    organizationId,
  });

  if (response == null || response.success === false) return null;

  const notificationSettings = response.data;

  return <NotificationsForm notificationSettings={notificationSettings} />;
}

async function getNotificationSettings({
  organizationId,
  userId,
}: {
  userId: string;
  organizationId: string;
}): Promise<APIResponse<FullOrganizationUserSettings> | null> {
  const { getToken } = await auth();
  const token = await getToken();

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/org/${organizationId}/user/${userId}/settings`,
      {
        method: "GET",
        headers: {
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
