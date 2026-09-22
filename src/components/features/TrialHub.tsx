import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Feather, Wand2, Zap, Crown, Sparkles, Heart, Flame } from 'lucide-react';
import { CoupleDuel } from './CoupleDuel';
import { SnitchGame } from './SnitchGame';
import { RuneChess } from './RuneChess';
import { CodenamesDuet } from './CodenamesDuet';
import { LoveLetterGame } from './LoveLetterGame';
import { MemoryFlipGame } from './MemoryFlipGame';
import { TheMindGame } from './TheMindGame';

export type TrialSubMode = 'themind' | 'memory' | 'codenames' | 'loveletter' | 'snitch' | 'chess' | 'duel' | 'canvas';

export const TrialHub: React.FC = () => {
  const [subMode, setSubMode] = useState<TrialSubMode>('themind');

  const handleSwitch = (mode: TrialSubMode) => {
    setSubMode(mode);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15]);
      } catch {}
    }
  };

  const navItems = [
    { id: 'themind' as TrialSubMode, label: '心灵同步', sub: 'The Mind', icon: Flame },
    { id: 'memory' as TrialSubMode, label: '记忆翻牌', sub: '对对碰', icon: Sparkles },
    { id: 'chess' as TrialSubMode, label: '如尼连珠', sub: '五子棋', icon: Crown },
    { id: 'snitch' as TrialSubMode, label: '追逐飞贼', sub: '抓金球', icon: Zap },
    { id: 'duel' as TrialSubMode, label: '心念对决', sub: '二选一', icon: Wand2 },
    { id: 'loveletter' as TrialSubMode, label: '情书心机', sub: '心理博弈', icon: Feather },
    { id: 'codenames' as TrialSubMode, label: '代号双子', sub: '暗语解谜', icon: Heart }
  ];

  return (
    <div className="w-full max-w-md mx-auto space-y-3 font-serif select-none">
      {/* Victorian Arena Switcher with Scrollable Support */}
      <div className="px-3 sm:px-4">
        <div className="p-1 rounded-2xl bg-[#FCF9F2] border border-[#D4AF37]/45 shadow-sm flex items-center gap-1 overflow-x-auto scrollbar-none" style={{ touchAction: 'pan-x' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = subMode === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSwitch(item.id)}
                className={`flex-1 min-w-[62px] py-1.5 px-1 rounded-xl text-center font-serif transition-transform duration-75 active:scale-95 flex flex-col items-center justify-center gap-0.5 cursor-pointer relative shrink-0 select-none ${
                  isActive ? 'text-[#FFFDF5]' : 'text-[#8C7658] active:text-[#2C241E]'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="trial-mode-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#8C1D35] to-[#6B1226] border border-[#D4AF37]/50 shadow-sm"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    style={{ transform: 'translateZ(0)' }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-[#FFE599]' : ''}`} />
                <span className="relative z-10 text-[10px] font-bold leading-none whitespace-nowrap">{item.label}</span>
                <span className={`relative z-10 text-[8px] scale-90 leading-none whitespace-nowrap ${isActive ? 'text-[#FFE599]/80' : 'text-[#A8987E]'}`}>
                  {item.sub}
                </span>
              </button>
            );
          })}
        </div>

        {/* Online Room Sync Badge Preview */}
        <div className="mt-1.5 flex items-center justify-between px-2.5 py-1 rounded-lg bg-[#FAF5EB] border border-[#D9C89E]/40 text-[9.5px] text-[#8C7658]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>同机对弈模式（面对面同屏）</span>
          </div>
          <span className="font-cinzel text-[#8C1D35] font-bold">
            ⚡ 预留云端联机接口 (P2P/Room)
          </span>
        </div>
      </div>

      {/* Main Mode Stage */}
      <AnimatePresence mode="wait">
        {subMode === 'themind' && (
          <motion.div
            key="themind"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <TheMindGame />
          </motion.div>
        )}

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
