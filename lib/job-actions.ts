import type { JobStatus } from "@/lib/types";

export type JobActionId = "edit" | "pause" | "close" | "resume" | "duplicate" | "delete";

export interface JobAction {
  id: JobActionId;
  label: string;
  danger?: boolean;
}

const edit: JobAction = { id: "edit", label: "Edit Job" };
const pause: JobAction = { id: "pause", label: "Pause Job" };
const close: JobAction = { id: "close", label: "Close Job" };
const resume: JobAction = { id: "resume", label: "Resume Job" };
const duplicate: JobAction = { id: "duplicate", label: "Duplicate" };
const remove: JobAction = { id: "delete", label: "Delete", danger: true };

/** Actions for a job status, top to bottom. Delete is always last. Expired has no resume. */
export function actionsForStatus(status: JobStatus): JobAction[] {
  switch (status) {
    case "draft":
      return [edit, duplicate, remove];
    case "pending_review":
      return [duplicate, remove];
    case "active":
      return [edit, pause, close, duplicate, remove];
    case "returned":
      return [edit, duplicate, remove];
    case "paused":
      return [resume, edit, close, duplicate, remove];
    case "expired":
      return [edit, duplicate, remove];
    case "closed":
      return [resume, edit, duplicate, remove];
  }
}
