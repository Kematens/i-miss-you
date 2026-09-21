import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Feather, Wand2, Zap, Crown } from 'lucide-react';
import { DoodleCanvas } from './DoodleCanvas';
import { CoupleDuel } from './CoupleDuel';
import { SnitchGame } from './SnitchGame';
import { RuneChess } from './RuneChess';

export type TrialSubMode = 'snitch' | 'chess' | 'duel' | 'canvas';

export const TrialHub: React.FC = () => {
  const [subMode, setSubMode] = useState<TrialSubMode>('snitch');

  const handleSwitch = (mode: TrialSubMode) => {
    setSubMode(mode);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15]);
      } catch {}
    }
  };

  const navItems = [
    { id: 'snitch' as TrialSubMode, label: '追逐飞贼', icon: Zap },
    { id: 'chess' as TrialSubMode, label: '如尼连珠', icon: Crown },
    { id: 'duel' as TrialSubMode, label: '闪回对决', icon: Wand2 },
    { id: 'canvas' as TrialSubMode, label: '金墨传情', icon: Feather }
  ];

  return (
    <div className="w-full max-w-md mx-auto space-y-3 font-serif select-none">
      {/* Victorian 4-Segment Arena Switcher */}
      <div className="px-4 sm:px-5">
        <div className="p-1 rounded-2xl bg-[#FCF9F2]/90 border border-[#D4AF37]/45 shadow-sm grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = subMode === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSwitch(item.id)}
                className={`py-2 px-1 rounded-xl text-[11px] font-serif font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer relative ${
                  isActive ? 'text-[#FFFDF5]' : 'text-[#8C7658] hover:text-[#2C241E]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="trial-mode-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#8C1D35] to-[#6B1226] border border-[#D4AF37]/50 shadow-xs"
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-[#FFE599]' : ''}`} />
                <span className="relative z-10 leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Mode Stage */}
      <AnimatePresence mode="wait">
        {subMode === 'snitch' && (
          <motion.div
            key="snitch"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <SnitchGame />
          </motion.div>
        )}

        {subMode === 'chess' && (
          <motion.div
            key="chess"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <RuneChess />
          </motion.div>
        )}

        {subMode === 'duel' && (
          <motion.div
            key="duel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <CoupleDuel />
          </motion.div>
        )}

        {subMode === 'canvas' && (
          <motion.div
            key="canvas"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <DoodleCanvas />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
