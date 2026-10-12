import type { CSSProperties } from 'react';
export function Icon({
  name,
  size = 20,
  className = '',
  style,
}: {
  name: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const paths: Record<string, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="1.8" />
        <rect x="14" y="14" width="7" height="7" rx="1.8" />
      </>
    ),
    book: (
      <>
        <path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Z" />
        <path d="M12 5v15" />
      </>
    ),
    infinity: <path d="M12 12c-3-5-4-6-6-6a6 6 0 0 0 0 12c2 0 3-1 6-6s4-6 6-6a6 6 0 0 1 0 12c-2 0-3-1-6-6Z" />,
    chart: (
      <>
        <path d="M4 3v17h17M8 15v-4m5 4V7m5 8v-5" />
      </>
    ),
    award: (
      <>
        <circle cx="12" cy="9" r="6" />
        <path d="m8 14-2 8 6-3 6 3-2-8m-4-8 .9 1.8 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3Z" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    down: <path d="m6 9 6 6 6-6" />,
    flame: <path d="M13 2c1 6 7 7 7 13a8 8 0 0 1-16 0c0-3 1-6 4-9 0 4 2 5 2 5s4-4 3-9Zm-1 12c-3 3-3 6 0 6s3-3 0-6Z" />,
    bell: (
      <>
        <path d="M5 9a7 7 0 0 1 14 0c0 7 2 7 2 9H3c0-2 2-2 2-9Zm5 12h4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    bolt: <path d="m13 2-9 12h7l-1 8 10-13h-8l1-7Z" />,
    leaf: (
      <>
        <path d="M20 3C9 1 3 7 5 14s16 8 15-11Z" />
        <path d="M3 21 15 9" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 8a3 3 0 0 1 6 1c0 2-3 2-3 5m0 3h.01" />
      </>
    ),
    settings: (
      <>
        <path d="m9 3-1 3-3 1-2 4 2 2v4l4 2 3-1 3 1 4-2v-4l2-2-2-4-3-1-1-3Z" />
        <circle cx="12" cy="11" r="3" />
      </>
    ),
    star: <path d="m12 3 2.8 5.8 6.4 1-4.6 4.5 1.1 6.4-5.7-3-5.7 3 1.1-6.4L2.8 9.8l6.4-1Z" />,
    calculator: (
      <>
        <rect x="5" y="2" width="14" height="20" rx="3" />
        <path d="M8 6h8M8 11h1m6 0h1m-8 4h1m6 0h1m-8 4h1m6 0h1" />
      </>
    ),
    function: (
      <>
        <path d="M16 3c-4-2-6 1-6 5v8c0 4-2 6-5 4M6 9h10m0 5 5 6m0-6-5 6" />
      </>
    ),
    triangle: (
      <>
        <path d="m12 3 10 18H2L12 3Z" />
        <path d="M6 15v3h3" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3ZM20 2v4m-2-2h4" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {paths[name] || paths.book}
    </svg>
  );
}
