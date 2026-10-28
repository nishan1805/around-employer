import type { Metadata } from "next";
import { PostJobView } from "@/components/jobs/post-job-view";

export const metadata: Metadata = { title: "Post a Job" };

export default function PostJobPage() {
  return <PostJobView />;
}
