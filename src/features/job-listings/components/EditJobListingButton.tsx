import { AsyncIf } from "@/components/AsyncIf";
import { Button } from "@/components/ui/button";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermission";
import { Link, EditIcon } from "lucide-react";

type Props = {
  jobListingId: string;
};

export default function EditJobListingButton({ jobListingId }: Props) {
  return (
    <AsyncIf
      condition={() => hasOrgUserPermission("job_listing:update_job_listing")}
    >
      <Button asChild variant="outline">
        <Link href={`/employer/job-listings/${jobListingId}/edit`}>
          <EditIcon className="size-4" />
          Edit
        </Link>
      </Button>
    </AsyncIf>
  );
}
