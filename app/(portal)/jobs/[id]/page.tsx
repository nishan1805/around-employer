import type { Metadata } from "next";
import { JobDetailView } from "@/components/jobs/job-detail-view";

export const metadata: Metadata = { title: "Job details" };

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JobDetailView id={id} />;
}
