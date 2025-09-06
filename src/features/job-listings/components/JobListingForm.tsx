"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobListingSchema } from "@/features/job-listings/actions/schemas";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";

export default function JobListingForm() {
  const form = useForm({
    resolver: zodResolver(jobListingSchema),
    defaultValues: {
      title: "",
      description: "",
      stateAbbreviation: null,
      city: null,
      wage: null,
      wageInterval: "yearly",
      experienceLevel: "junior",
      type: "full-time",
      locationRequirement: "in-office",
    },
  });

  const onSubmit = (data: z.infer<typeof jobListingSchema>) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 @container"
      ></form>
    </Form>
  );
}
