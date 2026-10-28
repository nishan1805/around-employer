import type { Metadata } from "next";
import { CompanyView } from "@/components/company/company-view";

export const metadata: Metadata = { title: "Company Profile" };

export default function CompanyPage() {
  return <CompanyView />;
}
