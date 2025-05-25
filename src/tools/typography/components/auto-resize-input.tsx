import * as React from "react";
import { cn } from "@/lib/utils";

interface AutoResizeInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onValueChange?: (value: string) => void;
  className?: string;
  minWidth?: number;
  maxWidth?: number;
}

export const AutoResizeInput = React.forwardRef<
  HTMLInputElement,
  AutoResizeInputProps
>(
  (
    {
      value,
      onValueChange,
      className,
      minWidth = 20,
      maxWidth = 300,
      style,
      ...props
    },
    ref
  ) => {
    const [inputWidth, setInputWidth] = React.useState(minWidth);
    const measureRef = React.useRef<HTMLSpanElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current!);

    const updateWidth = React.useCallback(() => {
      if (!measureRef.current) return;

      const measureElement = measureRef.current;
      const textToMeasure = value || props.placeholder || "";

      // Update the measuring element with current text
      measureElement.textContent = textToMeasure;

      // Get the measured width
      const measuredWidth = measureElement.getBoundingClientRect().width;

      // Add some padding for cursor and breathing room
      let newWidth = Math.ceil(measuredWidth) + 8;

      // Apply min/max constraints
      if (newWidth < minWidth) newWidth = minWidth;
      if (maxWidth && newWidth > maxWidth) newWidth = maxWidth;

      setInputWidth(newWidth);
    }, [value, props.placeholder, minWidth, maxWidth]);

    // Update width when value changes
    React.useEffect(() => {
      updateWidth();
    }, [updateWidth]);

    // Update width on mount and when font loads
    React.useEffect(() => {
      const timer = setTimeout(updateWidth, 0);
      return () => clearTimeout(timer);
    }, [updateWidth]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onValueChange?.(newValue);
    };

    return (
      <div className="relative inline-block">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          style={{
            width: inputWidth,
            ...style,
          }}
          className={cn(
            "bg-transparent border-0 outline-none ring-0 shadow-none",
            "text-sm font-medium min-w-0 px-0",
            "focus:outline-none focus:ring-0 focus:border-0",
            "placeholder:text-muted-foreground",
            className
          )}
          {...props}
        />
        {/* Hidden measuring element */}
        <span
          ref={measureRef}
          className={cn(
            "absolute invisible whitespace-pre text-sm font-medium",
            "pointer-events-none select-none",
            className
          )}
          style={{
            position: "absolute",
            visibility: "hidden",
            whiteSpace: "pre",
            pointerEvents: "none",
            userSelect: "none",
          }}
          aria-hidden="true"
        />
      </div>
    );
  }
);

AutoResizeInput.displayName = "AutoResizeInput";
