import type { Metadata } from "next";
import { ApplicantsView } from "@/components/applicants/applicants-view";

export const metadata: Metadata = { title: "Job applicants" };

export default async function JobApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApplicantsView jobId={id} />;
}
