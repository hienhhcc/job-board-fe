import { getUserResume } from "@/app/(job-seeker)/job-listings/[jobListingId]/page";
import { DropzoneClient } from "@/app/(job-seeker)/user-settings/resume/_DropzoneClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default function UserResumePage() {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6 px-4">
      <h1 className="text-2xl font-bold">Upload Your Resume</h1>
      <Card>
        <CardContent>
          <DropzoneClient />
        </CardContent>
        <Suspense>
          <ResumeDetails />
        </Suspense>
      </Card>
      <Suspense>
        <AISummaryCard />
      </Suspense>
    </div>
  );
}

async function ResumeDetails() {
  const { userId } = await getCurrentUser();

  if (userId == null) return notFound();

  const responseUserResume = await getUserResume({ userId });

  if (
    !responseUserResume ||
    responseUserResume.success === false ||
    responseUserResume.data?.resumeFileUrl == null
  )
    return null;

  const userResume = responseUserResume.data;

  return (
    <CardFooter>
      <Button asChild>
        <Link
          href={userResume.resumeFileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Resume
        </Link>
      </Button>
    </CardFooter>
  );
}

async function AISummaryCard() {
  return null;
}
