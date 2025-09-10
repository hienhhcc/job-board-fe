import { ActionButton } from "@/components/ActionButton";
import { AsyncIf } from "@/components/AsyncIf";
import { Button } from "@/components/ui/button";
import { deleteJobListing } from "@/features/job-listings/actions/actions";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermission";
import { Trash2Icon } from "lucide-react";

type Props = {
  jobListingId: string;
};

export default function DeleteJobListingButton({ jobListingId }: Props) {
  return (
    <AsyncIf
      condition={() => hasOrgUserPermission("job_listing:delete_job_listing")}
    >
      <Button asChild variant="destructive">
        <ActionButton
          action={deleteJobListing.bind(null, jobListingId)}
          requireAreYouSure
        >
          <Trash2Icon className="size-4" />
          Delete
        </ActionButton>
      </Button>
    </AsyncIf>
  );
}
