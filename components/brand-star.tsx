// The Yaka signature asterisk, drawn as SVG so it looks the same on every device.
// (The ✳ character is turned into a green emoji box on iOS.) Same geometry as app/icon.svg.
// It takes the size and colour of the surrounding text: style it with font-size and color.
export function BrandStar({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`brand-star ${className}`}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 2V22M2 12H22M4.9 4.9L19.1 19.1M4.9 19.1L19.1 4.9"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** A four-point sparkle, used as a decoration next to the landing demo. */
export function Sparkle({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`brand-star ${className}`}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 1.5C12.9 7.6 16.4 11.1 22.5 12 16.4 12.9 12.9 16.4 12 22.5 11.1 16.4 7.6 12.9 1.5 12 7.6 11.1 11.1 7.6 12 1.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
