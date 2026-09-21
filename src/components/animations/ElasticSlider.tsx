import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ElasticSliderProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const ElasticSlider: React.FC<ElasticSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const percentage = Math.round(((value - min) / (max - min)) * 100);

  const handleSliderChange = (newVal: number) => {
    onChange(newVal);
    // Subtle mechanical haptic gear tick
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (newVal % 5 === 0) {
        try {
          navigator.vibrate([12]);
        } catch {}
      }
    }
  };

  return (
    <div className="relative py-4 select-none touch-none">
      {/* Victorian Brass Track Bed */}
      <div className="h-3.5 w-full bg-[#EADBC4] rounded-full overflow-hidden p-0.5 shadow-inner border border-[#D9C89E] relative">
        {/* Fine Brass Ticks Pattern */}
        <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none opacity-40">
          {Array.from({ length: 11 }).map((_, i) => (
            <span
              key={i}
              className={`w-0.5 bg-[#8C7658] rounded-full ${i % 2 === 0 ? 'h-2' : 'h-1'}`}
            />
          ))}
        </div>

        {/* Liquid Ruby & Gold Progress Fill */}
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#8C1D35] shadow-sm relative overflow-hidden"
          style={{ width: `${percentage}%` }}
          animate={{ scaleY: isDragging ? 1.2 : 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        >
          {/* Subtle light shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </motion.div>
      </div>

      {/* Range Input Layer */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onChange={(e) => handleSliderChange(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />

      {/* Ruby & Gold Crown Thumb (Elastic Mochi Physics) */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-20"
        style={{ left: `${percentage}%` }}
        animate={{
          scale: isDragging ? 1.25 : 1,
          scaleX: isDragging ? 1.3 : 1,
          scaleY: isDragging ? 0.85 : 1,
        }}
        transition={{ type: 'spring', stiffness: 450, damping: 22 }}
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-b from-[#FFFDF5] via-[#F4EBD9] to-[#D4AF37] shadow-[0_3px_10px_rgba(140,29,53,0.4)] border-2 border-[#8C1D35] flex items-center justify-center p-0.5">
          <div className="w-full h-full rounded-full bg-[#8C1D35] flex items-center justify-center border border-[#FFE599]/60">
            <span className="text-[10px] font-mono font-bold text-[#FFFDF5]">
              {value}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
