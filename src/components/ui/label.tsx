import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariants = cva(
  "font-medium leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      size: {
        default: "text-xs uppercase",
        lg: "text-sm uppercase",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, size, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(labelVariants({ size }), className)}
      {...props}
    />
  )
);
Label.displayName = "Label";

export { Label };
