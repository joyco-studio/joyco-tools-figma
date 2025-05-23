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
      minWidth = 1,
      maxWidth,
      style,
      ...props
    },
    ref
  ) => {
    const [inputWidth, setInputWidth] = React.useState(minWidth);
    const sizerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current!);

    const copyInputStyles = React.useCallback(() => {
      if (!inputRef.current || !sizerRef.current) return;

      const inputNode = inputRef.current;
      const sizerNode = sizerRef.current;

      // Copy styles from input to sizer
      const inputStyle = window.getComputedStyle(inputNode);
      const copyStyle = [
        "fontSize",
        "fontFamily",
        "fontWeight",
        "fontStyle",
        "letterSpacing",
        "textTransform",
        "whiteSpace",
        "padding",
        "border",
      ] as const;

      copyStyle.forEach((property) => {
        sizerNode.style[property] = inputStyle[property];
      });
    }, []);

    const updateInputWidth = React.useCallback(() => {
      if (!sizerRef.current) return;

      let newInputWidth = sizerRef.current.scrollWidth + 2; // 2px for cursor

      if (newInputWidth < minWidth) {
        newInputWidth = minWidth;
      } else if (maxWidth && newInputWidth > maxWidth) {
        newInputWidth = maxWidth;
      }

      if (newInputWidth !== inputWidth) {
        setInputWidth(newInputWidth);
      }
    }, [inputWidth, minWidth, maxWidth]);

    React.useEffect(() => {
      copyInputStyles();
      updateInputWidth();
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onValueChange?.(newValue);
    };

    const sizerValue = value || props.placeholder || "";

    return (
      <>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          style={{
            ...style,
            width: inputWidth,
            boxSizing: "border-box",
          }}
          className={cn(
            "bg-transparent border-0 outline-0 ring-0 shadow-none",
            "text-sm font-medium min-w-0",
            "focus:outline-0 focus:ring-0 focus:border-0",
            className
          )}
          {...props}
        />
        <div
          ref={sizerRef}
          className="absolute top-0 left-0 visibility-hidden overflow-scroll whitespace-pre"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            visibility: "hidden",
            height: 0,
            overflow: "scroll",
            whiteSpace: "pre",
            pointerEvents: "none",
          }}
        >
          {sizerValue}
        </div>
      </>
    );
  }
);

AutoResizeInput.displayName = "AutoResizeInput";
