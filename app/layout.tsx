import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { EmployerProvider } from "@/components/employer/provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "Around Jobs", template: "%s · Around Jobs" },
  description: "Employer portal for posting jobs and reviewing applicants on Around.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light">
      <body className={`${inter.variable} font-sans antialiased`}>
        <EmployerProvider>{children}</EmployerProvider>
      </body>
    </html>
  );
}
