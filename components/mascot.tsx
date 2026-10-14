export type MascotMood = 'idle' | 'happy' | 'thinking' | 'oops';

/**
 * Yaki, the Yaka mascot: a little pebble with a sprout. Purely decorative.
 * Animations (blink, float, bounce, wobble) live in globals.css and stop with prefers-reduced-motion.
 */
export function Mascot({
  mood = 'idle',
  size = 120,
  className = '',
}: {
  mood?: MascotMood;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={`mascot mascot-${mood} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="mascot-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3ccf8e" />
          <stop offset="1" stopColor="#12a36d" />
        </linearGradient>
      </defs>
      <ellipse className="mascot-shadow" cx="60" cy="112" rx="30" ry="5" />
      <g className="mascot-figure">
        <g className="mascot-sprout">
          <path d="M60 22V9" stroke="#0b7a51" strokeWidth="4" strokeLinecap="round" />
          <path d="M60 12c-2-9-12-12-18-8 3 8 11 11 18 8Z" fill="#7ee0a8" />
          <path d="M60 10c3-8 13-10 18-5-4 7-12 9-18 5Z" fill="#3ccf8e" />
        </g>
        {mood === 'happy' ? (
          <>
            <path
              className="mascot-arm"
              d="M20 70c-8-6-10-16-6-22"
              stroke="#12a36d"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              className="mascot-arm mascot-arm-right"
              d="M100 70c8-6 10-16 6-22"
              stroke="#12a36d"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : (
          <>
            <path d="M19 72c-6 4-8 10-5 14" stroke="#12a36d" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M101 72c6 4 8 10 5 14" stroke="#12a36d" strokeWidth="8" strokeLinecap="round" fill="none" />
          </>
        )}
        <path d="M60 20c27 0 44 19 44 47 0 27-18 40-44 40S16 94 16 67c0-28 17-47 44-47Z" fill="url(#mascot-body)" />
        <path d="M60 52c18 0 30 10 30 26 0 15-12 22-30 22S30 93 30 78c0-16 12-26 30-26Z" fill="#ffffff" opacity=".18" />
        <ellipse cx="36" cy="76" rx="7" ry="4.5" fill="#ff8f7a" opacity=".55" />
        <ellipse cx="84" cy="76" rx="7" ry="4.5" fill="#ff8f7a" opacity=".55" />
        <g className="mascot-face">
          {mood === 'happy' && (
            <>
              <path
                d="M38 62q8-10 16 0M66 62q8-10 16 0"
                stroke="#173b2b"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />
              <path d="M46 74q14 18 28 0Z" fill="#173b2b" />
              <path d="M53 81q7 5 14 0q-7-5-14 0Z" fill="#ff8f7a" />
            </>
          )}
          {mood === 'thinking' && (
            <>
              <g className="mascot-eyes">
                <ellipse cx="46" cy="60" rx="7" ry="8.5" fill="#173b2b" />
                <ellipse cx="74" cy="60" rx="7" ry="8.5" fill="#173b2b" />
                <circle cx="49" cy="56" r="2.6" fill="#fff" />
                <circle cx="77" cy="56" r="2.6" fill="#fff" />
              </g>
              <circle cx="64" cy="80" r="4" fill="#173b2b" />
              <path d="M36 46l12-4M84 44l-10-3" stroke="#173b2b" strokeWidth="3.5" strokeLinecap="round" />
              <g className="mascot-bubble">
                <circle cx="104" cy="24" r="13" fill="#fff" stroke="#e2d6c3" strokeWidth="2" />
                <text x="104" y="30" textAnchor="middle" fontSize="17" fontWeight="800" fill="#7a5af8">
                  ?
                </text>
              </g>
            </>
          )}
          {mood === 'oops' && (
            <>
              <g className="mascot-eyes">
                <ellipse cx="46" cy="62" rx="6" ry="7" fill="#173b2b" />
                <ellipse cx="74" cy="62" rx="6" ry="7" fill="#173b2b" />
                <circle cx="48" cy="59" r="2.2" fill="#fff" />
                <circle cx="76" cy="59" r="2.2" fill="#fff" />
              </g>
              <path d="M37 50l14 3M83 50l-14 3" stroke="#173b2b" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M48 82q4-5 8 0t8 0t8 0" stroke="#173b2b" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path className="mascot-drop" d="M93 40c4 6 6 9 6 12a6 6 0 0 1-12 0c0-3 2-6 6-12Z" fill="#7cc8ff" />
            </>
          )}
          {mood === 'idle' && (
            <>
              <g className="mascot-eyes">
                <ellipse cx="46" cy="60" rx="7" ry="8.5" fill="#173b2b" />
                <ellipse cx="74" cy="60" rx="7" ry="8.5" fill="#173b2b" />
                <circle cx="48.5" cy="56.5" r="2.6" fill="#fff" />
                <circle cx="76.5" cy="56.5" r="2.6" fill="#fff" />
              </g>
              <path d="M50 76q10 9 20 0" stroke="#173b2b" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            </>
          )}
        </g>
      </g>
    </svg>
  );
}
