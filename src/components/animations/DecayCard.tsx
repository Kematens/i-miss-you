import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface DecayCardProps {
  children: React.ReactNode;
  className?: string;
  tiltFactor?: number;
}

export const DecayCard: React.FC<DecayCardProps> = ({
  children,
  className = '',
  tiltFactor = 12
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [tiltFactor, -tiltFactor]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-tiltFactor, tiltFactor]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      style={{ perspective: 800 }}
      className={`relative select-none ${className}`}
      onPointerEnter={() => setIsHovered(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <motion.div
        ref={cardRef}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
        animate={{
          scale: isHovered ? 1.015 : 1
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative will-change-transform"
      >
        {children}

        {/* Dynamic Light Sheen on 3D Tilt */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-transparent"
            style={{ mixBlendMode: 'overlay' }}
          />
        )}
      </motion.div>
    </div>
  );
};
