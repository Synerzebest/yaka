'use client';

import { useEffect, useState, type CSSProperties } from 'react';

const confettiColors = ['#12a36d', '#ffc533', '#ff6b57', '#7a5af8', '#2fa8ff', '#ff8fc7'];

/**
 * A short confetti burst. Re-mount it (change its key) to replay. Decorative only:
 * hidden from screen readers and disabled by prefers-reduced-motion in globals.css.
 */
export function Confetti({ pieces = 28 }: { pieces?: number }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1600);
    return () => window.clearTimeout(timer);
  }, []);
  if (!visible) return null;
  return (
    <span className="confetti" aria-hidden="true">
      {Array.from({ length: pieces }, (_, index) => {
        // Deterministic spread: no hydration mismatch and a balanced burst.
        const angle = (index / pieces) * Math.PI * 2;
        const distance = 70 + ((index * 37) % 60);
        const style = {
          '--x': `${Math.cos(angle) * distance}px`,
          '--y': `${Math.sin(angle) * distance - 40}px`,
          '--r': `${(index * 47) % 360}deg`,
          '--c': confettiColors[index % confettiColors.length],
          '--d': `${(index % 5) * 25}ms`,
        } as CSSProperties;
        return <i key={index} style={style} className={index % 3 === 0 ? 'round' : ''} />;
      })}
    </span>
  );
}

/** Counts up to `value` once mounted. Shows the final value immediately when motion is reduced. */
export function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (!value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setShown(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return (
    <>
      {shown}
      {suffix}
    </>
  );
}

const symbols = ['π', '√', 'x²', '÷', '∑', '%', '∞', '½', '△', '+', '≈', 'y'];

/** Maths symbols drifting in the background of a section. */
export function FloatingSymbols({ count = 10, className = '' }: { count?: number; className?: string }) {
  return (
    <span className={`floating-symbols ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => {
        const style = {
          left: `${(index * 53 + 7) % 92}%`,
          top: `${(index * 31 + 11) % 84}%`,
          '--d': `${(index % 6) * 0.7}s`,
          '--t': `${6 + (index % 4)}s`,
          '--s': `${18 + ((index * 7) % 16)}px`,
          '--c': confettiColors[index % confettiColors.length],
        } as CSSProperties;
        return (
          <span key={index} style={style}>
            {symbols[index % symbols.length]}
          </span>
        );
      })}
    </span>
  );
}
