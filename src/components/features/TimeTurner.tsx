import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles, Clock, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TimeMemory {
  id: string;
  daysAgo: number;
  dateStr: string;
  title: string;
  quote: string;
  vow: string;
}

export const TimeTurner: React.FC = () => {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [selectedMemoryIndex, setSelectedMemoryIndex] = useState(0);

  const memories: TimeMemory[] = [
    {
      id: '1',
      daysAgo: 100,
      dateStr: '初冬 · 初雪降临之夜',
      title: '大衣口袋里的温存',
      quote: '“漫天飞雪落满肩头，你自然地把冰凉的手揣进我的大衣口袋，那一瞬，整个冬天的严寒都被熔化。”',
      vow: '时光回溯刻度 · 珍藏心动'
    },
    {
      id: '2',
      daysAgo: 240,
      dateStr: '盛夏 · 海风微雨的傍晚',
      title: '橘子汽水与并肩长椅',
      quote: '“蝉鸣渐歇的长街尽头，两罐冰镇汽水，长椅上不经意的指尖轻碰，比盛夏的风更令人心颤。”',
      vow: '时光回溯刻度 · 默契如初'
    },
    {
      id: '3',
      daysAgo: 365,
      dateStr: '周年 · 晨曦微露的清晨',
      title: '并肩看第一缕破晓晨光',
      quote: '“那天凌晨四点的日出很美，但我的目光始终落在被晨曦镀上一层暖金色的你侧脸上。”',
      vow: '时光回溯刻度 · 岁月长伴'
    }
  ];

  const currentMemory = memories[selectedMemoryIndex];

  const handleTurnTime = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setRotationAngle((prev) => prev + 360);

    // Tactile tick haptic
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([20, 30, 20]);
      } catch {
        // Fallback
      }
    }

    // Sparkle stardust
    confetti({
      particleCount: 20,
      spread: 55,
      origin: { y: 0.75 },
      colors: ['#D4AF37', '#FFF2CE', '#AA822A']
    });

    setTimeout(() => {
      setSelectedMemoryIndex((prev) => (prev + 1) % memories.length);
      setIsFlipping(false);
    }, 600);
  };

  return (
    <div className="rounded-3xl border border-[#D4AF37]/40 bg-[#FCF9F2] shadow-[0_12px_32px_-6px_rgba(45,30,15,0.08)] p-5 select-none font-serif">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D9C89E]/60 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-2xl bg-[#EADBC4]/80 border border-[#D4AF37]/40 text-[#8C1D35] flex items-center justify-center shadow-xs">
            <Clock className="w-4 h-4 text-[#C5A059]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-cinzel tracking-[0.2em] text-[#8C7658] block leading-none">
                TIME-TURNER · 时间转换器
              </span>
              <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-[#C5A059]/20 text-[#6B1226] font-cinzel">
                HOURGLASS
              </span>
            </div>
            <h3 className="text-xs font-bold text-[#2C241E] font-serif mt-0.5">
              时光回溯 · 往日魔法手札
            </h3>
          </div>
        </div>

        <button
          onClick={handleTurnTime}
          disabled={isFlipping}
          className="px-2.5 py-1.5 rounded-xl bg-[#FAF5EB] hover:bg-[#F4EBD9] border border-[#D4AF37]/40 text-[#8C1D35] text-[10px] font-cinzel tracking-wider flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
        >
          <RotateCcw className={`w-3 h-3 text-[#C5A059] ${isFlipping ? 'animate-spin' : ''}`} />
          TURN BACK
        </button>
      </div>

      {/* Interactive Time-Turner Double-Ring Apparatus & Hourglass Stage */}
      <div className="flex items-center gap-4 bg-[#FAF6EE] border border-[#D9C89E]/70 rounded-2xl p-4 shadow-inner">
        {/* Physical Brass Concentric Rings & Glass Hourglass */}
        <div
          onClick={handleTurnTime}
          className="relative w-24 h-24 shrink-0 flex items-center justify-center cursor-pointer group"
          title="点击拨动时间转换器"
        >
          {/* Outer Astrological Ring with Inscriptions */}
          <motion.div
            animate={{ rotate: rotationAngle }}
            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute inset-0 rounded-full border-2 border-[#D4AF37] flex items-center justify-center shadow-[0_0_12px_rgba(212,175,55,0.25)]"
          >
            {/* 4 Cardinal Brass Rivets */}
            <span className="absolute -top-1 w-2 h-2 rounded-full bg-[#C5A059] border border-[#FFF8DE]" />
            <span className="absolute -bottom-1 w-2 h-2 rounded-full bg-[#C5A059] border border-[#FFF8DE]" />
            <span className="absolute -left-1 w-2 h-2 rounded-full bg-[#C5A059] border border-[#FFF8DE]" />
            <span className="absolute -right-1 w-2 h-2 rounded-full bg-[#C5A059] border border-[#FFF8DE]" />
          </motion.div>

          {/* Inner Counter-Rotating Ring */}
          <motion.div
            animate={{ rotate: -rotationAngle * 1.5 }}
            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute inset-2.5 rounded-full border border-dashed border-[#AA822A]/80 flex items-center justify-center"
          />

          {/* Center Glass Hourglass with Flowing Golden Sand */}
          <motion.div
            animate={{ rotate: isFlipping ? 180 : 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="relative z-10 w-9 h-14 flex flex-col items-center justify-center filter drop-shadow-[0_2px_4px_rgba(45,30,15,0.3)]"
          >
            {/* Top Bulb */}
            <div className="w-7 h-5 rounded-t-full bg-gradient-to-b from-[#FFFDF5]/90 to-[#EADBC4]/70 border border-[#D4AF37] overflow-hidden relative">
              <div
                className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#D4AF37] to-[#F5E8BE] transition-all duration-700 ${
                  isFlipping ? 'h-full' : 'h-1.5'
                }`}
              />
            </div>

            {/* Hourglass Waist */}
            <div className="w-1.5 h-1.5 bg-[#8C1D35] border-y border-[#D4AF37] relative z-20">
              {/* Golden Sand Stream */}
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-[1px] h-3 bg-[#FFE599] mx-auto absolute top-0 left-0 right-0 shadow-[0_0_4px_#D4AF37]"
              />
            </div>

            {/* Bottom Bulb */}
            <div className="w-7 h-5 rounded-b-full bg-gradient-to-t from-[#FFFDF5]/90 to-[#EADBC4]/70 border border-[#D4AF37] overflow-hidden relative">
              <div
                className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#D4AF37] to-[#F5E8BE] transition-all duration-700 ${
                  isFlipping ? 'h-1.5' : 'h-3.5'
                }`}
              />
            </div>
          </motion.div>
        </div>

        {/* Unveiled Past Memory Fragment */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMemory.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-cinzel text-[#8C1D35] font-bold">
                  {currentMemory.dateStr}
                </span>
                <span className="text-[9px] text-[#A8987E] font-mono">
                  -{currentMemory.daysAgo} DAYS
                </span>
              </div>

              <h4 className="text-xs font-bold text-[#2C241E] truncate font-serif">
                {currentMemory.title}
              </h4>

              <p className="text-[11px] text-[#665440] font-serif leading-relaxed line-clamp-3 italic">
                {currentMemory.quote}
              </p>

              <div className="pt-1 flex items-center justify-between text-[9px] text-[#8C7658] font-cinzel">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#C5A059]" />
                  {currentMemory.vow}
                </span>
                <span className="flex items-center gap-0.5 text-[#8C1D35] hover:underline cursor-pointer">
                  <span>下一幕回忆</span>
                  <ChevronRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
