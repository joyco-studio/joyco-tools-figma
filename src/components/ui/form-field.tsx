import * as React from "react";
import { cn } from "../../lib/utils";
import { Label } from "./label";

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, htmlFor, className, children, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
);
FormField.displayName = "FormField";

export { FormField };
