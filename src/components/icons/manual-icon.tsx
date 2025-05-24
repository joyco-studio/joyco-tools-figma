import * as React from "react";

interface ManualIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function ManualIcon({ className, ...props }: ManualIconProps) {
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
      <circle cx="16" cy="16" r="16" fill="#059669" />
      <path
        d="M12 10H20M12 10V8H20V10M12 10V12M20 10V12"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 14H18V16H14V14Z" fill="white" />
      <path d="M13 18H19V20H13V18Z" fill="white" />
      <path d="M12 22H20V24H12V22Z" fill="white" />
    </svg>
  );
}
