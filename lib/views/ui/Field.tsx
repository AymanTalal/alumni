import type { ComponentProps } from "react";

// Shared UI: form pieces. Markup and styling only.
//   Field       → a <label> with its text, the control inside it, and an optional hint / error
//   Input, Textarea, Select → the controls, all with the same look and focus ring
//   FormMessage → the error (red) or success (green) message a form shows after submitting

export const controlClasses =
  "w-full rounded-control border border-border-strong bg-surface px-3 py-2 text-ink " +
  "placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25";

type FieldProps = {
  label: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
};

// The label wraps the control, so clicking the label focuses it and screen readers announce it
export function Field({ label, required, hint, error, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
      {error && <span className="text-sm text-danger">{error}</span>}
    </label>
  );
}

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${controlClasses} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea className={`${controlClasses} ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return <select className={`${controlClasses} ${className}`} {...props} />;
}

// role="alert" makes screen readers read an error out as soon as it appears
export function FormMessage({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  return tone === "error" ? (
    <p role="alert" className="rounded-control bg-danger-soft px-3 py-2 text-sm text-danger">
      {children}
    </p>
  ) : (
    <p role="status" className="rounded-control bg-primary-soft px-3 py-2 text-sm text-primary-hover">
      {children}
    </p>
  );
}
