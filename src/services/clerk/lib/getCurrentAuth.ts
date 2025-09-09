import { env } from "@/data/env/client";
import { getOrganizationIdTag } from "@/features/organizations/cache/organization";
import { getUserIdTag } from "@/features/users/cache/users";
import { FullOrganization, FullUser } from "@/types";
import { auth } from "@clerk/nextjs/server";

export async function getCurrentUser({ allData = false } = {}) {
  const { userId, getToken } = await auth();

  return {
    userId,
    user:
      allData && userId != null
        ? await getUser(await getToken(), userId)
        : undefined,
  };
}

async function getUser(token: string | null, id: string) {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/user/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: {
        tags: [getUserIdTag(id)],
      },
    });

    const json: FullUser = await response.json();

    return json;
  } catch (err) {
    console.log("Network error", err);
    return null;
  }
}
export async function getCurrentOrganization({ allData = false } = {}) {
  const { orgId, getToken } = await auth();
  return {
    orgId,
    organization:
      allData && orgId != null
        ? await getOrganization(await getToken(), orgId)
        : undefined,
  };
}

async function getOrganization(token: string | null, id: string) {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/org/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: {
        tags: [getOrganizationIdTag(id)],
      },
    });

    const json: FullOrganization = await response.json();

    return json;
  } catch (err) {
    console.log("Network error", err);
    return null;
  }
}
