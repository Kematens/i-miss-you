import React from 'react';
import { motion, Variants } from 'framer-motion';

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
}

export const BlurText: React.FC<BlurTextProps> = ({
  text,
  delay = 50,
  className = '',
  animateBy = 'words'
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delay / 1000
      }
    }
  };

  const childVariants: Variants = {
    hidden: {
      opacity: 0,
      filter: 'blur(8px)',
      y: 6
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {elements.map((el, i) => (
        <motion.span
          key={i}
          variants={childVariants}
          className="inline-block"
        >
          {el}
          {animateBy === 'words' && i !== elements.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </motion.span>
  );
};
