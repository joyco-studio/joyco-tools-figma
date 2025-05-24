import * as React from "react";
import { cn } from "../../lib/utils";
import { Label } from "./label";

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, htmlFor, className, disabled, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "space-y-2",
        disabled && "opacity-40 pointer-events-none",
        className
      )}
      {...props}
    >
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
);
FormField.displayName = "FormField";

export { FormField };
