import { FileText, Upload } from "lucide-react";

export type UploadStatus = "empty" | "uploading" | "uploaded" | "failed" | "cancelled";

/** Figma: Resume Upload / document upload. Code Connect target. */
export function ResumeUpload({
  status,
  fileName,
  progress,
  accept = ".pdf,.png,.jpg,.jpeg",
  onFile,
  onCancel,
  fileAction = "Remove",
}: {
  status: UploadStatus;
  fileName?: string;
  progress?: number;
  accept?: string;
  onFile: (file?: File) => void;
  onCancel?: () => void;
  fileAction?: "Remove" | "Replace";
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
    return (
      <div className="flex items-center gap-[12px] rounded-sm border border-border-default px-[12px] py-[12px] text-body-sm-regular">
        <FileText size={18} className="shrink-0 text-text-secondary" />
        <span className="min-w-[0px] flex-1 truncate">{fileName}</span>
        {fileAction === "Replace" ? (
          <label className="cursor-pointer text-body-sm-semibold text-brand-primary">
            Replace
            <input type="file" className="hidden" accept={accept} onChange={(event) => onFile(event.target.files?.[0])} />
          </label>
        ) : (
          <button type="button" className="text-body-sm-semibold text-error-default" onClick={onCancel}>Remove</button>
        )}
      </div>
    );
  }
  if (status === "failed") {
    return (
      <div className="flex items-center gap-[12px] rounded-sm border border-error-default bg-error-error-50 px-[12px] py-[12px] text-body-sm-regular text-error-default">
        <FileText size={18} className="shrink-0" />
        <span className="min-w-[0px] flex-1 truncate">{fileName || "Upload failed"}</span>
        <label className="cursor-pointer font-semibold">
          Retry
          <input type="file" className="hidden" accept={accept} onChange={(event) => onFile(event.target.files?.[0])} />
        </label>
      </div>
    );
  }
  if (status === "cancelled") {
    return <p className="rounded-sm border border-border-default px-[12px] py-[12px] text-body-sm-regular">Upload cancelled.</p>;
  }
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-[8px] py-[8px] text-center text-body-sm-regular text-text-secondary">
      <Upload size={20} className="text-text-tertiary" aria-hidden />
      <span className="inline-flex h-[40px] items-center rounded-sm border border-border-default bg-white px-[12px] text-body-sm-semibold text-text-primary">Choose file</span>
      <input type="file" className="hidden" accept={accept} onChange={(event) => onFile(event.target.files?.[0])} />
    </label>
  );
}
