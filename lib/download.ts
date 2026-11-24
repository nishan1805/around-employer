import type { CandidateDetail } from "@/lib/types";

export function downloadFile(content: string, fileName: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadResume(resume: NonNullable<CandidateDetail["resume"]>) {
  const text = resume.pages.map(({ heading, body }) => `${heading}\n${body}`).join("\n\n");
  downloadFile(text, resume.fileName.replace(/\.[^.]+$/, "") + ".txt", "text/plain");
}
