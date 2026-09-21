import React from 'react';
import { motion } from 'framer-motion';

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
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: spinDuration, ease: 'linear' }}
      className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}
      style={{ width: radius * 2, height: radius * 2 }}
    >
      {letters.map((letter, i) => {
        const angle = i * angleStep;
        return (
          <span
            key={i}
            className="absolute font-cinzel text-[9.5px] font-bold tracking-[0.22em] text-[#9E7B35] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]"
            style={{
              transform: `rotate(${angle}deg) translateY(-${radius}px)`,
              transformOrigin: 'center center'
            }}
          >
            {letter}
          </span>
        );
      })}
    </motion.div>
  );
};
