import { useId, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helpText?: string;
  error?: string;
};

export function Input({ label, helpText, error, id: providedId, className = "", ...props }: InputProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const helpId = helpText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="grid gap-2">
      <label className="font-semibold text-white" htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={`min-h-11 rounded-lg border bg-surface-base px-3 py-2 text-white placeholder:text-brand-100 ${error ? "border-status-error" : "border-border"} ${className}`}
        {...props}
      />
      {helpText && <p id={helpId} className="text-sm text-brand-50">{helpText}</p>}
      {error && <p id={errorId} role="alert" className="text-sm text-red-300">{error}</p>}
    </div>
  );
}
