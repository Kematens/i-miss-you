import React from 'react';

interface CircularTextProps {
  text: string;
  spinDuration?: number;
  className?: string;
  radius?: number;
}

export const CircularText: React.FC<CircularTextProps> = ({
  text,
  spinDuration = 26,
  className = '',
  radius = 82
}) => {
  const letters = Array.from(text);
  const angleStep = 360 / letters.length;

  return (
    <div
      className={`relative flex items-center justify-center pointer-events-none select-none animate-spin ${className}`}
      style={{ width: radius * 2, height: radius * 2, animationDuration: `${spinDuration}s`, transform: 'translateZ(0)' }}
    >
      {letters.map((letter, i) => {
        const angle = i * angleStep;
        return (
          <span
            key={i}
            className="absolute font-cinzel text-[9.5px] font-bold tracking-[0.22em] text-[#9E7B35] uppercase"
            style={{
              transform: `rotate(${angle}deg) translateY(-${radius}px)`,
              transformOrigin: 'center center'
            }}
          >
            {letter}
          </span>
        );
      })}
    </div>
  );
};
