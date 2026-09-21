import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Check, Sparkles, Zap, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClickSpark } from '../animations/ClickSpark';

interface Question {
  id: number;
  title: string;
  quote: string;
  optionA: string;
  optionB: string;
  partnerChoice: 'A' | 'B';
}

export const CoupleDuel: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [myChoice, setMyChoice] = useState<'A' | 'B' | null>(null);

  const questions: Question[] = [
    {
      id: 1,
      title: '壁炉火光摇曳的霍格莫德冬夜，更期盼哪种共处时光？',
      quote: '“在风雪止息之前，唯有两颗心跳隔空同频。”',
      optionA: '并肩披着柔软羊毛毯，沉浸于同一卷老电影或魔典',
      optionB: '在暖黄烛光前温一壶热茶，轻声长谈心底隐秘波澜',
      partnerChoice: 'A'
    },
    {
      id: 2,
      title: '踏入国王十字车站九又四分之三站台，想一起奔赴哪里？',
      quote: '“每一张特快列车车票，都载着未完待续的心事。”',
      optionA: '霍格沃茨黑湖之畔，吹着晚风静静看星辰倒影',
      optionB: '对角巷石板老街，牵手漫步在黄油啤酒与羊皮纸香气里',
      partnerChoice: 'B'
    },
    {
      id: 3,
      title: '遭遇现实的风雨与疲惫心事时，更渴盼对方如何回应？',
      quote: '“无声的庇护，胜过一千道冗长的防御魔咒。”',
      optionA: '无言的紧紧相拥片刻，在怀中放下所有防备',
      optionB: '促膝倾听直至夜深，为彼此解开心结与迷惘',
      partnerChoice: 'A'
    }
  ];

  const q = questions[currentQuestionIndex];
  const isRevealed = myChoice !== null;
  const isMatch = isRevealed && myChoice === q.partnerChoice;

  const handleSelect = (choice: 'A' | 'B') => {
    setMyChoice(choice);

    if (choice === q.partnerChoice) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([30, 40, 80, 100]); // Priori Incantatem Golden Resonance
        } catch {}
      }

      confetti({
        particleCount: 50,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#FFE599', '#D4AF37', '#FFF2CE', '#AA822A', '#8C1D35']
      });
    } else {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([20, 20]);
        } catch {}
      }
    }
  };

  const handleNextQuestion = () => {
    setMyChoice(null);
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-5 font-serif select-none">
      <div className="relative rounded-3xl border border-[#D4AF37]/50 bg-[#FCF9F2]/95 shadow-[0_16px_36px_-6px_rgba(45,30,15,0.09)] p-5 sm:p-6 text-[#2C241E] overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#D9C89E]/60 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#8C1D35] border border-[#D4AF37]/50 text-[#F5E8BE] flex items-center justify-center shadow-xs">
              <Wand2 className="w-4 h-4 text-[#FFE599]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-cinzel tracking-[0.2em] text-[#8C7658] block leading-none">
                  DUELLING CLUB · 闪回咒对决
                </span>
                <span className="text-[8px] px-1.5 py-0.2 rounded bg-[#D4AF37]/15 text-[#8C1D35] font-cinzel border border-[#D4AF37]/30">
                  TRIAL 0{q.id}
                </span>
              </div>
              <h2 className="text-xs font-bold text-[#2C241E] font-serif mt-0.5">
                双杖心念试炼 · 探察默契同频
              </h2>
            </div>
          </div>
          <span className="text-[10px] text-[#C5A059] font-cinzel tracking-wider font-bold">
            RESONANCE
          </span>
        </div>

        {/* ========================================================
            1. PRIORI INCANTATEM WAND STAGE (双杖闪回咒交锋台)
        ======================================================== */}
        <div className="relative rounded-2xl p-4 bg-gradient-to-b from-[#141F30] via-[#0E1724] to-[#080E18] border border-[#D4AF37]/45 text-[#F5EBD9] overflow-hidden mb-4 shadow-inner">
          
          {/* Wand Duelling Crossbeam */}
          <div className="flex items-center justify-between relative z-10 px-2">
            
            {/* Left Wand: ME (冬青木魔杖) */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-[#D4AF37] p-0.5 bg-[#101A29] shadow-[0_0_10px_rgba(212,175,55,0.6)]">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop"
                  alt="Me"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-cinzel text-[#FFE599] font-bold block leading-none">ME · 冬青木</span>
                <span className="text-[8px] text-[#A8987E] font-serif">心念蓄势</span>
              </div>
            </div>

            {/* Central Magic Arc Core */}
            <div className="flex flex-col items-center">
              {isRevealed ? (
                isMatch ? (
                  <motion.div
                    initial={{ scale: 0.5, rotate: -20 }}
                    animate={{ scale: [1, 1.25, 1], rotate: 0 }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFE599] flex items-center justify-center shadow-[0_0_20px_#FFE599]"
                  >
                    <Zap className="w-4 h-4 text-[#8C1D35]" />
                  </motion.div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#182638] border border-[#D4AF37]/50 flex items-center justify-center text-xs">
                    ⚖️
                  </div>
                )
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#182638] border border-[#D4AF37]/30 flex items-center justify-center text-[10px] font-cinzel text-[#FFE599]">
                  VS
                </div>
              )}
            </div>

            {/* Right Wand: HER (葡萄藤木魔杖) */}
            <div className="flex items-center gap-2 flex-row-reverse">
              <div className="w-8 h-8 rounded-full border border-[#FFE599] p-0.5 bg-[#101A29] shadow-[0_0_10px_rgba(140,29,53,0.8)]">
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop"
                  alt="Her"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="text-right">
                <span className="text-[9px] font-cinzel text-[#FFE599] font-bold block leading-none">HER · 葡萄藤木</span>
                <span className="text-[8px] text-[#A8987E] font-serif">心念蓄势</span>
              </div>
            </div>
          </div>

          {/* Golden Priori Incantatem Connecting Streamers */}
          {isRevealed && isMatch && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-[#D4AF37] via-[#FFFDF5] to-[#D4AF37] shadow-[0_0_16px_#FFE599] pointer-events-none z-0"
            />
          )}

          {/* Prompt Quote Banner */}
          <div className="mt-3.5 pt-2.5 border-t border-[#D4AF37]/20 text-center">
            <h3 className="text-xs font-serif font-bold text-[#F5EBD9] leading-relaxed">
              {q.title}
            </h3>
            <p className="text-[9.5px] text-[#C5A059] font-serif italic mt-0.5">
              {q.quote}
            </p>
          </div>
        </div>

        {/* ========================================================
            2. INTERACTIVE OPTION CARDS (心念投掷卡片)
        ======================================================== */}
        <div className="space-y-2.5">
          {/* Option A */}
          <ClickSpark sparkColors={['#FFE599', '#D4AF37', '#8C1D35']} sparkCount={8}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => !isRevealed && handleSelect('A')}
              disabled={isRevealed}
              className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all font-serif cursor-pointer ${
                myChoice === 'A'
                  ? 'bg-gradient-to-r from-[#FAF5EB] to-[#F4EBD9] border-[#D4AF37] shadow-sm'
                  : 'bg-[#FAF6EE] border-[#D9C89E]/70 hover:border-[#D4AF37]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#EADBC4]/70 border border-[#D9C89E] flex items-center justify-center text-[10px] font-cinzel font-bold text-[#8C1D35]">
                  A
                </span>
                <span className="text-xs text-[#2C241E] leading-relaxed font-medium">
                  {q.optionA}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 pl-2">
                {isRevealed && q.partnerChoice === 'A' && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#8C1D35] text-[#FFFDF5] font-cinzel font-bold tracking-wider shadow-2xs">
                    HER CHOICE
                  </span>
                )}
                {myChoice === 'A' && (
                  <span className="w-4 h-4 rounded-full bg-[#D4AF37] text-[#182638] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
            </motion.button>
          </ClickSpark>

          {/* Option B */}
          <ClickSpark sparkColors={['#FFE599', '#D4AF37', '#8C1D35']} sparkCount={8}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => !isRevealed && handleSelect('B')}
              disabled={isRevealed}
              className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all font-serif cursor-pointer ${
                myChoice === 'B'
                  ? 'bg-gradient-to-r from-[#FAF5EB] to-[#F4EBD9] border-[#D4AF37] shadow-sm'
                  : 'bg-[#FAF6EE] border-[#D9C89E]/70 hover:border-[#D4AF37]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#EADBC4]/70 border border-[#D9C89E] flex items-center justify-center text-[10px] font-cinzel font-bold text-[#8C1D35]">
                  B
                </span>
                <span className="text-xs text-[#2C241E] leading-relaxed font-medium">
                  {q.optionB}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 pl-2">
                {isRevealed && q.partnerChoice === 'B' && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#8C1D35] text-[#FFFDF5] font-cinzel font-bold tracking-wider shadow-2xs">
                    HER CHOICE
                  </span>
                )}
                {myChoice === 'B' && (
                  <span className="w-4 h-4 rounded-full bg-[#D4AF37] text-[#182638] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
            </motion.button>
          </ClickSpark>
        </div>

        {/* ========================================================
            3. REVELATION BANNER & RESONANCE OUTCOME
        ======================================================== */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`mt-4 p-3.5 rounded-2xl border text-center font-serif ${
                isMatch
                  ? 'bg-gradient-to-r from-[#FAF5EB] to-[#FFFDF9] border-[#D4AF37] text-[#8C1D35] shadow-xs'
                  : 'bg-[#FAF6EE] border-[#D9C89E] text-[#665440]'
              }`}
            >
              {isMatch ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-cinzel tracking-wider font-bold text-[#8C1D35]">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>PRIORI INCANTATEM · 闪回咒金丝交缠 100% 同频</span>
                  </div>
                  <p className="text-[10px] text-[#7A6750] italic">
                    心跳共振，双杖荧光相融 · 此时此刻彼此灵犀相通
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-cinzel tracking-wider font-bold text-[#7A6750]">
                    <span>SWEET HARMONY · 和而不同</span>
                  </div>
                  <p className="text-[10px] text-[#8C7658] italic">
                    各有独到深意 · 今夜罚喝一杯甜暖无糖黄油啤酒 🍺
                  </p>
                </div>
              )}

              <button
                onClick={handleNextQuestion}
                className="mt-2.5 px-3 py-1 rounded-full bg-[#EADBC4]/70 hover:bg-[#EADBC4] text-[#8C1D35] text-[10px] font-cinzel tracking-wider font-bold transition-colors cursor-pointer inline-flex items-center gap-1 border border-[#D9C89E]"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>NEXT DUEL 试炼下一案 ➡️</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
