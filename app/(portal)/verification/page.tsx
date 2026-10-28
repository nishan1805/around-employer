import type { Metadata } from "next";
import { VerificationView } from "@/components/verification/verification-view";

export const metadata: Metadata = { title: "Verification" };

export default function VerificationPage() {
  return <VerificationView />;
}
