import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedContentProps {
  children: React.ReactNode;
  distance?: number;
  direction?: 'vertical' | 'horizontal';
  reverse?: boolean;
  duration?: number;
  className?: string;
  keyId?: string | number;
}

export const AnimatedContent: React.FC<AnimatedContentProps> = ({
  children,
  distance = 18,
  direction = 'vertical',
  reverse = false,
  duration = 0.45,
  className = '',
  keyId
}) => {
  const axis = direction === 'vertical' ? 'y' : 'x';
  const offset = reverse ? -distance : distance;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyId}
        initial={{ opacity: 0, [axis]: offset }}
        animate={{ opacity: 1, [axis]: 0 }}
        exit={{ opacity: 0, [axis]: -offset }}
        transition={{
          duration,
          ease: [0.22, 1, 0.36, 1] // Apple fluid spring curve
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
