import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="flex w-full flex-col gap-1.5 text-left">
      {label ? (
        <span className="text-label-medium text-text-secondary">
          {label}
          {required ? <span className="text-error-default"> *</span> : null}
        </span>
      ) : null}
      {children}
      {error ? <span className="text-label-medium text-error-default">{error}</span> : null}
      {!error && hint ? <span className="text-label-medium text-text-tertiary">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <Input {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <Textarea {...props} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <Select {...props} />;
}
