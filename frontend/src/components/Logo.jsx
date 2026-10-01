import { useId } from "react";

/**
 * WFX AI ERP brand mark — a precise geometric "W" monogram on an ink -> teal
 * tile. Symmetric, sharp miter joins, flat terminals, no ornament. The same
 * mark is the browser favicon (public/favicon.svg — keep the two in sync).
 */
export function Logo({ className = "h-12 w-12" }) {
  const id = useId().replace(/:/g, "");

  return (
    <svg
      aria-label="WFX AI ERP"
      className={className}
      fill="none"
      role="img"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${id}-tile`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#102227" />
          <stop offset="100%" stopColor="#0b7ea3" />
        </linearGradient>
      </defs>
      <rect fill={`url(#${id}-tile)`} height="46" rx="12" width="46" x="1" y="1" />
      <rect height="45" rx="11.5" stroke="#ffffff" strokeOpacity="0.08" width="45" x="1.5" y="1.5" />
      <path
        d="M10.5 16 L17.25 32 L24 22.5 L30.75 32 L37.5 16"
        stroke="#f8faf9"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit="10"
        strokeWidth="3.8"
      />
    </svg>
  );
}
