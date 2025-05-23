import * as React from "react";

interface JoycoLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function JoycoLogo({
  className,
  width = 24,
  height = 24,
}: JoycoLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_7_8)">
        <path
          d="M254.917 264.878C279.749 264.878 299.879 244.748 299.879 219.917C299.879 195.085 279.749 174.955 254.917 174.955C230.085 174.955 209.956 195.085 209.956 219.917C209.956 244.748 230.085 264.878 254.917 264.878Z"
          fill="currentColor"
        />
        <path
          d="M452.138 264.888C435.481 264.888 420.922 276.123 416.774 292.234C403.058 345.443 352.177 374.399 299.84 373.69C247.513 374.399 196.622 345.443 182.906 292.234C178.758 276.123 164.189 264.888 147.542 264.888C124.486 264.888 107.226 285.97 111.699 308.585C129.774 399.925 214.802 445.586 299.83 445.624C384.859 445.596 469.887 399.925 487.962 308.585C492.435 285.97 475.175 264.888 452.119 264.888H452.138Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_7_8">
          <rect
            width="377.69"
            height="270.66"
            fill="white"
            transform="translate(111 174.955)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
