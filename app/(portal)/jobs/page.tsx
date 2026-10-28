import type { Metadata } from "next";
import { JobsView } from "@/components/jobs/jobs-view";

export const metadata: Metadata = { title: "My Jobs" };

export default function JobsPage() {
  return <JobsView />;
}
