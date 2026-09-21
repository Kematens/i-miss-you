import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Feather, Wand2 } from 'lucide-react';
import { DoodleCanvas } from './DoodleCanvas';
import { CoupleDuel } from './CoupleDuel';

export const TrialHub: React.FC = () => {
  const [subMode, setSubMode] = useState<'duel' | 'canvas'>('duel');

  const handleSwitch = (mode: 'duel' | 'canvas') => {
    setSubMode(mode);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15]);
      } catch {}
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-3 font-serif select-none">
      {/* Victorian Dual Segment Switcher */}
      <div className="px-4 sm:px-5">
        <div className="p-1 rounded-2xl bg-[#FCF9F2]/90 border border-[#D4AF37]/45 shadow-sm flex items-center gap-1">
          
          {/* Mode 1: Dueling Club */}
          <button
            onClick={() => handleSwitch('duel')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-serif font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
              subMode === 'duel'
                ? 'text-[#FFFDF5]'
                : 'text-[#8C7658] hover:text-[#2C241E]'
            }`}
          >
            {subMode === 'duel' && (
              <motion.div
                layoutId="trial-mode-pill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#8C1D35] to-[#6B1226] border border-[#D4AF37]/50 shadow-xs"
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              />
            )}
            <Wand2 className="w-3.5 h-3.5 relative z-10 text-[#FFE599]" />
            <span className="relative z-10 font-cinzel">闪回咒对决 · DUEL</span>
          </button>

          {/* Mode 2: Quill Lumos Parchment */}
          <button
            onClick={() => handleSwitch('canvas')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-serif font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
              subMode === 'canvas'
                ? 'text-[#FFFDF5]'
                : 'text-[#8C7658] hover:text-[#2C241E]'
            }`}
          >
            {subMode === 'canvas' && (
              <motion.div
                layoutId="trial-mode-pill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#8C1D35] to-[#6B1226] border border-[#D4AF37]/50 shadow-xs"
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              />
            )}
            <Feather className="w-3.5 h-3.5 relative z-10 text-[#FFE599]" />
            <span className="relative z-10 font-cinzel">金墨传情 · QUILL</span>
          </button>
        </div>
      </div>

      {/* Main Mode Stage */}
      <AnimatePresence mode="wait">
        {subMode === 'duel' ? (
          <motion.div
            key="duel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <CoupleDuel />
          </motion.div>
        ) : (
          <motion.div
            key="canvas"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <DoodleCanvas />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
