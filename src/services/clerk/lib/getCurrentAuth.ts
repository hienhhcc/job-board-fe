import { env } from "@/data/env/client";
import { getUserIdTag } from "@/features/users/cache/users";
import { FullUser } from "@/types";
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
