import type { Metadata } from "next";
import { CandidateView } from "@/components/applicants/candidate-view";

export const metadata: Metadata = { title: "Candidate" };

export default async function CandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CandidateView id={id} />;
}
