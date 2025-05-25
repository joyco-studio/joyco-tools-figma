import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { Label } from "./label";

const formFieldVariants = cva("", {
  variants: {
    size: {
      sm: "space-y-1.5",
      default: "space-y-2",
      lg: "space-y-3",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface FormFieldProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formFieldVariants> {
  label: string;
  htmlFor?: string;
  disabled?: boolean;
  labelClassName?: string;
  children: React.ReactNode;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      label,
      htmlFor,
      className,
      disabled,
      size,
      labelClassName,
      children,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        formFieldVariants({ size }),
        disabled && "opacity-40 pointer-events-none",
        className
      )}
      {...props}
    >
      <Label htmlFor={htmlFor} size={size} className={labelClassName}>
        {label}
      </Label>
      {children}
    </div>
  )
);
FormField.displayName = "FormField";

export { FormField };
