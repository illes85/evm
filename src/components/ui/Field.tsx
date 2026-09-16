import type { ReactNode } from "react";
import { labelClass } from "../../lib/formStyles";

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}
