import { DOCUMENT_ACCEPT_LABEL } from "@/src/config/policy";

export type UploadStatus = "empty" | "uploading" | "uploaded" | "failed" | "cancelled";

/** Figma: Resume Upload / document upload. Code Connect target. */
export function ResumeUpload({
  status,
  fileName,
  progress,
  accept = ".pdf,.png,.jpg,.jpeg",
  onFile,
  onCancel,
}: {
  status: UploadStatus;
  fileName?: string;
  progress?: number;
  accept?: string;
  onFile: (file?: File) => void;
  onCancel?: () => void;
}) {
  if (status === "uploading") {
    return (
      <div className="rounded-sm border border-border-default px-[12px] py-[12px] text-body-sm-regular">
        <p>Uploading {fileName}…</p>
        {typeof progress === "number" ? <div className="mt-[8px] h-[4px] overflow-hidden rounded-full bg-grey-grey-200"><div className="h-full bg-brand-primary" style={{ width: `${progress}%` }} /></div> : null}
        {onCancel ? <button className="mt-[8px] text-label-semibold text-brand-primary" onClick={onCancel}>Cancel</button> : null}
      </div>
    );
  }
  if (status === "uploaded") {
    return <p className="rounded-sm border border-border-default px-[12px] py-[12px] text-body-sm-regular">Uploaded · {fileName}</p>;
  }
  if (status === "failed") {
    return (
      <p className="rounded-sm border border-error-default px-[12px] py-[12px] text-body-sm-regular text-error-default">
        Upload failed{fileName ? ` · ${fileName}` : ""}.{" "}
        <label className="cursor-pointer font-semibold">
          Retry
          <input type="file" className="hidden" accept={accept} onChange={(event) => onFile(event.target.files?.[0])} />
        </label>
      </p>
    );
  }
  if (status === "cancelled") {
    return <p className="rounded-sm border border-border-default px-[12px] py-[12px] text-body-sm-regular">Upload cancelled.</p>;
  }
  return (
    <label className="flex h-[128px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border-default px-[16px] text-center text-body-sm-regular text-text-secondary">
      Drop a {DOCUMENT_ACCEPT_LABEL} file
      <input type="file" className="hidden" accept={accept} onChange={(event) => onFile(event.target.files?.[0])} />
    </label>
  );
}
