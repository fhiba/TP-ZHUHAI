/** Shared laundry marks — custom porthole language, not stock icons. */

type MarkProps = { size?: number };

/** Front-loader porthole with a quiet water crescent. Spins when `.is-in_use`. */
export function WasherMark({ size = 22 }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
    >
      <rect
        x="3.5"
        y="3.5"
        width="25"
        height="25"
        rx="8"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.28"
      />
      <circle
        cx="16"
        cy="16"
        r="8.2"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.55"
      />
      <g className="mark-spin">
        <circle cx="16" cy="16" r="5.6" stroke="currentColor" strokeWidth="1.35" />
        <path
          d="M11.2 17.4c1.1 2.2 2.8 3.3 4.8 3.3s3.7-1.1 4.8-3.3"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          opacity="0.85"
        />
        <circle cx="13.2" cy="13.1" r="1.05" fill="currentColor" />
        <circle cx="18.4" cy="12.6" r="0.75" fill="currentColor" opacity="0.65" />
      </g>
    </svg>
  );
}

/** Twin porthole with warm airflow trails. Spins gently when `.is-in_use`. */
export function DryerMark({ size = 22 }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
    >
      <rect
        x="3.5"
        y="3.5"
        width="25"
        height="25"
        rx="8"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.28"
      />
      <circle
        cx="16"
        cy="16"
        r="8.2"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.55"
      />
      <g className="mark-spin">
        <path
          d="M11 12.5c2.2-1.4 4.4-1.4 6.6 0"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M10.2 16c2.8-1.7 5.6-1.7 8.4 0"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M11 19.5c2.2-1.4 4.4-1.4 6.6 0"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.55"
        />
      </g>
    </svg>
  );
}

/**
 * App brand mark — cycle + porthole monogram for the blue tile.
 * Reads as “laundry in motion”, not a stock washer glyph.
 */
export function BrandMark({ size = 20 }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
    >
      {/* soft orbit */}
      <circle
        cx="16"
        cy="16"
        r="11"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.28"
        strokeDasharray="3.2 2.4"
      />
      {/* porthole */}
      <circle cx="16" cy="16" r="7" stroke="currentColor" strokeWidth="1.85" />
      {/* water crescent */}
      <path
        d="M12.2 17.6c1.15 2.1 2.7 3.15 3.8 3.15"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
      {/* cycle tick */}
      <path
        d="M22.6 10.8a10.2 10.2 0 0 1 2.1 7.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M23.05 16.4l1.55 2.05-2.35.35"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="14.35" cy="13.4" r="1.15" fill="currentColor" />
    </svg>
  );
}

/** @deprecated alias — prefer BrandMark in chrome, WasherMark in lists */
export function DrumIcon({ size = 24 }: { size?: number }) {
  return <BrandMark size={size} />;
}
