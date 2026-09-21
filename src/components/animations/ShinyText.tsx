import React from 'react';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 4,
  className = ''
}) => {
  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${
        disabled
          ? 'text-stone-700'
          : 'bg-gradient-to-r from-rose-500 via-rose-300 to-rose-600 bg-[length:250%_100%] animate-shine'
      } ${className}`}
      style={{
        animationDuration: `${speed}s`,
        backgroundImage: disabled
          ? 'none'
          : 'linear-gradient(110deg, #e11d48 35%, #fed7aa 50%, #e11d48 65%)'
      }}
    >
      {text}
    </span>
  );
};
