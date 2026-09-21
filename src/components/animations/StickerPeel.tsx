import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface StickerPeelProps {
  children: React.ReactNode;
  className?: string;
  tag?: string;
}

export const StickerPeel: React.FC<StickerPeelProps> = ({
  children,
  className = '',
  tag
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative group cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(!isHovered)}
    >
      {/* Main card */}
      <motion.div
        className="overflow-hidden rounded-2xl bg-white shadow-md border border-stone-100 transition-all duration-300"
        animate={{
          rotate: isHovered ? -1 : 0,
          scale: isHovered ? 1.02 : 1
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {children}
      </motion.div>

      {/* Decorative Washi Tape / Sticker Corner */}
      {tag && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-100/90 text-amber-800 text-[11px] font-medium tracking-wider rounded-sm shadow-sm rotate-[-2deg] border-t border-b border-amber-200 pointer-events-none select-none">
          {tag}
        </div>
      )}

      {/* Peelable fold effect at bottom right corner */}
      <motion.div
        className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none overflow-hidden"
        animate={{
          opacity: isHovered ? 1 : 0.6
        }}
      >
        <div 
          className="absolute bottom-0 right-0 w-0 h-0 border-solid transition-all duration-300"
          style={{
            borderWidth: isHovered ? '0 0 20px 20px' : '0 0 10px 10px',
            borderColor: 'transparent transparent #f1f5f9 transparent',
            filter: 'drop-shadow(-2px -2px 3px rgba(0,0,0,0.1))'
          }}
        />
      </motion.div>
    </div>
  );
};
