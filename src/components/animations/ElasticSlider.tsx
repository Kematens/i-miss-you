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

  return (
    <div className="relative py-4 select-none touch-none">
      {/* Track Background */}
      <div className="h-3 w-full bg-rose-100/70 rounded-full overflow-hidden p-0.5 shadow-inner">
        {/* Animated Progress Fill */}
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-rose-300 via-rose-400 to-pink-500 shadow-sm"
          style={{ width: `${percentage}%` }}
          animate={{ scaleY: isDragging ? 1.25 : 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        />
      </div>

      {/* Native Range Slider Layer */}
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
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />

      {/* Chewy / Mochi Thumb Indicator */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
        style={{ left: `${percentage}%` }}
        animate={{
          scale: isDragging ? 1.35 : 1,
          scaleX: isDragging ? 1.4 : 1,
          scaleY: isDragging ? 0.8 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      >
        <div className="w-7 h-7 rounded-full bg-white shadow-lg border-2 border-rose-300 flex items-center justify-center">
          <span className="text-[11px] font-bold text-rose-500">
            {value}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
