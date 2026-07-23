// Washer "porthole" mark. The inner drum group spins when the card is in use
// (driven by the `.is-in_use .drum__spin` CSS rule on the parent).
export function DrumIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.35"
      />
      <g className="drum__spin">
        <circle cx="12" cy="12" r="5.4" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="9.6" cy="9.6" r="1.15" fill="currentColor" />
        <circle cx="14.4" cy="9.9" r="0.85" fill="currentColor" opacity="0.7" />
      </g>
    </svg>
  );
}
