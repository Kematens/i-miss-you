import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Feather, Wand2, Zap, Crown, Sparkles, Heart } from 'lucide-react';
import { CoupleDuel } from './CoupleDuel';
import { SnitchGame } from './SnitchGame';
import { RuneChess } from './RuneChess';
import { CodenamesDuet } from './CodenamesDuet';
import { LoveLetterGame } from './LoveLetterGame';
import { MemoryFlipGame } from './MemoryFlipGame';

export type TrialSubMode = 'memory' | 'codenames' | 'loveletter' | 'snitch' | 'chess' | 'duel' | 'canvas';

export const TrialHub: React.FC = () => {
  const [subMode, setSubMode] = useState<TrialSubMode>('memory');

  const handleSwitch = (mode: TrialSubMode) => {
    setSubMode(mode);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15]);
      } catch {}
    }
  };

  const navItems = [
    { id: 'memory' as TrialSubMode, label: '记忆对对碰', icon: Sparkles },
    { id: 'chess' as TrialSubMode, label: '如尼连珠', icon: Crown },
    { id: 'snitch' as TrialSubMode, label: '追逐飞贼', icon: Zap },
    { id: 'duel' as TrialSubMode, label: '闪回对决', icon: Wand2 },
    { id: 'codenames' as TrialSubMode, label: '代号双子', icon: Heart },
    { id: 'loveletter' as TrialSubMode, label: '情书心机', icon: Feather }
  ];

  return (
    <div className="w-full max-w-md mx-auto space-y-3 font-serif select-none">
      {/* Victorian Arena Switcher with Scrollable Support */}
      <div className="px-3 sm:px-4">
        <div className="p-1 rounded-2xl bg-[#FCF9F2]/90 border border-[#D4AF37]/45 shadow-sm flex items-center gap-1 overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = subMode === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSwitch(item.id)}
                className={`flex-1 min-w-[56px] py-1.5 px-1 rounded-xl text-[10px] font-serif font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer relative shrink-0 ${
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
                <span className="relative z-10 leading-none whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Mode Stage */}
      <AnimatePresence mode="wait">
        {subMode === 'memory' && (
          <motion.div
            key="memory"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <MemoryFlipGame />
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

        {subMode === 'codenames' && (
          <motion.div
            key="codenames"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <CodenamesDuet />
          </motion.div>
        )}

        {subMode === 'loveletter' && (
          <motion.div
            key="loveletter"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <LoveLetterGame />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
