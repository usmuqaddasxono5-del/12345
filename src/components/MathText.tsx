import React from 'react';

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Renders trigonometric expressions and fractions cleanly:
 * - Fractions like "1/2", "√3/2", "√2/2", "√3/3", "π/6", "2π/3", "3π/4", "5π/6", "3π/2", "-1/2", "-√3/2", "-√2/2"
 * - Keeps spaces around "/" (e.g. "sinα / cosα") readable as clean inline division or compact fraction
 */
export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  // Exact standalone fraction tokens (optional leading minus, numerator, slash, denominator without spaces)
  const trimmed = text.trim();
  const fractionMatch = trimmed.match(/^(-?[√π\d]+)\/(\d+)$/);

  if (fractionMatch) {
    const [, num, den] = fractionMatch;
    const isNeg = num.startsWith('-');
    const cleanNum = isNeg ? num.slice(1) : num;
    return (
      <span className={`inline-flex items-center justify-center gap-0.5 leading-none ${className}`}>
        {isNeg && <span className="font-extrabold mr-0.5">−</span>}
        <span className="inline-flex flex-col items-center justify-center align-middle">
          <span className="px-1 pb-0.5 border-b-2 border-current text-[0.82em] font-extrabold leading-none">
            {cleanNum}
          </span>
          <span className="px-1 pt-0.5 text-[0.82em] font-extrabold leading-none">
            {den}
          </span>
        </span>
      </span>
    );
  }

  // Inline fractions inside questions like "π/6 radian necha gradusga teng?"
  const parts = text.split(/(\b\d*π\/\d+\b|π\/\d+)/g);
  if (parts.length > 1) {
    return (
      <span className={`inline-flex flex-wrap items-center justify-center gap-x-1.5 ${className}`}>
        {parts.map((part, idx) => {
          const m = part.match(/^(\d*π)\/(\d+)$/);
          if (m) {
            return (
              <span key={idx} className="inline-flex flex-col items-center justify-center align-middle mx-0.5">
                <span className="px-1 pb-0.5 border-b-2 border-current text-[0.72em] font-extrabold leading-none">
                  {m[1]}
                </span>
                <span className="px-1 pt-0.5 text-[0.72em] font-extrabold leading-none">
                  {m[2]}
                </span>
              </span>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </span>
    );
  }

  return <span className={className}>{text}</span>;
};
