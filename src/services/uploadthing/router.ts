import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getCurrentUser } from "../clerk/lib/getCurrentAuth";
import { uploadthing } from "@/services/uploadthing/client";
import { env } from "@/data/env/client";
import { auth } from "@clerk/nextjs/server";
import { APIResponse, FullUserResume } from "@/types";
import { getUserResume } from "@/app/(job-seeker)/job-listings/[jobListingId]/page";
import { revalidateUserResumeCache } from "@/features/users/cache/userResume";

const f = createUploadthing();

export const customFileRouter = {
  resumeUploader: f(
    {
      pdf: {
        maxFileSize: "8MB",
        maxFileCount: 1,
      },
    },
    { awaitServerData: true }
  )
    .middleware(async () => {
      const { userId } = await getCurrentUser();
      const { getToken } = await auth();
      const token = await getToken();
      if (userId == null) throw new UploadThingError("Unauthorized");

      return { userId, token };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { userId, token } = metadata;
      const responseUserResume = await getUserResume({ userId, token });
      await upsertUserResume({
        userId,
        data: {
          resumeFileUrl: file.ufsUrl,
          resumeFileKey: file.key,
        },
        token,
      });
      revalidateUserResumeCache({ userId });

      if (!responseUserResume || responseUserResume.success === false) {
        return;
      }

      const resumeFileKey = responseUserResume.data.resumeFileKey;

      if (resumeFileKey != null) {
        await uploadthing.deleteFiles(resumeFileKey);
      }

      await sendInngestResumeUploadedEvent({ userId });

      return { message: "Resume uploaded successfully" };
    }),
} satisfies FileRouter;

export type CustomFileRouter = typeof customFileRouter;

async function sendInngestResumeUploadedEvent({
  userId,
  token,
}: {
  userId: string;
  token?: string | null;
}) {
  const { getToken } = await auth();
  const t = token ? token : await getToken();

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/user/${userId}/resume-uploaded-event`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${t}`,
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

async function upsertUserResume({
  userId,
  data,
  token,
}: {
  userId: string;
  data: { resumeFileUrl: string; resumeFileKey: string };
  token?: string | null;
}): Promise<APIResponse<FullUserResume> | null> {
  const { getToken } = await auth();
  const t = token ? token : await getToken();

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/user/${userId}/resume`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
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
