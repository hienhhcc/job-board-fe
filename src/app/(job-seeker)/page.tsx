import JobListingItems from "@/features/job-listings/components/JobListingItems";

type HomePageProps = PageProps<"/">;

export default function HomePage({ searchParams }: HomePageProps) {
  return (
    <div className="m-4">
      <JobListingItems searchParamsPromise={searchParams} />
    </div>
  );
}
