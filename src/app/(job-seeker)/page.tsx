import JobListingItems from "@/features/job-listings/components/JobListingItems";
import { SearchParamsPromise } from "@/types";

type HomePageProps = { searchParams: SearchParamsPromise };

export default function HomePage({ searchParams }: HomePageProps) {
  return (
    <div className="m-4">
      <JobListingItems searchParamsPromise={searchParams} />
    </div>
  );
}
