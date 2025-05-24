import * as React from "react";

interface AutoIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function AutoIcon({ className, ...props }: AutoIconProps) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="16" cy="16" r="16" fill="#6366F1" />
      <path
        d="M20.5 8.5L18.5 10.5M20.5 8.5L22.5 6.5M20.5 8.5L22.5 10.5M20.5 8.5L18.5 6.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 20L18 14"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="11.5" cy="20.5" r="1.5" fill="white" />
      <path
        d="M24.5 22.5L22.5 24.5M24.5 22.5L26.5 20.5M24.5 22.5L26.5 24.5M24.5 22.5L22.5 20.5"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}
